"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { BugReportButton } from "@/components/BugReportButton";
import { DemoNotice } from "@/components/DemoNotice";
import { Markdown } from "@/components/Markdown";
import type { Step } from "@/lib/content/types";
import type { PublicQuestion, QuizVerdict } from "@/lib/quiz";

type Props = {
  slug: string;
  title: string;
  description: string;
  questions: PublicQuestion[];
  solved: boolean;
  moduleSlug?: string;
  moduleTitle?: string;
  nextStep?: Step;
  isDemo?: boolean;
};

export function QuizWorkspace({
  slug,
  title,
  description,
  questions,
  solved,
  moduleSlug,
  moduleTitle,
  nextStep,
  isDemo = false,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [verdict, setVerdict] = useState<QuizVerdict | null>(null);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<"none" | "network" | "session">("none");

  const backHref = isDemo ? "/demo" : moduleSlug ? `/modules/${moduleSlug}` : "/";
  const backLabel = isDemo ? "Демо-доступ" : (moduleTitle ?? "Все модули");

  const byId = useMemo(
    () => new Map(verdict?.questions.map((question) => [question.id, question])),
    [verdict],
  );

  const answeredAll = questions.every((question) => (answers[question.id]?.length ?? 0) > 0);

  const toggle = useCallback(
    (question: PublicQuestion, optionId: string) => {
      // Ответ поменяли — прошлый вердикт больше не актуален
      setVerdict(null);
      setFailed("none");

      setAnswers((prev) => {
        const current = prev[question.id] ?? [];

        if (!question.multiple) {
          return { ...prev, [question.id]: [optionId] };
        }

        return {
          ...prev,
          [question.id]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      });
    },
    [],
  );

  const submit = async () => {
    setSending(true);
    setFailed("none");

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskSlug: slug, answers }),
      });

      if (!response.ok) {
        setFailed(response.status === 401 ? "session" : "network");
        return;
      }

      const data = (await response.json()) as { verdict: QuizVerdict };
      setVerdict(data.verdict);
      if (data.verdict.allPassed && !solved && !isDemo) router.refresh();
    } catch {
      setFailed("network");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-[13px]">
        <Link href={backHref} className="text-muted transition-colors hover:text-accent">
          ← {backLabel}
        </Link>
        {solved && !isDemo && (
          <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[11.5px] font-medium text-ok">
            ✓ решено
          </span>
        )}
        <BugReportButton
          contextKind="task"
          contextId={slug}
          contextTitle={title}
          className="ml-auto"
        />
      </div>

      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-text">{title}</h1>

      {isDemo && <DemoNotice />}

      {description && (
        <div className="mb-8">
          <Markdown text={description} />
        </div>
      )}

      <ol className="space-y-5">
        {questions.map((question, index) => {
          const chosen = answers[question.id] ?? [];
          const result = byId.get(question.id);

          return (
            <li
              key={question.id}
              className={`rounded-lg border p-5 ${
                result
                  ? result.passed
                    ? "border-ok/40 bg-ok-soft"
                    : "border-err/40 bg-err-soft"
                  : "border-border bg-surface"
              }`}
            >
              <div className="mb-3 flex items-baseline gap-2">
                <span className="font-mono text-[12px] text-faint">{index + 1}</span>
                <p className="flex-1 text-[15px] leading-snug font-medium text-text">
                  {question.text}
                </p>
                {result && (
                  <span
                    aria-hidden="true"
                    className={`font-bold ${result.passed ? "text-ok" : "text-err"}`}
                  >
                    {result.passed ? "✓" : "✗"}
                  </span>
                )}
              </div>

              {question.multiple && (
                <p className="mb-2.5 text-[12.5px] text-faint">Верных вариантов несколько</p>
              )}

              <div className="space-y-1.5">
                {question.options.map((option) => {
                  const picked = chosen.includes(option.id);
                  const isCorrect = result?.correct.includes(option.id) ?? false;

                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 transition-colors ${
                        result && isCorrect
                          ? "border-ok/50 bg-ok-soft"
                          : result && picked && !isCorrect
                            ? "border-err/50 bg-err-soft"
                            : picked
                              ? "border-accent bg-accent-soft"
                              : "border-border bg-bg hover:border-border-strong"
                      }`}
                    >
                      <input
                        type={question.multiple ? "checkbox" : "radio"}
                        name={question.id}
                        checked={picked}
                        onChange={() => toggle(question, option.id)}
                        className="mt-0.5 accent-[var(--c-accent)]"
                      />
                      <span className="text-[13.5px] leading-snug text-text">{option.text}</span>
                      {result && isCorrect && (
                        <span className="ml-auto shrink-0 text-[11.5px] text-ok">верно</span>
                      )}
                    </label>
                  );
                })}
              </div>

              {result?.explanation && (
                <p className="mt-3 border-t border-border pt-3 text-[13px] leading-relaxed text-muted">
                  {result.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={sending || !answeredAll}
          className="h-9 rounded-md bg-accent px-5 text-[13.5px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
          title={answeredAll ? undefined : "Ответьте на все вопросы"}
        >
          {sending ? "Проверяем…" : verdict ? "Проверить ещё раз" : "Проверить"}
        </button>

        {!answeredAll && !verdict && (
          <span className="text-[13px] text-faint">Ответьте на все вопросы</span>
        )}

        {verdict && (
          <span
            className={`text-[13.5px] font-semibold ${verdict.allPassed ? "text-ok" : "text-muted"}`}
          >
            Верно {verdict.passedCount} из {verdict.total}
            {verdict.allPassed && (
              <span className="ml-2 font-normal text-ok">
                {isDemo ? "— всё верно, но в демо не засчитывается" : "— тест засчитан"}
              </span>
            )}
          </span>
        )}

        {failed === "network" && (
          <span className="text-[13px] text-err">
            Не удалось проверить — проверьте соединение и попробуйте ещё раз
          </span>
        )}

        {failed === "session" && (
          <span className="text-[13px] text-err">
            Сессия больше не действует —{" "}
            <Link href="/login" className="underline underline-offset-2">
              войдите заново
            </Link>
          </span>
        )}

        {verdict?.allPassed && nextStep && (
          <Link
            href={nextStep.href}
            prefetch={false}
            className="ml-auto h-9 rounded-md bg-ok px-4 text-[13px] font-semibold leading-9 text-accent-fg transition-opacity hover:opacity-90"
          >
            Дальше: {nextStep.title} →
          </Link>
        )}
      </div>
    </main>
  );
}
