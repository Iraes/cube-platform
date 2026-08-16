import type { Lesson, Module, Step } from '@/lib/content/types';
import type { UserProgress } from '@/lib/progress';

/** Задачи, которые преподаватель разместил непосредственно в уроке. */
export function getLessonTaskSlugs(lesson: Lesson): string[] {
  return [...new Set(
    lesson.blocks.flatMap((block) => block.type === 'task' ? [block.slug] : []),
  )];
}

/** Урок завершён только после отметки «Прочитано» и решения всех его задач. */
export function isLessonComplete(lesson: Lesson, progress: UserProgress): boolean {
  if (!progress.readLessons.includes(lesson.id)) return false;
  const solved = new Set(progress.solvedTasks);
  return getLessonTaskSlugs(lesson).every((slug) => solved.has(slug));
}

/** Первый незавершённый урок остаётся доступным, всё после него скрыто. */
export function getUnlockedLessonIds(module: Module, progress: UserProgress): Set<string> {
  const unlocked = new Set<string>();

  for (const lesson of module.lessons) {
    unlocked.add(lesson.id);
    if (!isLessonComplete(lesson, progress)) break;
  }

  return unlocked;
}

export function isLessonUnlocked(module: Module, lessonId: string, progress: UserProgress): boolean {
  return getUnlockedLessonIds(module, progress).has(lessonId);
}

/** У одной задачи может быть несколько ссылок из уроков — достаточно одного открытого урока. */
export function isTaskUnlocked(module: Module, taskSlug: string, progress: UserProgress): boolean {
  const owners = module.lessons.filter((lesson) => getLessonTaskSlugs(lesson).includes(taskSlug));
  if (owners.length === 0) {
    return module.lessons.every((lesson) => isLessonComplete(lesson, progress));
  }

  const unlockedLessons = getUnlockedLessonIds(module, progress);
  return owners.some((lesson) => unlockedLessons.has(lesson.id));
}

export function isStepUnlocked(module: Module, step: Step, progress: UserProgress): boolean {
  return step.kind === 'lesson'
    ? isLessonUnlocked(module, step.id, progress)
    : isTaskUnlocked(module, step.id, progress);
}
