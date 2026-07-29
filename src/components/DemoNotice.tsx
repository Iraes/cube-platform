import Link from "next/link";

/** Плашка демо-режима: объясняет, почему прогресс не сохраняется */
export function DemoNotice({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mb-7 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-surface px-4 py-3 ${className}`}
    >
      <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11.5px] font-medium text-accent-strong">
        демо
      </span>
      <span className="text-[13px] text-muted">
        Прогресс не сохраняется — для этого нужен логин от владельца платформы.
      </span>
      <Link
        href="/login"
        className="text-[13px] text-accent underline underline-offset-2 transition-colors hover:text-accent-strong"
      >
        Войти
      </Link>
    </div>
  );
}
