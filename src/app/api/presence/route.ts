import { isMissingUserError } from "@/lib/db/errors";
import { touchLastSeen } from "@/lib/db/users";
import { getSessionUser } from "@/lib/session";

/**
 * Отметка «пользователь на платформе».
 *
 * Отдельно от прогресса: тот двигается только отправкой решения и кнопкой
 * «Прочитано», а зайти почитать и ничего не нажать — обычное дело.
 * Пишет не чаще раза в пять минут, см. `touchLastSeen`.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    // Гость из демо — это не ошибка, просто отмечать некого
    return Response.json({ ok: false });
  }

  try {
    await touchLastSeen(user.id);
  } catch (error) {
    // Учётку удалили, а вкладка осталась открытой
    if (isMissingUserError(error)) {
      return Response.json({ error: "session-expired" }, { status: 401 });
    }
    throw error;
  }

  return Response.json({ ok: true });
}
