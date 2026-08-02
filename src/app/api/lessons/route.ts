import { isKnownLessonId } from "@/lib/content";
import { isMissingUserError } from "@/lib/db/errors";
import { markLessonRead } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Требуется вход" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Ожидается JSON" }, { status: 400 });
  }

  const { lessonId } = (payload ?? {}) as { lessonId?: unknown };

  if (typeof lessonId !== "string" || !(await isKnownLessonId(lessonId))) {
    return Response.json({ error: "Неизвестный урок" }, { status: 400 });
  }

  try {
    await markLessonRead(user.id, lessonId);
  } catch (error) {
    // Учётку удалили, а вкладка осталась открытой
    if (isMissingUserError(error)) {
      return Response.json({ error: "session-expired" }, { status: 401 });
    }
    throw error;
  }

  return Response.json({ ok: true });
}
