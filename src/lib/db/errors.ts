/**
 * Пользователя удалили, а его вкладка осталась открытой: токен сессии
 * ещё подписан и валиден, но записи в базу падают по внешнему ключу.
 * Отличаем этот случай, чтобы ответить «войдите заново» вместо 500.
 *
 * Drizzle заворачивает ошибку драйвера в свою, поэтому код Postgres
 * (23503 — нарушение внешнего ключа) лежит в `cause`, а не сверху.
 */
export function isMissingUserError(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== "object" || depth > 3) return false;

  const candidate = error as { code?: unknown; message?: unknown; cause?: unknown };

  if (candidate.code === "23503") return true;

  const message = String(candidate.message ?? "");
  if (message.includes("violates foreign key constraint")) return true;

  return isMissingUserError(candidate.cause, depth + 1);
}
