import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { batch, getDb } from "@/lib/db";
import { courseBlocks, lessons, moduleTasks, modules } from "@/lib/db/schema";
import { getTask } from "@/lib/tasks";
import type { CourseBlock, Lesson, Module, Step } from "./types";

export * from "./types";

/**
 * Модули с уроками и списком задач.
 *
 * Три выборки уходят одним обращением к базе: до Neon каждый запрос —
 * отдельный HTTP-вызов, и три подряд стоят втрое дороже одного.
 * `cache` дополнительно дедуплицирует вызовы внутри одного запроса страницы.
 */
export const getModules = cache(async (): Promise<Module[]> => {
  const db = await getDb();

  const [moduleRows, lessonRows, taskRows] = await batch(db, [
    db.select().from(modules).orderBy(asc(modules.position), asc(modules.createdAt)),
    db.select().from(lessons).orderBy(asc(lessons.position), asc(lessons.createdAt)),
    db.select().from(moduleTasks).orderBy(asc(moduleTasks.position)),
  ]);

  return moduleRows.map((row) => {
    const ownTasks = taskRows.filter((task) => task.moduleId === row.id);

    // У витринного модуля отметки «в демо» проставлять не нужно:
    // открыто всё содержимое, иначе модуль было бы не посмотреть вовсе
    const demoOnly = row.isDemoOnly;

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      blockId: row.blockId,
      isDemoOnly: demoOnly,
      lessons: lessonRows
        .filter((lesson) => lesson.moduleId === row.id)
        .map(
          (lesson): Lesson => ({
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.summary,
            blocks: lesson.blocks ?? [],
            isDemo: demoOnly || lesson.isDemo,
          }),
        ),
      taskSlugs: ownTasks.map((task) => task.taskSlug),
      demoTaskSlugs: ownTasks
        .filter((task) => demoOnly || task.isDemo)
        .map((task) => task.taskSlug),
    };
  });
});

export const getCourseBlocks = cache(async (): Promise<CourseBlock[]> => {
  const db = await getDb();
  return db
    .select()
    .from(courseBlocks)
    .orderBy(asc(courseBlocks.position), asc(courseBlocks.createdAt));
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

/**
 * Следующий шаг для ученика, который пришёл в задачу из урока.
 *
 * Задачи в маршруте модуля лежат хвостом после всех уроков, поэтому обычный
 * `getNextStep` увёл бы его к следующей задаче, минуя оставшуюся теорию.
 * Считаем от урока-источника — так после задачи ученик возвращается к урокам.
 */
export function getNextStepFromLesson(
  module: Module,
  lesson: Lesson,
  taskSlug: string,
): Step | undefined {
  const next = getNextStep(module, lesson.id);

  // Урок был последним, и следом идёт та самая задача — ведём на шаг за ней
  if (next?.kind === "task" && next.id === taskSlug) return getNextStep(module, taskSlug);

  return next;
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

/** Материалы, открытые без входа на платформу */
export const getDemoContent = cache(async () => {
  const all = await getModules();

  return all
    .map((module) => ({
      module,
      lessons: module.lessons.filter((lesson) => lesson.isDemo),
      taskSlugs: module.demoTaskSlugs,
    }))
    .filter((entry) => entry.lessons.length > 0 || entry.taskSlugs.length > 0);
});

export async function isDemoLesson(moduleSlug: string, lessonSlug: string): Promise<boolean> {
  const module = await getModuleBySlug(moduleSlug);
  if (!module) return false;
  return findLesson(module, lessonSlug)?.isDemo ?? false;
}

export async function isDemoTask(taskSlug: string): Promise<boolean> {
  const all = await getModules();
  return all.some((module) => module.demoTaskSlugs.includes(taskSlug));
}
