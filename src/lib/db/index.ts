import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Один клиент на два окружения:
 *
 *  - есть DATABASE_URL  → Neon (Vercel Postgres), боевой режим;
 *  - нет DATABASE_URL   → PGlite, встраиваемый Postgres в папке .pglite.
 *
 * PGlite нужен, чтобы разработка и проверка работали без облачной БД.
 * Он лежит в devDependencies и в проде не подключается.
 */
export type Db = NeonHttpDatabase<typeof schema>;

let instance: Promise<Db> | null = null;
let driver: "neon" | "pglite" = "neon";

/** Сколько ждём соединения с базой, прежде чем повторить попытку */
const CONNECT_TIMEOUT_MS = 5000;
const CONNECT_ATTEMPTS = 3;

/**
 * Neon отвечает за десятки миллисекунд, но соединение до него иногда
 * не устанавливается вовсе, и тогда undici ждёт свои 10 секунд —
 * страница висит, а пользователь видит «загрузка» или ошибку.
 *
 * Обрываем такое ожидание раньше и пробуем ещё раз. Повтор безопасен:
 * все запросы платформы либо читают, либо идемпотентны (обновления,
 * onConflictDoNothing, insert в историю отправок).
 */
async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit = {}) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= CONNECT_ATTEMPTS; attempt += 1) {
    const timeout = AbortSignal.timeout(CONNECT_TIMEOUT_MS);
    const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;

    try {
      return await fetch(input, { ...init, signal });
    } catch (error) {
      lastError = error;
      if (init.signal?.aborted) throw error;
      if (attempt < CONNECT_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
      }
    }
  }

  throw lastError;
}

async function createNeon(url: string): Promise<Db> {
  const [{ neon, neonConfig }, { drizzle }] = await Promise.all([
    import("@neondatabase/serverless"),
    import("drizzle-orm/neon-http"),
  ]);

  neonConfig.fetchFunction = fetchWithRetry;

  return drizzle(neon(url), { schema });
}

async function createPglite(): Promise<Db> {
  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);

  const client = new PGlite(process.env.PGLITE_PATH ?? "./.pglite");
  const db = drizzle(client, { schema });

  // Локальная база поднимается с нуля — сразу накатываем миграции
  await migrate(db, { migrationsFolder: "./drizzle" });

  // Драйверы отличаются типами, но набор используемых методов одинаковый
  return db as unknown as Db;
}

export function getDb(): Promise<Db> {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    driver = url ? "neon" : "pglite";
    instance = url ? createNeon(url) : createPglite();
  }
  return instance;
}

/**
 * Несколько запросов одним обращением к базе.
 *
 * До Neon каждый запрос — отдельный HTTP-вызов: около 70 мс на разогретом
 * соединении и до полусекунды на холодном, причём параллельный запуск не
 * помогает. `batch` укладывает их в один вызов. У PGlite такого метода нет,
 * да он там и не нужен: база локальная.
 */
export async function batch<T extends readonly unknown[]>(
  db: Db,
  queries: [...T],
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  if (driver === "neon" && queries.length > 0) {
    return db.batch(
      queries as unknown as Parameters<Db["batch"]>[0],
    ) as Promise<{ [K in keyof T]: Awaited<T[K]> }>;
  }

  return Promise.all(queries as readonly PromiseLike<unknown>[]) as Promise<{
    [K in keyof T]: Awaited<T[K]>;
  }>;
}

export { schema };
