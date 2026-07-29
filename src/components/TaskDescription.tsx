import Link from "next/link";
import { DemoNotice } from "@/components/DemoNotice";
import { Markdown } from "@/components/Markdown";
import type { Task } from "@/lib/runner/types";

type Props = {
  task: Task;
  moduleSlug?: string;
  moduleTitle?: string;
  solved?: boolean;
  isDemo?: boolean;
};

export function TaskDescription({ task, moduleSlug, moduleTitle, solved, isDemo }: Props) {
  const backHref = isDemo ? "/demo" : moduleSlug ? `/modules/${moduleSlug}` : "/";
  const backLabel = isDemo ? "Демо-доступ" : (moduleTitle ?? "Все модули");

  return (
    <section className="h-full overflow-y-auto bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Link href={backHref} className="text-[13px] text-muted transition-colors hover:text-accent">
          ← {backLabel}
        </Link>

        {solved && !isDemo && (
          <span className="ml-auto rounded-full bg-ok-soft px-2.5 py-0.5 text-[11.5px] font-medium text-ok">
            ✓ решено
          </span>
        )}
      </div>

      <h1 className="mb-4 text-xl font-semibold tracking-tight text-text">{task.title}</h1>

      {isDemo && <DemoNotice />}

      <Markdown text={task.description} />
    </section>
  );
}
