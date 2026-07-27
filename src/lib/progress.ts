import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { lessonProgress, submissions } from "@/lib/db/schema";

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

  const [solvedRows, lessonRows] = await Promise.all([
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
