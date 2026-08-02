import { getDb } from "@/lib/db";
import { bugReports } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/session";

/** Ограничение на длину сообщения — защита от мусора в базе */
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Ожидается JSON" }, { status: 400 });
  }

  const { message, contextKind, contextId, contextTitle } = (payload ?? {}) as {
    message?: unknown;
    contextKind?: unknown;
    contextId?: unknown;
    contextTitle?: unknown;
  };

  if (typeof message !== "string" || message.trim().length < 5) {
    return Response.json({ error: "Опишите проблему подробнее" }, { status: 400 });
  }

  const kind =
    contextKind === "lesson" || contextKind === "task" ? contextKind : ("other" as const);

  // Сообщить о баге можно и без входа: демо-доступ тоже часть платформы
  const user = await getSessionUser();
  const db = await getDb();

  await db.insert(bugReports).values({
    userId: user?.id ?? null,
    contextKind: kind,
    contextId: typeof contextId === "string" ? contextId.slice(0, 200) : null,
    contextTitle: typeof contextTitle === "string" ? contextTitle.slice(0, 300) : "",
    message: message.trim().slice(0, MAX_MESSAGE_LENGTH),
  });

  return Response.json({ ok: true });
}
