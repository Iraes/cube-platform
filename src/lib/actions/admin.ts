"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export type ActionState = { error?: string; ok?: string };

/** Все действия обновляют весь раздел: страниц немного, а связей между ними много */
function refresh() {
  revalidatePath("/", "layout");
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
  refresh();
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
  refresh();
  return { ok: "Сохранено" };
}

export async function deleteModuleAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  if (id) await deleteModule(id);
  refresh();
  redirect("/admin/modules");
}

export async function moveModuleAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (id) await moveModule(id, direction);
  refresh();
}

// ---------- Уроки ----------

export async function createLessonAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const title = text(formData, "title") || "Новый урок";
  if (!moduleId) return;

  const lesson = await createLesson(moduleId, title);
  refresh();
  redirect(`/admin/modules/${moduleId}/lessons/${lesson.id}`);
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

  refresh();
  return { ok: "Урок сохранён" };
}

export async function deleteLessonAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  const moduleId = text(formData, "moduleId");
  if (id) await deleteLesson(id);
  refresh();
  redirect(`/admin/modules/${moduleId}`);
}

export async function moveLessonAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData, "id");
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (id) await moveLesson(id, direction);
  refresh();
}

// ---------- Задачи в модуле ----------

export async function attachTaskAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const taskSlug = text(formData, "taskSlug");
  if (moduleId && taskSlug && getTask(taskSlug)) await attachTask(moduleId, taskSlug);
  refresh();
}

export async function detachTaskAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const taskSlug = text(formData, "taskSlug");
  if (moduleId && taskSlug) await detachTask(moduleId, taskSlug);
  refresh();
}

export async function moveTaskAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const moduleId = text(formData, "moduleId");
  const taskSlug = text(formData, "taskSlug");
  const direction = text(formData, "direction") === "up" ? "up" : "down";
  if (moduleId && taskSlug) await moveTask(moduleId, taskSlug, direction);
  refresh();
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
  refresh();
  return { ok: `Пользователь ${email} создан` };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = text(formData, "id");
  const password = text(formData, "password");

  if (!id || !password) return { error: "Введите новый пароль" };
  if (password.length < 8) return { error: "Пароль должен быть не короче 8 символов" };

  await setPasswordById(id, password);
  refresh();
  return { ok: "Пароль обновлён" };
}

export async function setRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = text(formData, "id");
  const roleValue = text(formData, "role");
  const role = roleValue === "admin" || roleValue === "teacher" ? roleValue : "student";

  // Себя понизить нельзя: иначе можно остаться без единого администратора
  if (id && id !== admin.id) await setUserRole(id, role);
  refresh();
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = text(formData, "id");
  if (id && id !== admin.id) await deleteUserById(id);
  refresh();
}
