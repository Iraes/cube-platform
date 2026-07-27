import { defineConfig } from "drizzle-kit";

/**
 * Конфиг нужен только для `drizzle-kit generate` — генерации SQL-миграций
 * из схемы. Накатывает миграции скрипт scripts/migrate.ts: он умеет и Neon,
 * и локальный PGlite.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/fabel",
  },
});
