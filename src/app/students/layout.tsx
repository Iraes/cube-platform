import Link from "next/link";
import { requireTeacher } from "@/lib/session";

export const metadata = { title: "Ученики — Cube" };

/**
 * Раздел преподавателя. Проверка роли — здесь и на каждой странице внутри:
 * layout в Next не гарантирует выполнение перед вложенной страницей при
 * частичной навигации, поэтому дублирование намеренное.
 */
export default async function StudentsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeacher();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <nav className="mb-8 flex items-center gap-1 border-b border-border pb-3 text-[13.5px]">
        <Link
          href="/students"
          className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-hover hover:text-text"
        >
          Ученики
        </Link>
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-hover hover:text-text"
          >
            Управление
          </Link>
        )}
        <Link href="/" className="ml-auto rounded-md px-3 py-1.5 text-faint transition-colors hover:text-accent">
          ← К платформе
        </Link>
      </nav>

      {children}
    </div>
  );
}
