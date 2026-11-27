/**
 * Хранилище черновика кода задачи в браузере.
 *
 * Изоморфный модуль: без `"use client"` и без обращений к window /
 * localStorage / sessionStorage на верхнем уровне — импортируется и
 * клиентским компонентом, и скриптом под tsx.
 *
 * Ключ: `cube:draft:<taskSlug>:<ownerKey>`. Вошедший ученик — localStorage,
 * демо и неавторизованный — sessionStorage (ключ `guest`). Чужие ключи
 * (`cube:theme`, черновики других задач и пользователей) не читаем и не
 * удаляем.
 */

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const DRAFT_VERSION = 1;
export const DRAFT_KEY_PREFIX = "cube:draft:";
export const GUEST_OWNER_KEY = "guest";
export const DRAFT_SAVE_DELAY_MS = 700;

export type DraftRecord = {
  v: number; // DRAFT_VERSION
  code: string; // код решения как есть
  savedAt: number; // Date.now() в мс
  starterHash: string; // djb2 от starterCode, base36
};

export type DraftLoad =
  | { status: "none" }
  | { status: "restored"; code: string; savedAt: number; starterChanged: boolean };

export type DraftSaveResult = "saved" | "cleared" | "unavailable";

/**
 * Хранилище для владельца: для «guest» — sessionStorage, для вошедшего —
 * localStorage. Никогда не бросает: при недоступности (запрет хранилища,
 * приватный режим, сервер) возвращает null.
 */
export function ownerStorage(ownerKey: string): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = ownerKey === GUEST_OWNER_KEY ? window.sessionStorage : window.localStorage;
    return {
      getItem: (key: string) => storage.getItem(key),
      setItem: (key: string, value: string) => storage.setItem(key, value),
      removeItem: (key: string) => storage.removeItem(key),
    };
  } catch {
    return null;
  }
}

export function draftKey(taskSlug: string, ownerKey: string): string {
  return `${DRAFT_KEY_PREFIX}${taskSlug}:${ownerKey}`;
}

/** djb2 — не криптографический, нужен только для сравнения «тот же каркас» */
export function starterHash(code: string): string {
  let h = 5381;
  for (const ch of code) h = ((h * 33) ^ ch.codePointAt(0)!) >>> 0;
  return h.toString(36);
}

/**
 * Считать черновик. Чужая или битая запись удаляется и возвращается `none`.
 * Пустая строка "" — валидный черновик (ученик стёр редактор).
 */
export function loadDraft(
  storage: StorageLike | null,
  key: string,
  starterCode: string,
): DraftLoad {
  if (!storage) return { status: "none" };

  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { status: "none" };
  }
  if (raw === null) return { status: "none" };

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    dropDraft(storage, key);
    return { status: "none" };
  }

  const record =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;

  if (
    !record ||
    record.v !== DRAFT_VERSION ||
    typeof record.code !== "string" ||
    typeof record.savedAt !== "number" ||
    !Number.isFinite(record.savedAt) ||
    typeof record.starterHash !== "string"
  ) {
    dropDraft(storage, key);
    return { status: "none" };
  }

  if (record.code === starterCode) {
    dropDraft(storage, key);
    return { status: "none" };
  }

  return {
    status: "restored",
    code: record.code,
    savedAt: record.savedAt,
    starterChanged: record.starterHash !== starterHash(starterCode),
  };
}

/**
 * Записать черновик. code === starterCode означает «сбросить» — запись
 * удаляется. При нарушении квоты или запрете хранилища — «unavailable»,
 * наружу исключение не бросает. Порога длины нет.
 */
export function saveDraft(
  storage: StorageLike | null,
  key: string,
  code: string,
  starterCode: string,
  savedAt: number,
): DraftSaveResult {
  if (!storage) return "unavailable";

  if (code === starterCode) {
    dropDraft(storage, key);
    return "cleared";
  }

  try {
    storage.setItem(
      key,
      JSON.stringify({
        v: DRAFT_VERSION,
        code,
        savedAt,
        starterHash: starterHash(starterCode),
      }),
    );
    return "saved";
  } catch {
    return "unavailable";
  }
}

/** Удалить ключ черновика; ничего не возвращает и не бросает. */
export function dropDraft(storage: StorageLike | null, key: string): void {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // не важно: черновика просто не будет
  }
}
