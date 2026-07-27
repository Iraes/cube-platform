import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { LessonBlock } from "@/lib/content/types";

/**
 * Учётные записи заводит владелец: регистрации на сайте нет.
 * email — он же логин; пароль хранится только в виде хеша.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  // admin — доступ к разделу /admin; teacher пригодится на этапе 4 (трекер)
  role: text("role", { enum: ["student", "teacher", "admin"] })
    .notNull()
    .default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * История отправок на проверку. «Решено» = есть хотя бы одна запись
 * с passed = true для пары (userId, taskSlug) — отдельной таблицы прогресса не нужно.
 */
export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskSlug: text("task_slug").notNull(),
    code: text("code").notNull(),
    passed: boolean("passed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("submissions_user_task_idx").on(table.userId, table.taskSlug)],
);

/**
 * Учебные модули. Раньше лежали файлами в репозитории; переехали в БД,
 * чтобы владелец редактировал их в админке без правки кода и деплоя.
 */
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Урок — страница с материалами. Блоки (текст, видео, ссылки на статьи)
 * хранятся одним JSONB: урок правится целиком одной формой, а отдельная
 * таблица блоков дала бы лишнюю возню с порядком.
 */
export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    position: integer("position").notNull().default(0),
    blocks: jsonb("blocks").$type<LessonBlock[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lessons_module_slug_idx").on(table.moduleId, table.slug)],
);

/**
 * Какие задачи входят в модуль и в каком порядке.
 * Сами задачи остаются файлами в репозитории — здесь только ссылка по slug.
 */
export const moduleTasks = pgTable(
  "module_tasks",
  {
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    taskSlug: text("task_slug").notNull(),
    position: integer("position").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.moduleId, table.taskSlug] })],
);

/**
 * Прочитанные уроки. lessonId ссылается на lessons.id, поэтому
 * переименование урока не сбрасывает прогресс.
 */
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.lessonId] })],
);

export type UserRow = typeof users.$inferSelect;
export type ModuleRow = typeof modules.$inferSelect;
export type LessonRow = typeof lessons.$inferSelect;
