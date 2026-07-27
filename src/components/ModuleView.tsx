"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/hooks/useProgress";
import type { Module, Step } from "@/lib/content/types";

type Props = {
  module: Module;
  steps: Step[];
};

function StepRow({
  step,
  index,
  done,
  locked,
}: {
  step: Step;
  index: number;
  done: boolean;
  locked: boolean;
}) {
  return (
    <li>
      <Link
        href={step.href}
        className={`flex items-center gap-3.5 rounded-lg border px-4 py-3 transition-colors ${
          done
            ? "border-ok/35 bg-surface hover:bg-surface-2"
            : "border-border bg-surface hover:border-accent hover:bg-surface-2"
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
            done ? "bg-ok-soft text-ok" : "bg-hover text-faint"
          }`}
        >
          {done ? "✓" : index}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] text-text">{step.title}</span>
        </span>

        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            step.kind === "task"
              ? "bg-accent-soft text-accent-strong"
              : "bg-hover text-muted"
          }`}
        >
          {step.kind === "task" ? "задача" : "урок"}
        </span>

        {locked && <span className="shrink-0 text-[11px] text-faint">по порядку</span>}
      </Link>
    </li>
  );
}

export function ModuleView({ module, steps }: Props) {
  const progress = useProgress();

  const isDone = (step: Step) =>
    step.kind === "lesson" ? progress.lessons.has(step.id) : progress.tasks.has(step.id);

  const doneCount = progress.ready ? steps.filter(isDone).length : 0;
  const lessonSteps = steps.filter((step) => step.kind === "lesson");
  const taskSteps = steps.filter((step) => step.kind === "task");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="mb-5 inline-block text-[13px] text-muted transition-colors hover:text-accent">
        ← Все модули
      </Link>

      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-text">{module.title}</h1>
      <p className="mb-5 max-w-2xl text-[14px] leading-relaxed text-muted">{module.description}</p>

      <ProgressBar done={doneCount} total={steps.length} className="mb-9 max-w-xs" />

      <section className="mb-8">
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-faint">
          Материалы
        </h2>
        <ul className="space-y-2">
          {lessonSteps.map((step, index) => (
            <StepRow key={step.id} step={step} index={index + 1} done={isDone(step)} locked={false} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-faint">
          Задачи
        </h2>
        <ul className="space-y-2">
          {taskSteps.map((step, index) => (
            <StepRow
              key={step.id}
              step={step}
              index={lessonSteps.length + index + 1}
              done={isDone(step)}
              locked={false}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}
