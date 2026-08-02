import type { QuizQuestion } from "@/lib/runner/types";

/**
 * Учебные материалы. Хранятся в БД и редактируются в админке;
 * файлы в `seed/` — только стартовое наполнение при первом запуске.
 */

export type LessonBlock =
  /** Текст урока в мини-markdown (абзацы, списки, `код`, ```блоки```) */
  | { type: "text"; markdown: string }
  /** Видео проигрывается прямо на странице: YouTube, Vimeo, RuTube, VK или файл .mp4 */
  | { type: "video"; url: string; title?: string; note?: string }
  /** Ссылка на внешнюю статью — открывается в новой вкладке */
  | { type: "article"; url: string; title: string; source?: string; note?: string }
  /** Кнопка-переход на задачу платформы: из теории сразу к практике */
  | { type: "task"; slug: string; note?: string }
  /**
   * Тест прямо в уроке — самопроверка сразу после теории.
   * Ответы сверяет сервер, в браузер верные варианты не уезжают.
   */
  | { type: "quiz"; title?: string; questions: QuizQuestion[] };

export type LessonBlockType = LessonBlock["type"];

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  blocks: LessonBlock[];
  /** Виден без входа, в демо-доступе */
  isDemo: boolean;
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Сначала проходят уроки… */
  lessons: Lesson[];
  /** …потом решают эти задачи (slug из src/lib/tasks) */
  taskSlugs: string[];
  /** Подмножество taskSlugs, открытое в демо-доступе */
  demoTaskSlugs: string[];
};

/** Шаг прохождения модуля: урок или задача */
export type Step =
  | { kind: "lesson"; id: string; title: string; href: string }
  | { kind: "task"; id: string; title: string; href: string };

/** Форма стартовых данных: то же, но без идентификаторов из БД */
export type SeedModule = {
  slug: string;
  title: string;
  description: string;
  lessons: { slug: string; title: string; summary: string; blocks: LessonBlock[] }[];
  taskSlugs: string[];
};
