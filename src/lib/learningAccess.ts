import type { Lesson, Module, Step } from '@/lib/content/types';
import type { UserProgress } from '@/lib/progress';
import type { UserRole } from '@/lib/session';

/**
 * Кому порядок прохождения не мешает.
 *
 * Последовательность нужна ученику: она удерживает его от прыжка через
 * незакрытую тему. Преподавателю и владельцу она только мешает — им нужно
 * заглянуть в любой урок и в любую задачу, чтобы ответить на вопрос
 * или проверить материал, а своего прогресса по курсу у них нет.
 */
export function ignoresLessonOrder(role?: UserRole): boolean {
  return role === 'teacher' || role === 'admin';
}

/** Все задачи, размещённые в уроке, включая необязательные разминки. */
export function getLessonTaskSlugs(lesson: Lesson): string[] {
  return [...new Set(
    lesson.blocks.flatMap((block) => block.type === 'task' ? [block.slug] : []),
  )];
}

/**
 * Задачи, без которых урок не считается пройденным.
 *
 * Разминки сюда не входят: они появились у уже пройденных уроков задним
 * числом, и если бы их требовали, ученик разом потерял бы доступ ко всему,
 * что прошёл дальше.
 */
export function getRequiredTaskSlugs(lesson: Lesson): string[] {
  return [...new Set(
    lesson.blocks.flatMap((block) =>
      block.type === 'task' && !block.optional ? [block.slug] : [],
    ),
  )];
}

/** Урок завершён только после отметки «Прочитано» и решения всех его задач. */
export function isLessonComplete(lesson: Lesson, progress: UserProgress): boolean {
  if (!progress.readLessons.includes(lesson.id)) return false;
  const solved = new Set(progress.solvedTasks);
  return getRequiredTaskSlugs(lesson).every((slug) => solved.has(slug));
}

/** Первый незавершённый урок остаётся доступным, всё после него скрыто. */
export function getUnlockedLessonIds(
  module: Module,
  progress: UserProgress,
  role?: UserRole,
): Set<string> {
  if (ignoresLessonOrder(role)) return new Set(module.lessons.map((lesson) => lesson.id));

  const unlocked = new Set<string>();

  for (const lesson of module.lessons) {
    unlocked.add(lesson.id);
    if (!isLessonComplete(lesson, progress)) break;
  }

  return unlocked;
}

export function isLessonUnlocked(
  module: Module,
  lessonId: string,
  progress: UserProgress,
  role?: UserRole,
): boolean {
  return getUnlockedLessonIds(module, progress, role).has(lessonId);
}

/** У одной задачи может быть несколько ссылок из уроков — достаточно одного открытого урока. */
export function isTaskUnlocked(
  module: Module,
  taskSlug: string,
  progress: UserProgress,
  role?: UserRole,
): boolean {
  if (ignoresLessonOrder(role)) return true;

  const owners = module.lessons.filter((lesson) => getLessonTaskSlugs(lesson).includes(taskSlug));
  if (owners.length === 0) {
    return module.lessons.every((lesson) => isLessonComplete(lesson, progress));
  }

  const unlockedLessons = getUnlockedLessonIds(module, progress);
  return owners.some((lesson) => unlockedLessons.has(lesson.id));
}

export function isStepUnlocked(
  module: Module,
  step: Step,
  progress: UserProgress,
  role?: UserRole,
): boolean {
  return step.kind === 'lesson'
    ? isLessonUnlocked(module, step.id, progress, role)
    : isTaskUnlocked(module, step.id, progress, role);
}
