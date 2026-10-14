// .env.local первым: без DATABASE_URL скрипт пойдёт в локальный PGlite
// и выгрузит пустоту вместо боевых данных.
import "./env";
import fs from "node:fs";
import path from "node:path";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "@/lib/db";

/**
 * Снимок боевой базы в JSON — только чтение.
 *
 * Нужен перед переездом: pg_dump на машине владельца не установлен, а Neon
 * отдаёт данные по HTTP, так что выгружаем таблицы через то же соединение,
 * которым пользуется сайт. Файл кладём в backup/ — он в .gitignore,
 * потому что в users лежат хеши паролей.
 */
const TABLES = [
  ["course_blocks", schema.courseBlocks],
  ["modules", schema.modules],
  ["lessons", schema.lessons],
  ["module_tasks", schema.moduleTasks],
  ["users", schema.users],
  ["submissions", schema.submissions],
  ["lesson_progress", schema.lessonProgress],
  ["bug_reports", schema.bugReports],
] as const;

/** Строк за один запрос — подобрано под медленное соединение с Neon */
const PAGE = 3;

/**
 * Свой клиент, а не общий getDb(): тот обрывает запрос через 5 секунд —
 * правильно для страницы сайта, но мало для выгрузки по медленному каналу
 * до Франкфурта. Здесь ждём дольше и повторяем настойчивее.
 */
async function patientFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      return await fetch(input, { ...init, signal: AbortSignal.timeout(60_000) });
    } catch (error) {
      lastError = error;
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL не задан — выгружать нечего. Проверьте .env.local.");
    process.exit(1);
  }

  neonConfig.fetchFunction = patientFetch;
  const db = drizzle(neon(url), { schema });

  /**
   * Можно выгрузить отдельные таблицы: `npm run db:export -- users`.
   * Нужно, когда связь с базой рвётся: один маленький запрос проскакивает
   * там, где полная выгрузка в шесть десятков запросов не доходит.
   */
  const only = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const wanted = only.length ? TABLES.filter(([name]) => only.includes(name)) : TABLES;

  if (only.length && wanted.length !== only.length) {
    const known = TABLES.map(([name]) => name).join(", ");
    console.error("Неизвестная таблица. Доступны: " + known);
    process.exit(1);
  }
  const dump: Record<string, unknown[]> = {};

  for (const [name, table] of wanted) {
    // Порциями, а не одним select: клиент обрывает запрос по таймауту в 5 секунд,
    // а уроки с их JSONB-блоками не успевают доехать из Франкфурта целиком.
    const rows: unknown[] = [];
    process.stdout.write(name.padEnd(16));
    for (let offset = 0; ; offset += PAGE) {
      const page = await db.select().from(table).limit(PAGE).offset(offset);
      rows.push(...page);
      process.stdout.write("·");
      if (page.length < PAGE) break;
    }
    dump[name] = rows;
    console.log(" " + rows.length + " строк");
  }

  const dir = path.join(process.cwd(), "backup");
  fs.mkdirSync(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  // Частичную выгрузку помечаем в имени, чтобы её не приняли за полный снимок
  const suffix = only.length ? "-" + only.join("+") : "";
  const file = path.join(dir, "dump-" + stamp + suffix + ".json");
  fs.writeFileSync(file, JSON.stringify({ takenAt: new Date().toISOString(), tables: dump }, null, 2), "utf8");

  const size = (fs.statSync(file).size / 1024).toFixed(0);
  console.log("\nСнимок: " + file + "  (" + size + " КБ)");
}

main();
