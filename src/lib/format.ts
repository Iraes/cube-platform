/**
 * Человекочитаемое представление значения для панели результатов
 * («ожидалось / получено»). Отдельно от форматирования внутри воркера:
 * туда значения не передать, а сюда приходят уже клонированные.
 */
export function formatValue(value: unknown, seen: unknown[] = []): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";

  const type = typeof value;
  if (type === "string") return JSON.stringify(value);
  if (type === "number") return Object.is(value, -0) ? "-0" : String(value);
  if (type === "boolean") return String(value);
  if (type === "bigint") return `${String(value)}n`;
  if (type === "symbol") return String(value);
  if (type === "function") return "[function]";

  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return String(value);
  if (seen.includes(value)) return "[циклическая ссылка]";

  const nested = [...seen, value];

  if (Array.isArray(value)) {
    return `[${value.map((item) => formatValue(item, nested)).join(", ")}]`;
  }

  if (value instanceof Map) {
    const pairs = [...value.entries()].map(
      ([k, v]) => `${formatValue(k, nested)} => ${formatValue(v, nested)}`,
    );
    return `Map(${pairs.join(", ")})`;
  }

  if (value instanceof Set) {
    return `Set(${[...value.values()].map((v) => formatValue(v, nested)).join(", ")})`;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return "{}";

  return `{ ${entries.map(([k, v]) => `${k}: ${formatValue(v, nested)}`).join(", ")} }`;
}
