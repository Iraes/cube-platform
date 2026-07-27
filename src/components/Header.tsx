import Link from "next/link";
import { ThemeSelect } from "@/components/ThemeSelect";
import { logoutAction } from "@/lib/actions/auth";
import { getSessionUser } from "@/lib/session";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface px-5">
      <Link href="/" className="flex items-center gap-2.5 text-text">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent font-mono text-[11px] font-bold text-accent-fg">
          {"{}"}
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Cube</span>
      </Link>

      <div className="flex-1" />

      <ThemeSelect />

      {user && (
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <span className="max-w-40 truncate text-[13px] text-muted" title={user.email}>
            {user.name || user.email}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="h-8 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text"
            >
              Выйти
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
