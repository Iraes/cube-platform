// .env.local первым: иначе скрипт уйдёт в локальный PGlite, а не в боевую базу
import "./env";
import fs from "node:fs";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { lessons, modules } from "@/lib/db/schema";
import { attachTask } from "@/lib/db/content";
import { getTask } from "@/lib/tasks";
import type { LessonBlock } from "@/lib/content/types";

/**
 * Добавляет в урок «Промисы и их композиция» разбор «⭐ Под капотом»
 * и задачу про две цепочки.
 *
 * Разовая правка боевого контента, но писана идемпотентной: повторный
 * запуск ничего не продублирует. Уроки правятся в админке, и скрипт здесь
 * только потому, что текст большой и его неудобно вбивать руками.
 */
const MODULE_SLUG = "async-code";
const LESSON_SLUG = "promises";
const TASK_SLUG = "promise-chains-order";
const MARKER = "⭐ Под капотом";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL не задан — скрипт правил бы локальный PGlite. Проверьте .env.local.");
    process.exit(1);
  }

  if (!getTask(TASK_SLUG)) {
    console.error("Задачи " + TASK_SLUG + " нет в каталоге — сначала зарегистрируйте её в src/lib/tasks/index.ts");
    process.exit(1);
  }

  const theory = fs
    .readFileSync(path.join(process.cwd(), "scripts", "content", "promise-chains-theory.md"), "utf8")
    .trimEnd();

  const db = await getDb();

  const [module] = await db.select().from(modules).where(eq(modules.slug, MODULE_SLUG)).limit(1);
  if (!module) {
    console.error("Модуль " + MODULE_SLUG + " не найден");
    process.exit(1);
  }

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.moduleId, module.id), eq(lessons.slug, LESSON_SLUG)))
    .limit(1);
  if (!lesson) {
    console.error("Урок " + LESSON_SLUG + " не найден в модуле " + MODULE_SLUG);
    process.exit(1);
  }

  const blocks: LessonBlock[] = lesson.blocks ?? [];
  const hasTheory = blocks.some((b) => b.type === "text" && b.markdown.includes(MARKER));
  const hasTask = blocks.some((b) => b.type === "task" && b.slug === TASK_SLUG);

  const next = [...blocks];

  if (!hasTheory) {
    // Теория встаёт после теста и перед задачами: сначала разбор, потом практика
    const firstTask = next.findIndex((b) => b.type === "task");
    const at = firstTask === -1 ? next.length : firstTask;
    next.splice(at, 0, { type: "text", markdown: theory });
    console.log("добавлен блок теории на позицию " + at);
  } else {
    console.log("блок теории уже есть — пропускаю");
  }

  if (!hasTask) {
    // Задача последняя: она сложнее остальных в уроке и опирается на разбор выше
    next.push({ type: "task", slug: TASK_SLUG, note: "Предскажите порядок, потом проверяйте" });
    console.log("добавлен блок задачи в конец урока");
  } else {
    console.log("блок задачи уже есть — пропускаю");
  }

  if (next.length !== blocks.length) {
    // Обновляем только blocks: updateLesson пересчитал бы ещё и слаг
    await db.update(lessons).set({ blocks: next }).where(eq(lessons.id, lesson.id));
  }

  await attachTask(module.id, TASK_SLUG);

  console.log("\nУрок «" + lesson.title + "» теперь состоит из:");
  for (const [i, b] of next.entries()) {
    const what =
      b.type === "text" ? "текст — " + b.markdown.slice(0, 48).replace(/\n/g, " ") + "…"
      : b.type === "video" ? "видео — " + (b.title ?? "")
      : b.type === "article" ? "статья — " + b.title
      : b.type === "quiz" ? "тест — " + (b.title ?? "") + ", вопросов " + b.questions.length
      : "задача — " + b.slug + (b.optional ? " (разминка)" : "");
    console.log("  " + String(i + 1).padStart(2) + ". " + what);
  }
}

main();
