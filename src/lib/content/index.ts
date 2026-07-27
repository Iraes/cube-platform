import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { lessons, moduleTasks, modules } from "@/lib/db/schema";
import { getTask } from "@/lib/tasks";
import type { Lesson, Module, Step } from "./types";

export * from "./types";

/**
 * Модули с уроками и списком задач.
 *
 * Три запроса и сборка в памяти вместо запроса на каждый модуль:
 * материалов немного, а N+1 не нужен даже на маленьких объёмах.
 * `cache` дедуплицирует вызовы в пределах одного запроса.
 */
export const getModules = cache(async (): Promise<Module[]> => {
  const db = await getDb();

  const [moduleRows, lessonRows, taskRows] = await Promise.all([
    db.select().from(modules).orderBy(asc(modules.position), asc(modules.createdAt)),
    db.select().from(lessons).orderBy(asc(lessons.position), asc(lessons.createdAt)),
    db.select().from(moduleTasks).orderBy(asc(moduleTasks.position)),
  ]);

  return moduleRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    lessons: lessonRows
      .filter((lesson) => lesson.moduleId === row.id)
      .map(
        (lesson): Lesson => ({
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          blocks: lesson.blocks ?? [],
        }),
      ),
    taskSlugs: taskRows.filter((task) => task.moduleId === row.id).map((task) => task.taskSlug),
  }));
});

export const getModuleBySlug = cache(async (slug: string): Promise<Module | undefined> => {
  const all = await getModules();
  return all.find((module) => module.slug === slug);
});

export const getModuleById = cache(async (id: string): Promise<Module | undefined> => {
  const all = await getModules();
  return all.find((module) => module.id === id);
});

export function findLesson(module: Module, lessonSlug: string): Lesson | undefined {
  return module.lessons.find((lesson) => lesson.slug === lessonSlug);
}

/**
 * Полный маршрут по модулю: сначала уроки, потом задачи.
 * На этом списке строятся и прогресс, и кнопка «Дальше».
 */
export function getSteps(module: Module): Step[] {
  const lessonSteps: Step[] = module.lessons.map((lesson) => ({
    kind: "lesson",
    id: lesson.id,
    title: lesson.title,
    href: `/modules/${module.slug}/lessons/${lesson.slug}`,
  }));

  const taskSteps: Step[] = module.taskSlugs.flatMap((slug) => {
    const task = getTask(slug);
    if (!task) return [];
    return [{ kind: "task", id: slug, title: task.title, href: `/tasks/${slug}` }];
  });

  return [...lessonSteps, ...taskSteps];
}

/** Следующий шаг после указанного — для кнопки «Дальше» */
export function getNextStep(module: Module, currentId: string): Step | undefined {
  const steps = getSteps(module);
  const index = steps.findIndex((step) => step.id === currentId);
  return index === -1 ? undefined : steps[index + 1];
}

/** Модуль, в который входит задача (для навигации со страницы задачи) */
export const getModuleForTask = cache(async (taskSlug: string): Promise<Module | undefined> => {
  const all = await getModules();
  return all.find((module) => module.taskSlugs.includes(taskSlug));
});

/** Существует ли такой урок — проверка данных, пришедших от клиента */
export async function isKnownLessonId(id: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, id)).limit(1);
  return rows.length > 0;
}
