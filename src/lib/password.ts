import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Хеширование паролей на scrypt из стандартной библиотеки Node —
 * без внешних зависимостей. Формат строки: scrypt:<соль>:<хеш>.
 */
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");

  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

/**
 * Пустая проверка для несуществующего пользователя: уравнивает время ответа,
 * чтобы по задержке нельзя было понять, заведён ли такой логин.
 */
export async function dummyVerify(): Promise<void> {
  await scryptAsync("dummy-password", "dummy-salt", KEY_LENGTH);
}
