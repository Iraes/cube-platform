import Link from "next/link";
import { ThemeSelect } from "@/components/ThemeSelect";

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface px-5">
      <Link href="/" className="flex items-center gap-2.5 text-text">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent font-mono text-[11px] font-bold text-accent-fg">
          {"{}"}
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Fabel</span>
      </Link>

      <div className="flex-1" />

      <ThemeSelect />
    </header>
  );
}
