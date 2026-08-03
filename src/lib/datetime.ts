/**
 * Даты для интерфейса преподавателя.
 *
 * Форматирование считается на сервере и уезжает строкой: `toLocaleString`
 * на клиенте даёт другой результат, чем при отрисовке на сервере, и React
 * ругается на расхождение разметки.
 */

import { withPlural } from "@/lib/plural";

const DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const TIME_FORMAT = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

const DAY = 24 * 60 * 60 * 1000;

/** «сегодня в 14:05», «вчера в 09:12», «3 дня назад», иначе полная дата */
export function formatActivity(date: Date | null, now: Date = new Date()): string {
  if (!date) return "не заходил";

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const daysAgo = Math.round((startOfToday - startOfDate) / DAY);

  if (daysAgo <= 0) return `сегодня в ${TIME_FORMAT.format(date)}`;
  if (daysAgo === 1) return `вчера в ${TIME_FORMAT.format(date)}`;
  if (daysAgo < 7) return `${withPlural(daysAgo, ["день", "дня", "дней"])} назад`;

  return DATE_FORMAT.format(date);
}

export function formatDate(date: Date | null): string {
  return date ? DATE_FORMAT.format(date) : "—";
}
