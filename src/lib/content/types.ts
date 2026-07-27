/**
 * Учебные материалы. Как и задачи, хранятся файлами в репозитории:
 * добавить урок = добавить объект и закоммитить.
 */

export type LessonBlock =
  /** Текст урока в мини-markdown (абзацы, списки, `код`, ```блоки```) */
  | { type: "text"; markdown: string }
  /** Видео проигрывается прямо на странице: YouTube, Vimeo, RuTube, VK или файл .mp4 */
  | { type: "video"; url: string; title?: string; note?: string }
  /** Ссылка на внешнюю статью — открывается в новой вкладке */
  | { type: "article"; url: string; title: string; source?: string; note?: string };

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  blocks: LessonBlock[];
};

export type Module = {
  slug: string;
  title: string;
  description: string;
  /** Сначала проходят уроки… */
  lessons: Lesson[];
  /** …потом решают эти задачи (slug из src/lib/tasks) */
  taskSlugs: string[];
};

/** Шаг прохождения модуля: урок или задача */
export type Step =
  | { kind: "lesson"; id: string; title: string; href: string }
  | { kind: "task"; id: string; title: string; href: string };
