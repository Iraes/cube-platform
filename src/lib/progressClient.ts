"use client";

/**
 * Клиентская сторона прогресса: отправляет факт на сервер.
 * Читается прогресс не отсюда — серверные страницы отдают его пропсами,
 * поэтому после успешной записи достаточно router.refresh().
 */

export async function postLessonRead(lessonId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function postSubmission(input: {
  taskSlug: string;
  code: string;
  passed: boolean;
}): Promise<boolean> {
  try {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return response.ok;
  } catch {
    return false;
  }
}
