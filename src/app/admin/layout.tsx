import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Управление — Cube" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <nav className="mb-8 flex items-center gap-1 border-b border-border pb-3 text-[13.5px]">
        <Link href="/admin" className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-hover hover:text-text">
          Управление
        </Link>
        <Link href="/admin/modules" className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-hover hover:text-text">
          Модули
        </Link>
        <Link href="/admin/users" className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-hover hover:text-text">
          Пользователи
        </Link>
        <Link href="/students" className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-hover hover:text-text">
          Ученики
        </Link>
        <Link href="/admin/bugs" className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-hover hover:text-text">
          Баги
        </Link>
        <Link href="/" className="ml-auto rounded-md px-3 py-1.5 text-faint transition-colors hover:text-accent">
          ← К платформе
        </Link>
      </nav>

      {children}
    </div>
  );
}
