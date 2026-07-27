import { isKnownLessonId } from "@/lib/content";
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

  if (typeof lessonId !== "string" || !isKnownLessonId(lessonId)) {
    return Response.json({ error: "Неизвестный урок" }, { status: 400 });
  }

  await markLessonRead(user.id, lessonId);

  return Response.json({ ok: true });
}
