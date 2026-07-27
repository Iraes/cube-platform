import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import type { Task } from "@/lib/runner/types";

type Props = {
  task: Task;
  moduleSlug?: string;
  moduleTitle?: string;
  solved?: boolean;
};

export function TaskDescription({ task, moduleSlug, moduleTitle, solved }: Props) {
  return (
    <section className="h-full overflow-y-auto bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href={moduleSlug ? `/modules/${moduleSlug}` : "/"}
          className="text-[13px] text-muted transition-colors hover:text-accent"
        >
          ← {moduleTitle ?? "Все модули"}
        </Link>

        {solved && (
          <span className="ml-auto rounded-full bg-ok-soft px-2.5 py-0.5 text-[11.5px] font-medium text-ok">
            ✓ решено
          </span>
        )}
      </div>

      <h1 className="mb-4 text-xl font-semibold tracking-tight text-text">{task.title}</h1>

      <Markdown text={task.description} />
    </section>
  );
}
