import { withPlural } from "@/lib/plural";

/**
 * Даты для интерфейса преподавателя.
 *
 * Пояс задан явно, а не берётся из окружения. Без этого время зависит от того,
 * где запущен процесс: на машине владельца выходит московское, на Vercel —
 * UTC, и преподаватель решил бы, что ученик занимался на три часа раньше.
 * Меняется переменной `PLATFORM_TIMEZONE`.
 *
 * Форматирование считается на сервере и уезжает готовой строкой: `toLocale*`
 * на клиенте дал бы другой результат, чем при отрисовке на сервере, и React
 * ругался бы на расхождение разметки.
 */
const TIME_ZONE = process.env.PLATFORM_TIMEZONE || "Europe/Moscow";

const DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const TIME_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

/** Календарная дата в поясе платформы — по ней считается разница в днях */
const DAY_PARTS = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

const DAY = 24 * 60 * 60 * 1000;

/**
 * Номер календарного дня в поясе платформы.
 *
 * Через `formatToParts`, а не через `getDate()` и соседей: те отдают день
 * по поясу процесса, и «сегодня» под утро определялось бы неверно.
 */
function dayNumber(date: Date): number {
  const parts = DAY_PARTS.formatToParts(date);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day")) / DAY;
}

/** «сегодня в 14:05», «вчера в 09:12», «3 дня назад», иначе полная дата */
export function formatActivity(date: Date | null, now: Date = new Date()): string {
  if (!date) return "не заходил";

  const daysAgo = dayNumber(now) - dayNumber(date);

  if (daysAgo <= 0) return `сегодня в ${TIME_FORMAT.format(date)}`;
  if (daysAgo === 1) return `вчера в ${TIME_FORMAT.format(date)}`;
  if (daysAgo < 7) return `${withPlural(daysAgo, ["день", "дня", "дней"])} назад`;

  return DATE_FORMAT.format(date);
}

export function formatDate(date: Date | null): string {
  return date ? DATE_FORMAT.format(date) : "—";
}
