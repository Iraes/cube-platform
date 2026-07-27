import { boolean, index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Учётные записи заводит владелец: регистрации на сайте нет.
 * email — он же логин; пароль хранится только в виде хеша.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  // teacher пригодится на этапе 4 (трекер задач)
  role: text("role", { enum: ["student", "teacher"] }).notNull().default("student"),
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
 * Прочитанные уроки. Появилось вместе с учебными модулями:
 * у материалов свой прогресс, наравне с решёнными задачами.
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
