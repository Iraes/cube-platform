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

async function createNeon(url: string): Promise<Db> {
  const [{ neon }, { drizzle }] = await Promise.all([
    import("@neondatabase/serverless"),
    import("drizzle-orm/neon-http"),
  ]);

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
    instance = url ? createNeon(url) : createPglite();
  }
  return instance;
}

export { schema };
