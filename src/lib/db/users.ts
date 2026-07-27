import { eq } from "drizzle-orm";
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
  role?: "student" | "teacher";
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

export async function listUsers(): Promise<UserRow[]> {
  const db = await getDb();
  return db.select().from(users);
}
