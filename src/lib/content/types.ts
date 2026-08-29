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
  /**
   * Кнопка-переход на задачу платформы. `optional` — разминка: она видна
   * в уроке и засчитывается, но урок считается пройденным и без неё.
   * Иначе добавление задачи в уже пройденный урок закрывало бы ученику
   * все следующие уроки задним числом.
   */
  | { type: "task"; slug: string; note?: string; optional?: boolean }
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
  blockId: string | null;
  /** Сначала проходят уроки… */
  lessons: Lesson[];
  /** …потом решают эти задачи (slug из src/lib/tasks) */
  taskSlugs: string[];
  /** Подмножество taskSlugs, открытое в демо-доступе */
  demoTaskSlugs: string[];
  /**
   * Витрина: модуля нет в списке на платформе, зато всё его содержимое
   * открыто в демо. Уроки и задачи такого модуля считаются демонстрационными
   * независимо от их собственных отметок.
   */
  isDemoOnly: boolean;
};

export type CourseBlock = {
  id: string;
  slug: string;
  title: string;
  description: string;
  position: number;
};

/** Шаг прохождения модуля: урок или задача */
export type Step =
  | { kind: "lesson"; id: string; title: string; href: string }
  | { kind: "task"; id: string; title: string; href: string };

/**
 * Куда ведёт ссылка «назад» на странице задачи. По умолчанию это модуль,
 * но ученика, пришедшего из урока, возвращаем в этот урок.
 */
export type BackLink = { href: string; label: string };

/** Форма стартовых данных: то же, но без идентификаторов из БД */
export type SeedModule = {
  slug: string;
  title: string;
  description: string;
  lessons: { slug: string; title: string; summary: string; blocks: LessonBlock[] }[];
  taskSlugs: string[];
};
