/**
 * Прогресс ученика: прочитанные уроки и решённые задачи.
 *
 * Пока хранится в localStorage — этого достаточно, чтобы платформа
 * работала без авторизации. На этапе 2 источником станет БД, а этот
 * модуль останется единственным местом, которое придётся переписать.
 */

const LESSONS_KEY = "fabel:lessons-read";
const TASKS_KEY = "fabel:tasks-solved";
const CHANGE_EVENT = "fabel:progress-changed";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(key: string, values: Set<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify([...values]));
  } catch {
    // приватный режим — прогресс просто не сохранится
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getReadLessons(): Set<string> {
  return readSet(LESSONS_KEY);
}

export function getSolvedTasks(): Set<string> {
  return readSet(TASKS_KEY);
}

export function markLessonRead(id: string): void {
  const lessons = readSet(LESSONS_KEY);
  if (lessons.has(id)) return;
  lessons.add(id);
  writeSet(LESSONS_KEY, lessons);
}

export function markTaskSolved(slug: string): void {
  const tasks = readSet(TASKS_KEY);
  if (tasks.has(slug)) return;
  tasks.add(slug);
  writeSet(TASKS_KEY, tasks);
}

/** Подписка на изменения прогресса внутри вкладки */
export function subscribeToProgress(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
