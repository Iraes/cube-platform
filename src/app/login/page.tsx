import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Вход — Fabel" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/");

  return (
    <main className="mx-auto flex max-w-sm flex-col justify-center px-6 py-20">
      <h1 className="mb-1.5 text-xl font-semibold tracking-tight text-text">Вход</h1>
      <p className="mb-7 text-[13.5px] leading-relaxed text-muted">
        Логин и пароль выдаёт владелец платформы — регистрации здесь нет.
      </p>

      <LoginForm />
    </main>
  );
}
