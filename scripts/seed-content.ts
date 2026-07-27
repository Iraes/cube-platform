import "./env";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { lessons, moduleTasks, modules } from "@/lib/db/schema";
import { collections } from "@/lib/content/seed/collections";
import { jsBasics } from "@/lib/content/seed/js-basics";
import type { SeedModule } from "@/lib/content/types";

/**
 * Первичное наполнение: переносит стартовые модули из файлов в БД.
 * После этого источник истины — база, а файлы в src/lib/content/seed
 * остаются только историей начального контента.
 *
 *   npm run db:seed          — добавит недостающие модули
 *   npm run db:seed -- --force — пересоздаст их с нуля
 */
const SEED: SeedModule[] = [jsBasics, collections];

async function main() {
  const force = process.argv.includes("--force");
  const db = await getDb();

  const existing = await db.select({ slug: modules.slug }).from(modules);
  const existingSlugs = new Set(existing.map((row) => row.slug));

  for (const [index, seed] of SEED.entries()) {
    if (existingSlugs.has(seed.slug)) {
      if (!force) {
        console.log(`Модуль «${seed.title}» уже есть — пропускаю`);
        continue;
      }
      // Каскад снесёт уроки и привязки задач вместе с модулем
      await db.delete(modules).where(eq(modules.slug, seed.slug));
      console.log(`Модуль «${seed.title}» пересоздаётся`);
    }

    const [moduleRow] = await db
      .insert(modules)
      .values({
        slug: seed.slug,
        title: seed.title,
        description: seed.description,
        position: index,
      })
      .returning();

    if (seed.lessons.length > 0) {
      await db.insert(lessons).values(
        seed.lessons.map((lesson, lessonIndex) => ({
          moduleId: moduleRow.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          blocks: lesson.blocks,
          position: lessonIndex,
        })),
      );
    }

    if (seed.taskSlugs.length > 0) {
      await db.insert(moduleTasks).values(
        seed.taskSlugs.map((taskSlug, taskIndex) => ({
          moduleId: moduleRow.id,
          taskSlug,
          position: taskIndex,
        })),
      );
    }

    console.log(
      `Добавлен модуль «${seed.title}»: уроков ${seed.lessons.length}, задач ${seed.taskSlugs.length}`,
    );
  }

  console.log("Готово");
}

main().catch((error) => {
  console.error("Не удалось наполнить базу:", error);
  process.exit(1);
});
