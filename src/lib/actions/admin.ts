"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { bugReports } from "@/lib/db/schema";
import {
  attachTask,
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  detachTask,
  moveLesson,
  moveModule,
  moveTask,
  setLessonDemo,
  setTaskDemo,
  updateLesson,
  updateModule,
} from "@/lib/db/content";
import {
  createUser,
  deleteUserById,
  getUserByEmail,
  setPasswordById,
  setUserRole,
} from "@/lib/db/users";
import { getTask } from "@/lib/tasks";
import { requireAdmin } from "@/lib/session";
import type { LessonBlock } from "@/lib/content/types";
import type { QuizQuestion } from "@/lib/runner/types";

export type ActionState = { error?: string; ok?: string };

/**
 * Сбрасываем кеш только там, где данные действительно поменялись.
 * Раньше здесь был revalidatePath("/", "layout"): он обнулял кеш всех
 * маршрутов сразу, и после каждого действия клиент заново тянул десяток
 * страниц, каждую со своими запросами к базе.
 */
function refreshContent() {
  revalidatePath("/", "page");
  revalidatePath("/demo", "page");
  revalidatePath("/admin/modules", "page");
  revalidatePath("/modules/[slug]", "page");
  revalidatePath("/modules/[slug]/lessons/[lessonSlug]", "page");
  revalidatePath("/tasks/[slug]", "page");
}

function refreshUsers() {
  revalidatePath("/admin", "page");
  revalidatePath("/admin/users", "page");
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ---------- Модули ----------

export async function createModuleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const title = text(formData, "title");
  if (!title) return { error: "Введите название модуля" };

  const module = await createModule({ title, description: text(formData, "description") });
  refreshContent();
  redirect(`/admin/modules/${module.id}`);
}

export async function updateModuleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = text(formData, "id");
  const title = text(formData, "title");
  if (!id || !title) return { error: "Название не может быть пустым" };

  await updateModule(id, {
    title,
    description: text(formData, "description"),
    slug: text(formData, "slug"),
  });
  refreshContent();
  return { ok: "Сохранено" };
}

export async function deleteModuleAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  if (id) await deleteModule(id);
  refreshContent();
  redirect("/admin/modules");
}

export async function moveModuleAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (id) await moveModule(id, direction);
  refreshContent();
}

// ---------- Уроки ----------

export async function createLessonAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const title = text(formData, "title") || "Новый урок";
  if (!moduleId) return;

  const lesson = await createLesson(moduleId, title);
  refreshContent();
  redirect(`/admin/modules/${moduleId}/lessons/${lesson.id}`);
}

/**
 * Вопросы теста из формы. Отбрасываем недоделанные: без текста,
 * без двух вариантов или без единого отмеченного верного ответа —
 * иначе такой вопрос нельзя пройти.
 */
function parseQuestions(raw: unknown[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const source = item as Record<string, unknown>;

    if (typeof source.id !== "string" || typeof source.text !== "string") continue;
    if (!source.text.trim() || !Array.isArray(source.options)) continue;

    const options = source.options
      .filter(
        (option): option is { id: string; text: string } =>
          Boolean(option) &&
          typeof option === "object" &&
          typeof (option as { id?: unknown }).id === "string" &&
          typeof (option as { text?: unknown }).text === "string" &&
          Boolean((option as { text: string }).text.trim()),
      )
      .map((option) => ({ id: option.id, text: option.text.trim() }));

    if (options.length < 2) continue;

    const correct = Array.isArray(source.correct)
      ? source.correct.filter(
          (id): id is string =>
            typeof id === "string" && options.some((option) => option.id === id),
        )
      : [];

    if (correct.length === 0) continue;

    questions.push({
      id: source.id,
      text: source.text.trim(),
      options,
      correct,
      explanation:
        typeof source.explanation === "string" && source.explanation.trim()
          ? source.explanation.trim()
          : undefined,
    });
  }

  return questions;
}

function parseBlocks(raw: string): LessonBlock[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const blocks: LessonBlock[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const block = item as Record<string, unknown>;

    if (block.type === "text" && typeof block.markdown === "string") {
      blocks.push({ type: "text", markdown: block.markdown });
    } else if (block.type === "video" && typeof block.url === "string") {
      blocks.push({
        type: "video",
        url: block.url,
        title: typeof block.title === "string" ? block.title : undefined,
        note: typeof block.note === "string" ? block.note : undefined,
      });
    } else if (
      block.type === "article" &&
      typeof block.url === "string" &&
      typeof block.title === "string"
    ) {
      blocks.push({
        type: "article",
        url: block.url,
        title: block.title,
        source: typeof block.source === "string" ? block.source : undefined,
        note: typeof block.note === "string" ? block.note : undefined,
      });
    } else if (block.type === "quiz" && Array.isArray(block.questions)) {
      const questions = parseQuestions(block.questions);
      if (questions.length > 0) {
        blocks.push({
          type: "quiz",
          title: typeof block.title === "string" ? block.title : undefined,
          questions,
        });
      }
    } else if (block.type === "task" && typeof block.slug === "string" && getTask(block.slug)) {
      blocks.push({
        type: "task",
        slug: block.slug,
        note: typeof block.note === "string" ? block.note : undefined,
      });
    }
  }

  return blocks;
}

export async function saveLessonAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = text(formData, "id");
  const title = text(formData, "title");
  if (!id || !title) return { error: "Название урока не может быть пустым" };

  await updateLesson(id, {
    title,
    summary: text(formData, "summary"),
    slug: text(formData, "slug"),
    blocks: parseBlocks(text(formData, "blocks")),
  });

  refreshContent();
  return { ok: "Урок сохранён" };
}

export async function deleteLessonAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  const moduleId = text(formData, "moduleId");
  if (id) await deleteLesson(id);
  refreshContent();
  redirect(`/admin/modules/${moduleId}`);
}

export async function moveLessonAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (id) await moveLesson(id, direction);
  refreshContent();
}

// ---------- Демо-доступ ----------

/** Открыть или закрыть урок в демо: он станет виден без входа на платформу */
export async function setLessonDemoAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  if (id) await setLessonDemo(id, text(formData, "isDemo") === "1");
  refreshContent();
}

export async function setTaskDemoAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const taskSlug = text(formData, "taskSlug");
  if (moduleId && taskSlug) await setTaskDemo(moduleId, taskSlug, text(formData, "isDemo") === "1");
  refreshContent();
}

// ---------- Задачи в модуле ----------

export async function attachTaskAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const taskSlug = text(formData, "taskSlug");
  if (moduleId && taskSlug && getTask(taskSlug)) await attachTask(moduleId, taskSlug);
  refreshContent();
}

export async function detachTaskAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const taskSlug = text(formData, "taskSlug");
  if (moduleId && taskSlug) await detachTask(moduleId, taskSlug);
  refreshContent();
}

export async function moveTaskAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const taskSlug = text(formData, "taskSlug");
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (moduleId && taskSlug) await moveTask(moduleId, taskSlug, direction);
  refreshContent();
}

// ---------- Сообщения о багах ----------

export async function resolveBugAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  if (id) {
    const db = await getDb();
    await db.update(bugReports).set({ resolved: true }).where(eq(bugReports.id, id));
  }
  revalidatePath("/admin/bugs", "page");
}

export async function deleteBugAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  if (id) {
    const db = await getDb();
    await db.delete(bugReports).where(eq(bugReports.id, id));
  }
  revalidatePath("/admin/bugs", "page");
}

// ---------- Пользователи ----------

export async function createUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const email = text(formData, "email");
  const password = text(formData, "password");
  const name = text(formData, "name");
  const roleValue = text(formData, "role");
  const role = roleValue === "admin" || roleValue === "teacher" ? roleValue : "student";

  if (!email || !password) return { error: "Логин и пароль обязательны" };
  if (password.length < 8) return { error: "Пароль должен быть не короче 8 символов" };
  if (await getUserByEmail(email)) return { error: "Такой логин уже занят" };

  await createUser({ email, password, name: name || undefined, role });
  refreshUsers();
  return { ok: `Пользователь ${email} создан` };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = text(formData, "id");
  const password = text(formData, "password");

  if (!id || !password) return { error: "Введите новый пароль" };
  if (password.length < 8) return { error: "Пароль должен быть не короче 8 символов" };

  await setPasswordById(id, password);
  refreshUsers();
  return { ok: "Пароль обновлён" };
}

export async function setRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = text(formData, "id");
  const roleValue = text(formData, "role");
  const role = roleValue === "admin" || roleValue === "teacher" ? roleValue : "student";

  // Себя понизить нельзя: иначе можно остаться без единого администратора
  if (id && id !== admin.id) await setUserRole(id, role);
  refreshUsers();
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = text(formData, "id");
  if (id && id !== admin.id) await deleteUserById(id);
  refreshUsers();
}
