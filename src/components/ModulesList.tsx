"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/hooks/useProgress";
import { withPlural } from "@/lib/plural";
import type { Step } from "@/lib/content/types";

export type ModuleCard = {
  slug: string;
  title: string;
  description: string;
  lessonCount: number;
  taskCount: number;
  steps: Step[];
};

export function ModulesList({ modules }: { modules: ModuleCard[] }) {
  const progress = useProgress();

  const doneIn = (steps: Step[]) =>
    progress.ready
      ? steps.filter((step) =>
          step.kind === "lesson" ? progress.lessons.has(step.id) : progress.tasks.has(step.id),
        ).length
      : 0;

  return (
    <ul className="space-y-3">
      {modules.map((module) => {
        const done = doneIn(module.steps);

        return (
          <li key={module.slug}>
            <Link
              href={`/modules/${module.slug}`}
              className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent hover:bg-surface-2"
            >
              <div className="mb-1.5 flex items-baseline gap-3">
                <h2 className="text-[16.5px] font-semibold text-text">{module.title}</h2>
                <span className="text-[12px] text-faint">
                  {withPlural(module.lessonCount, ["урок", "урока", "уроков"])} ·{" "}
                  {withPlural(module.taskCount, ["задача", "задачи", "задач"])}
                </span>
              </div>

              <p className="mb-4 max-w-2xl text-[13.5px] leading-relaxed text-muted">
                {module.description}
              </p>

              <ProgressBar done={done} total={module.steps.length} className="max-w-xs" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
