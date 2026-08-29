import { and, eq, isNull, lt, or } from "drizzle-orm";
import { getDb } from "./index";
import { users, type UserRow } from "./schema";
import { hashPassword } from "@/lib/password";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  const db = await getDb();
  const rows = await db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
  return rows[0];
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
  role?: "student" | "teacher" | "admin";
}): Promise<UserRow> {
  const db = await getDb();

  const [row] = await db
    .insert(users)
    .values({
      email: normalizeEmail(input.email),
      name: input.name ?? null,
      passwordHash: await hashPassword(input.password),
      role: input.role ?? "student",
    })
    .returning();

  return row;
}

export async function setUserPassword(email: string, password: string): Promise<boolean> {
  const db = await getDb();

  const updated = await db
    .update(users)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(users.email, normalizeEmail(email)))
    .returning({ id: users.id });

  return updated.length > 0;
}

export async function setUserRoleByEmail(
  email: string,
  role: "student" | "teacher" | "admin",
): Promise<boolean> {
  const db = await getDb();
  const updated = await db
    .update(users)
    .set({ role })
    .where(eq(users.email, normalizeEmail(email)))
    .returning({ id: users.id });

  return updated.length > 0;
}

export async function setUserRole(
  id: string,
  role: "student" | "teacher" | "admin",
): Promise<void> {
  const db = await getDb();
  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function deleteUserById(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(users).where(eq(users.id, id));
}

export async function setPasswordById(id: string, password: string): Promise<void> {
  const db = await getDb();
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, id));
}

export async function deleteUser(email: string): Promise<boolean> {
  const db = await getDb();

  const removed = await db
    .delete(users)
    .where(eq(users.email, normalizeEmail(email)))
    .returning({ id: users.id });

  return removed.length > 0;
}

export async function listUsers(): Promise<UserRow[]> {
  const db = await getDb();
  return db.select().from(users);
}

/** Через сколько повторный заход считается новым и пишется в базу */
const PRESENCE_THROTTLE_MS = 5 * 60 * 1000;

/**
 * Отмечает, что пользователь сейчас на платформе.
 *
 * Пишем не на каждый переход по страницам, а не чаще раза в пять минут:
 * до Neon каждый запрос — отдельный HTTP-вызов, и «был минуту назад» вместо
 * «был только что» преподавателю ничего не меняет. Возвращает true, если
 * запись действительно случилась.
 */
export async function touchLastSeen(id: string): Promise<boolean> {
  const db = await getDb();
  const updated = await db
    .update(users)
    .set({ lastSeenAt: new Date() })
    .where(
      and(
        eq(users.id, id),
        or(
          isNull(users.lastSeenAt),
          lt(users.lastSeenAt, new Date(Date.now() - PRESENCE_THROTTLE_MS)),
        ),
      ),
    )
    .returning({ id: users.id });

  return updated.length > 0;
}
