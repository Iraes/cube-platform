import { getTask } from "@/lib/tasks";
import type { Lesson, Module, Step } from "./types";
import { collections } from "./modules/collections";
import { jsBasics } from "./modules/js-basics";

export * from "./types";

/** Порядок модулей на главной */
export const modules: Module[] = [jsBasics, collections];

export function getModule(slug: string): Module | undefined {
  return modules.find((module) => module.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string): Lesson | undefined {
  return getModule(moduleSlug)?.lessons.find((lesson) => lesson.slug === lessonSlug);
}

/** Идентификатор урока для хранения прогресса */
export function lessonId(moduleSlug: string, lessonSlug: string): string {
  return `${moduleSlug}/${lessonSlug}`;
}

/**
 * Полный маршрут по модулю: сначала уроки, потом задачи.
 * На этом списке строятся и прогресс, и кнопка «Дальше».
 */
export function getSteps(module: Module): Step[] {
  const lessonSteps: Step[] = module.lessons.map((lesson) => ({
    kind: "lesson",
    id: lessonId(module.slug, lesson.slug),
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
export function getModuleForTask(taskSlug: string): Module | undefined {
  return modules.find((module) => module.taskSlugs.includes(taskSlug));
}

export function getAllLessonParams(): { slug: string; lessonSlug: string }[] {
  return modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ slug: module.slug, lessonSlug: lesson.slug })),
  );
}
