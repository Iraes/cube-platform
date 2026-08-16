import "./env";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { courseBlocks, lessons, moduleTasks, modules } from "@/lib/db/schema";
import { collections } from "@/lib/content/seed/collections";
import { jsBasics } from "@/lib/content/seed/js-basics";
import { referenceTypes } from "@/lib/content/seed/reference-types";
import { advancedFunctions } from "@/lib/content/seed/advanced-functions";
import { arrayIteration } from "@/lib/content/seed/array-iteration";
import { objectsModule } from "@/lib/content/seed/objects";
import { prototypesAndClasses } from "@/lib/content/seed/prototypes-and-classes";
import type { SeedModule } from "@/lib/content/types";

/**
 * Первичное наполнение: переносит стартовые модули из файлов в БД.
 * После этого источник истины — база, а файлы в src/lib/content/seed
 * остаются только историей начального контента.
 *
 *   npm run db:seed          — добавит недостающие модули
 *   npm run db:seed -- --force — пересоздаст их с нуля
 */
const SEED: SeedModule[] = [jsBasics, collections, referenceTypes, advancedFunctions, arrayIteration, objectsModule, prototypesAndClasses];

const SEED_BLOCKS = [
  {
    slug: "js-core-main-concepts",
    title: "JS Core · Основные концепции",
    description: "Базовые конструкции языка, ссылочные типы, функции и перебор массивов.",
    moduleSlugs: ["reference-types", "advanced-functions", "array-iteration"],
  },
  {
    slug: "js-core-prototypes-and-classes",
    title: "JS Core · Прототипы и классы",
    description: "Прототипная модель JavaScript, конструкторы, классы и наследование.",
    moduleSlugs: ["objects", "prototypes-and-classes"],
  },
];

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

  for (const [position, seedBlock] of SEED_BLOCKS.entries()) {
    let [block] = await db
      .select()
      .from(courseBlocks)
      .where(eq(courseBlocks.slug, seedBlock.slug))
      .limit(1);

    if (!block) {
      [block] = await db
        .insert(courseBlocks)
        .values({
          slug: seedBlock.slug,
          title: seedBlock.title,
          description: seedBlock.description,
          position,
        })
        .returning();
      console.log(`Добавлен блок «${seedBlock.title}»`);
    }

    for (const moduleSlug of seedBlock.moduleSlugs) {
      await db.update(modules).set({ blockId: block.id }).where(eq(modules.slug, moduleSlug));
    }
  }

  console.log("Готово");
}

main().catch((error) => {
  console.error("Не удалось наполнить базу:", error);
  process.exit(1);
});
