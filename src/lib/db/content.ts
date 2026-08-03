import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "./index";
import { courseBlocks, lessons, moduleTasks, modules } from "./schema";
import type { LessonBlock } from "@/lib/content/types";

/**
 * Запись учебных материалов. Читает их слой `@/lib/content`,
 * а сюда ходят только серверные действия админки.
 */

/** Слаг из произвольного заголовка: латиница, цифры и дефисы */
export function toSlug(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  return (
    input
      .toLowerCase()
      .split("")
      .map((char) => map[char] ?? char)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "razdel"
  );
}

async function nextPosition(table: typeof modules | typeof lessons, moduleId?: string) {
  const db = await getDb();

  if (table === lessons && moduleId) {
    const [row] = await db
      .select({ max: sql<number>`coalesce(max(${lessons.position}), -1)` })
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId));
    return (row?.max ?? -1) + 1;
  }

  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${modules.position}), -1)` })
    .from(modules);
  return (row?.max ?? -1) + 1;
}

async function nextBlockPosition() {
  const db = await getDb();
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${courseBlocks.position}), -1)` })
    .from(courseBlocks);
  return (row?.max ?? -1) + 1;
}

export async function createCourseBlock(input: { title: string; description?: string }) {
  const db = await getDb();
  const base = toSlug(input.title);
  let slug = base;
  for (let attempt = 2; ; attempt += 1) {
    const rows = await db.select({ id: courseBlocks.id }).from(courseBlocks).where(eq(courseBlocks.slug, slug)).limit(1);
    if (rows.length === 0) break;
    slug = `${base}-${attempt}`;
  }
  const [row] = await db.insert(courseBlocks).values({
    slug,
    title: input.title,
    description: input.description ?? "",
    position: await nextBlockPosition(),
  }).returning();
  return row;
}

export async function deleteCourseBlock(id: string) {
  const db = await getDb();
  await db.delete(courseBlocks).where(eq(courseBlocks.id, id));
}

export async function moveCourseBlock(id: string, direction: "up" | "down") {
  const db = await getDb();
  const all = await db.select().from(courseBlocks).orderBy(asc(courseBlocks.position), asc(courseBlocks.createdAt));
  const index = all.findIndex((row) => row.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= all.length) return;
  await db.update(courseBlocks).set({ position: swapWith }).where(eq(courseBlocks.id, all[index].id));
  await db.update(courseBlocks).set({ position: index }).where(eq(courseBlocks.id, all[swapWith].id));
}

export async function setModuleBlock(moduleId: string, blockId: string | null) {
  const db = await getDb();
  await db.update(modules).set({ blockId }).where(eq(modules.id, moduleId));
}

/** Свободный слаг: к занятому дописывается -2, -3 и так далее */
async function uniqueModuleSlug(base: string, exceptId?: string): Promise<string> {
  const db = await getDb();
  let candidate = base;

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const rows = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.slug, candidate))
      .limit(1);

    if (rows.length === 0 || rows[0].id === exceptId) return candidate;
    candidate = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

async function uniqueLessonSlug(
  moduleId: string,
  base: string,
  exceptId?: string,
): Promise<string> {
  const db = await getDb();
  let candidate = base;

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const rows = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.moduleId, moduleId), eq(lessons.slug, candidate)))
      .limit(1);

    if (rows.length === 0 || rows[0].id === exceptId) return candidate;
    candidate = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

export async function createModule(input: { title: string; description?: string }) {
  const db = await getDb();

  const [row] = await db
    .insert(modules)
    .values({
      slug: await uniqueModuleSlug(toSlug(input.title)),
      title: input.title,
      description: input.description ?? "",
      position: await nextPosition(modules),
    })
    .returning();

  return row;
}

export async function updateModule(
  id: string,
  input: { title: string; description: string; slug?: string },
) {
  const db = await getDb();

  await db
    .update(modules)
    .set({
      title: input.title,
      description: input.description,
      slug: await uniqueModuleSlug(toSlug(input.slug || input.title), id),
    })
    .where(eq(modules.id, id));
}

/** Витрина: модуль пропадает из списка на платформе и целиком уходит в демо */
export async function setModuleDemoOnly(id: string, isDemoOnly: boolean) {
  const db = await getDb();
  await db.update(modules).set({ isDemoOnly }).where(eq(modules.id, id));
}

export async function deleteModule(id: string) {
  const db = await getDb();
  await db.delete(modules).where(eq(modules.id, id));
}

/** Сдвиг модуля в списке: меняем позиции местами с соседом */
export async function moveModule(id: string, direction: "up" | "down") {
  const db = await getDb();
  const all = await db.select().from(modules).orderBy(asc(modules.position), asc(modules.createdAt));

  const index = all.findIndex((row) => row.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= all.length) return;

  await db.update(modules).set({ position: swapWith }).where(eq(modules.id, all[index].id));
  await db.update(modules).set({ position: index }).where(eq(modules.id, all[swapWith].id));
}

export async function createLesson(moduleId: string, title: string) {
  const db = await getDb();

  const [row] = await db
    .insert(lessons)
    .values({
      moduleId,
      slug: await uniqueLessonSlug(moduleId, toSlug(title)),
      title,
      summary: "",
      blocks: [],
      position: await nextPosition(lessons, moduleId),
    })
    .returning();

  return row;
}

export async function updateLesson(
  id: string,
  input: { title: string; summary: string; slug?: string; blocks: LessonBlock[] },
) {
  const db = await getDb();

  const [current] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  if (!current) return;

  await db
    .update(lessons)
    .set({
      title: input.title,
      summary: input.summary,
      slug: await uniqueLessonSlug(current.moduleId, toSlug(input.slug || input.title), id),
      blocks: input.blocks,
    })
    .where(eq(lessons.id, id));
}

export async function setLessonDemo(id: string, isDemo: boolean) {
  const db = await getDb();
  await db.update(lessons).set({ isDemo }).where(eq(lessons.id, id));
}

export async function setTaskDemo(moduleId: string, taskSlug: string, isDemo: boolean) {
  const db = await getDb();
  await db
    .update(moduleTasks)
    .set({ isDemo })
    .where(and(eq(moduleTasks.moduleId, moduleId), eq(moduleTasks.taskSlug, taskSlug)));
}

export async function deleteLesson(id: string) {
  const db = await getDb();
  await db.delete(lessons).where(eq(lessons.id, id));
}

export async function moveLesson(id: string, direction: "up" | "down") {
  const db = await getDb();

  const [current] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  if (!current) return;

  const siblings = await db
    .select()
    .from(lessons)
    .where(eq(lessons.moduleId, current.moduleId))
    .orderBy(asc(lessons.position), asc(lessons.createdAt));

  const index = siblings.findIndex((row) => row.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  await db.update(lessons).set({ position: swapWith }).where(eq(lessons.id, siblings[index].id));
  await db.update(lessons).set({ position: index }).where(eq(lessons.id, siblings[swapWith].id));
}

export async function attachTask(moduleId: string, taskSlug: string) {
  const db = await getDb();

  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${moduleTasks.position}), -1)` })
    .from(moduleTasks)
    .where(eq(moduleTasks.moduleId, moduleId));

  await db
    .insert(moduleTasks)
    .values({ moduleId, taskSlug, position: (row?.max ?? -1) + 1 })
    .onConflictDoNothing();
}

export async function detachTask(moduleId: string, taskSlug: string) {
  const db = await getDb();
  await db
    .delete(moduleTasks)
    .where(and(eq(moduleTasks.moduleId, moduleId), eq(moduleTasks.taskSlug, taskSlug)));
}

export async function moveTask(moduleId: string, taskSlug: string, direction: "up" | "down") {
  const db = await getDb();

  const rows = await db
    .select()
    .from(moduleTasks)
    .where(eq(moduleTasks.moduleId, moduleId))
    .orderBy(asc(moduleTasks.position));

  const index = rows.findIndex((row) => row.taskSlug === taskSlug);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= rows.length) return;

  await db
    .update(moduleTasks)
    .set({ position: swapWith })
    .where(and(eq(moduleTasks.moduleId, moduleId), eq(moduleTasks.taskSlug, rows[index].taskSlug)));
  await db
    .update(moduleTasks)
    .set({ position: index })
    .where(
      and(eq(moduleTasks.moduleId, moduleId), eq(moduleTasks.taskSlug, rows[swapWith].taskSlug)),
    );
}
