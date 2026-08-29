import { and, asc, eq, sql } from "drizzle-orm";
import { batch, getDb } from "@/lib/db";
import { lessonProgress, submissions, users } from "@/lib/db/schema";
import type { UserRole } from "@/lib/session";

/**
 * Прогресс ученика: решённые задачи и прочитанные уроки.
 * Единственное место, которое знает, где прогресс хранится —
 * компоненты получают уже готовые списки.
 */

export type UserProgress = {
  solvedTasks: string[];
  readLessons: string[];
};

export const EMPTY_PROGRESS: UserProgress = { solvedTasks: [], readLessons: [] };

export async function getUserProgress(userId: string): Promise<UserProgress> {
  const db = await getDb();

  // Обе выборки уходят одним обращением к базе: см. комментарий к batch
  const [solvedRows, lessonRows] = await batch(db, [
    db
      .selectDistinct({ taskSlug: submissions.taskSlug })
      .from(submissions)
      .where(and(eq(submissions.userId, userId), eq(submissions.passed, true))),
    db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId)),
  ]);

  return {
    solvedTasks: solvedRows.map((row) => row.taskSlug),
    readLessons: lessonRows.map((row) => row.lessonId),
  };
}

export async function recordSubmission(input: {
  userId: string;
  taskSlug: string;
  code: string;
  passed: boolean;
}): Promise<void> {
  const db = await getDb();
  await db.insert(submissions).values(input);
}

export async function markLessonRead(userId: string, lessonId: string): Promise<void> {
  const db = await getDb();
  await db
    .insert(lessonProgress)
    .values({ userId, lessonId })
    .onConflictDoNothing({ target: [lessonProgress.userId, lessonProgress.lessonId] });
}

/* ------------------------------------------------------------------ *
 * Отчёты для преподавателя
 * ------------------------------------------------------------------ */

/** Драйверы отдают время то строкой, то объектом — приводим к одному виду */
function toDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Позже из двух моментов; null считается «не было» */
function later(a: Date | null, b: Date | null): Date | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

export type StudentSummary = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date | null;
  /**
   * Слаги сданных задач и идентификаторы прочитанных уроков, а не их число:
   * считать проценты нужно по программе, а витринные модули в неё не входят.
   * Пересечение с программой делает страница — она знает состав модулей.
   */
  solvedTasks: string[];
  readLessons: string[];
  /** Всего отправок на проверку, включая неудачные */
  attemptCount: number;
  /** Последнее действие, двигавшее прогресс: отправка решения или «Прочитано» */
  lastActivity: Date | null;
  /** Последний заход на платформу — даже если ученик ничего не нажал */
  lastSeen: Date | null;
};

/**
 * Сводка по всем пользователям для списка учеников.
 *
 * Четыре запроса уходят одним обращением, см. комментарий к `batch`.
 * Число отправок считает база: их много и они здесь не нужны поштучно,
 * а вот сданные задачи и прочитанные уроки нужны списками.
 */
export async function getStudentSummaries(): Promise<StudentSummary[]> {
  const db = await getDb();

  const [userRows, attemptRows, solvedRows, lessonRows] = await batch(db, [
    db.select().from(users).orderBy(asc(users.createdAt)),
    db
      .select({
        userId: submissions.userId,
        attempts: sql<number>`count(*)::int`,
        lastAt: sql<string>`max(${submissions.createdAt})`,
      })
      .from(submissions)
      .groupBy(submissions.userId),
    db
      .selectDistinct({ userId: submissions.userId, taskSlug: submissions.taskSlug })
      .from(submissions)
      .where(eq(submissions.passed, true)),
    db
      .select({
        userId: lessonProgress.userId,
        lessonId: lessonProgress.lessonId,
        readAt: lessonProgress.readAt,
      })
      .from(lessonProgress),
  ]);

  const byAttempts = new Map(attemptRows.map((row) => [row.userId, row]));

  const solvedByUser = new Map<string, string[]>();
  for (const row of solvedRows) {
    const list = solvedByUser.get(row.userId);
    if (list) list.push(row.taskSlug);
    else solvedByUser.set(row.userId, [row.taskSlug]);
  }

  const readByUser = new Map<string, string[]>();
  const lastReadByUser = new Map<string, Date | null>();
  for (const row of lessonRows) {
    const list = readByUser.get(row.userId);
    if (list) list.push(row.lessonId);
    else readByUser.set(row.userId, [row.lessonId]);

    lastReadByUser.set(row.userId, later(lastReadByUser.get(row.userId) ?? null, toDate(row.readAt)));
  }

  return userRows.map((user) => {
    const attempts = byAttempts.get(user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: toDate(user.createdAt),
      solvedTasks: solvedByUser.get(user.id) ?? [],
      readLessons: readByUser.get(user.id) ?? [],
      attemptCount: Number(attempts?.attempts ?? 0),
      lastActivity: later(toDate(attempts?.lastAt), lastReadByUser.get(user.id) ?? null),
      lastSeen: toDate(user.lastSeenAt),
    };
  });
}

export type TaskAttempts = {
  taskSlug: string;
  attempts: number;
  solved: boolean;
  lastAt: Date | null;
};

export type StudentReport = {
  user: StudentSummary;
  /** По задаче: сколько раз отправлял, сдал ли, когда трогал последний раз */
  tasks: TaskAttempts[];
  /** Идентификаторы прочитанных уроков и когда отмечены */
  lessons: { lessonId: string; readAt: Date | null }[];
};

/** Разбор по одному ученику: что решено, что прочитано, где буксует */
export async function getStudentReport(userId: string): Promise<StudentReport | null> {
  const db = await getDb();

  const [userRows, taskRows, lessonRows] = await batch(db, [
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db
      .select({
        taskSlug: submissions.taskSlug,
        attempts: sql<number>`count(*)::int`,
        solved: sql<boolean>`bool_or(${submissions.passed})`,
        lastAt: sql<string>`max(${submissions.createdAt})`,
      })
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .groupBy(submissions.taskSlug),
    db
      .select({ lessonId: lessonProgress.lessonId, readAt: lessonProgress.readAt })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId)),
  ]);

  const user = userRows[0];
  if (!user) return null;

  const tasks: TaskAttempts[] = taskRows.map((row) => ({
    taskSlug: row.taskSlug,
    attempts: Number(row.attempts),
    solved: Boolean(row.solved),
    lastAt: toDate(row.lastAt),
  }));

  const lessons = lessonRows.map((row) => ({
    lessonId: row.lessonId,
    readAt: toDate(row.readAt),
  }));

  const lastActivity = tasks
    .map((task) => task.lastAt)
    .concat(lessons.map((lesson) => lesson.readAt))
    .reduce<Date | null>((acc, item) => later(acc, item), null);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: toDate(user.createdAt),
      solvedTasks: tasks.filter((task) => task.solved).map((task) => task.taskSlug),
      readLessons: lessons.map((lesson) => lesson.lessonId),
      attemptCount: tasks.reduce((sum, task) => sum + task.attempts, 0),
      lastActivity,
      lastSeen: toDate(user.lastSeenAt),
    },
    tasks,
    lessons,
  };
}
