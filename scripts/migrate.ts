import "./env";

/**
 * Накатывает миграции из папки drizzle.
 * С DATABASE_URL — на Neon, без него — на локальный PGlite.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  const folder = "./drizzle";

  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");

    await migrate(drizzle(neon(url)), { migrationsFolder: folder });
    console.log("Миграции применены к Neon (DATABASE_URL)");
    return;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");

  const path = process.env.PGLITE_PATH ?? "./.pglite";
  await migrate(drizzle(new PGlite(path)), { migrationsFolder: folder });
  console.log(`Миграции применены к локальному PGlite (${path})`);
}

main().catch((error) => {
  console.error("Миграции не применились:", error);
  process.exit(1);
});
