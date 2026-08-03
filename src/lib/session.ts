import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type UserRole = "student" | "teacher" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    role: session.user.role ?? "student",
  };
}

/** Для страниц, доступных только вошедшим: иначе отправляем на форму входа */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Для раздела управления. Проверка роли живёт на сервере: прятать кнопки
 * в интерфейсе недостаточно, страницы и действия должны отказывать сами.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}

/**
 * Для раздела с прогрессом учеников. Администратор проходит тоже: он и так
 * может всё, отдельная роль нужна тем, кто ведёт учеников, но не правит
 * платформу.
 */
export async function requireTeacher(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "teacher" && user.role !== "admin") redirect("/");
  return user;
}
