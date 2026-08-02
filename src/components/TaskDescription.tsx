import Link from "next/link";
import { DemoNotice } from "@/components/DemoNotice";
import { Markdown } from "@/components/Markdown";
import type { Step } from "@/lib/content/types";
import type { CodeTask } from "@/lib/runner/types";

type Props = {
  task: CodeTask;
  moduleSlug?: string;
  moduleTitle?: string;
  solved?: boolean;
  isDemo?: boolean;
  /** Следующий шаг модуля — ссылка видна всегда, а не только после сдачи */
  nextStep?: Step;
};

export function TaskDescription({
  task,
  moduleSlug,
  moduleTitle,
  solved,
  isDemo,
  nextStep,
}: Props) {
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

      {nextStep && (
        <div className="mt-7 border-t border-border pt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
            {nextStep.kind === "lesson" ? "Следующий урок" : "Следующая задача"}
          </p>
          <Link
            href={nextStep.href}
            prefetch={false}
            className="flex items-center gap-3 rounded-lg border border-border bg-bg px-4 py-3 transition-colors hover:border-accent hover:bg-hover"
          >
            <span className="min-w-0 flex-1 text-[14px] text-text">{nextStep.title}</span>
            <span aria-hidden="true" className="shrink-0 text-accent">
              →
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}
