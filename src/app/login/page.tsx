import Link from "next/link";
import { redirect } from "next/navigation";
import { getDemoContent } from "@/lib/content";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Вход — Cube" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/");

  // Кнопку демо показываем, только если владелец что-то в него открыл
  const demo = await getDemoContent();
  const demoCount = demo.reduce(
    (sum, entry) => sum + entry.lessons.length + entry.taskSlugs.length,
    0,
  );

  return (
    <main className="mx-auto flex max-w-sm flex-col justify-center px-6 py-20">
      <h1 className="mb-1.5 text-xl font-semibold tracking-tight text-text">Вход</h1>
      <p className="mb-7 text-[13.5px] leading-relaxed text-muted">
        Логин и пароль выдаёт владелец платформы — регистрации здесь нет.
      </p>

      <LoginForm />

      {demoCount > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-3 text-[13px] leading-relaxed text-muted">
            Хотите сначала посмотреть, как всё устроено? Часть материалов и задач открыта без
            входа.
          </p>
          <Link
            href="/demo"
            className="inline-block h-9 rounded-md border border-border-strong px-4 text-[13.5px] font-medium leading-9 text-text transition-colors hover:bg-hover"
          >
            Демо-доступ →
          </Link>
        </div>
      )}
    </main>
  );
}
