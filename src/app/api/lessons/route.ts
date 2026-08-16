import { getModules } from "@/lib/content";
import { isMissingUserError } from "@/lib/db/errors";
import { getUserProgress, markLessonRead } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { getLessonTaskSlugs, isLessonUnlocked } from "@/lib/learningAccess";

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

  if (typeof lessonId !== "string") {
    return Response.json({ error: "Неизвестный урок" }, { status: 400 });
  }

  const modules = await getModules();
  const module = modules.find((entry) => entry.lessons.some((lesson) => lesson.id === lessonId));
  const lesson = module?.lessons.find((entry) => entry.id === lessonId);
  if (!module || !lesson) {
    return Response.json({ error: "Неизвестный урок" }, { status: 400 });
  }

  const progress = await getUserProgress(user.id);
  if (!isLessonUnlocked(module, lesson.id, progress)) {
    return Response.json({ error: "Сначала завершите предыдущий урок" }, { status: 403 });
  }

  const solved = new Set(progress.solvedTasks);
  const remaining = getLessonTaskSlugs(lesson).filter((taskSlug) => !solved.has(taskSlug));
  if (remaining.length > 0) {
    return Response.json({ error: "Сначала решите все задачи урока", remaining }, { status: 409 });
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
