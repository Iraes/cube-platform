"use client";

import { useMemo, useState } from "react";
import type { PublicQuestion, QuizVerdict } from "@/lib/quiz";

type Props = {
  lessonId: string;
  /** Позиция блока в уроке — по ней сервер находит нужный тест */
  blockIndex: number;
  title?: string;
  questions: PublicQuestion[];
};

/**
 * Тест внутри урока: самопроверка сразу после теории.
 * Свёрнут по умолчанию, чтобы не разрывать чтение, и не идёт в прогресс —
 * ошибаться можно сколько угодно.
 */
export function LessonQuiz({ lessonId, blockIndex, title, questions }: Props) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [verdict, setVerdict] = useState<QuizVerdict | null>(null);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const byId = useMemo(
    () => new Map(verdict?.questions.map((question) => [question.id, question])),
    [verdict],
  );

  const answeredAll = questions.every((question) => (answers[question.id]?.length ?? 0) > 0);

  const toggle = (question: PublicQuestion, optionId: string) => {
    setVerdict(null);
    setFailed(false);

    setAnswers((prev) => {
      const current = prev[question.id] ?? [];

      if (!question.multiple) return { ...prev, [question.id]: [optionId] };

      return {
        ...prev,
        [question.id]: current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      };
    });
  };

  const check = async () => {
    setSending(true);
    setFailed(false);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, blockIndex, answers }),
      });

      if (!response.ok) {
        setFailed(true);
        return;
      }

      const data = (await response.json()) as { verdict: QuizVerdict };
      setVerdict(data.verdict);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setVerdict(null);
    setFailed(false);
  };

  return (
    <section className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2"
      >
        <span
          aria-hidden="true"
          className={`text-[11px] text-faint transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-medium text-text">
            {title || "Проверь себя"}
          </span>
          <span className="text-[12.5px] text-faint">
            {questions.length}{" "}
            {questions.length === 1 ? "вопрос" : questions.length < 5 ? "вопроса" : "вопросов"} ·
            на прогресс не влияет
          </span>
        </span>

        {verdict && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ${
              verdict.allPassed ? "bg-ok-soft text-ok" : "bg-hover text-muted"
            }`}
          >
            {verdict.passedCount} из {verdict.total}
          </span>
        )}
      </button>

      {open && (
        <div className="border-t border-border p-4">
          <ol className="space-y-4">
            {questions.map((question, index) => {
              const chosen = answers[question.id] ?? [];
              const result = byId.get(question.id);

              return (
                <li key={question.id}>
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="font-mono text-[12px] text-faint">{index + 1}</span>
                    <p className="flex-1 text-[14px] leading-snug text-text">{question.text}</p>
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
                    <p className="mb-2 pl-6 text-[12px] text-faint">Верных вариантов несколько</p>
                  )}

                  <div className="space-y-1.5 pl-6">
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
                            name={`${lessonId}-${blockIndex}-${question.id}`}
                            checked={picked}
                            onChange={() => toggle(question, option.id)}
                            className="mt-0.5 accent-[var(--c-accent)]"
                          />
                          <span className="text-[13.5px] leading-snug text-text">
                            {option.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {result?.explanation && (
                    <p className="mt-2 pl-6 text-[13px] leading-relaxed text-muted">
                      {result.explanation}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => void check()}
              disabled={sending || !answeredAll}
              className="h-8 rounded-md bg-accent px-4 text-[13px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {sending ? "Проверяем…" : "Проверить"}
            </button>

            {verdict && (
              <button
                type="button"
                onClick={reset}
                className="h-8 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text"
              >
                Пройти заново
              </button>
            )}

            {!answeredAll && !verdict && (
              <span className="text-[12.5px] text-faint">Ответьте на все вопросы</span>
            )}

            {verdict && (
              <span
                className={`text-[13px] font-medium ${verdict.allPassed ? "text-ok" : "text-muted"}`}
              >
                {verdict.allPassed
                  ? "Всё верно"
                  : `Верно ${verdict.passedCount} из ${verdict.total}`}
              </span>
            )}

            {failed && <span className="text-[13px] text-err">Не удалось проверить</span>}
          </div>
        </div>
      )}
    </section>
  );
}
