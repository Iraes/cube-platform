import { isMissingUserError } from "@/lib/db/errors";
import { getSessionUser } from "@/lib/session";
import { recordSubmission } from "@/lib/progress";
import { getTask } from "@/lib/tasks";

/** Ограничение на размер сохраняемого решения — защита от мусора в БД */
const MAX_CODE_LENGTH = 20_000;

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

  const { taskSlug, code, passed } = (payload ?? {}) as {
    taskSlug?: unknown;
    code?: unknown;
    passed?: unknown;
  };

  if (typeof taskSlug !== "string" || !getTask(taskSlug)) {
    return Response.json({ error: "Неизвестная задача" }, { status: 400 });
  }

  if (typeof code !== "string" || typeof passed !== "boolean") {
    return Response.json({ error: "Некорректные данные" }, { status: 400 });
  }

  try {
    await recordSubmission({
      userId: user.id,
      taskSlug,
      code: code.slice(0, MAX_CODE_LENGTH),
      passed,
    });
  } catch (error) {
    // Учётку удалили, а вкладка осталась открытой
    if (isMissingUserError(error)) {
      return Response.json({ error: "session-expired" }, { status: 401 });
    }
    throw error;
  }

  return Response.json({ ok: true });
}
