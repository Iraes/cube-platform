"use client";

import type { QuizQuestion } from "@/lib/runner/types";

const inputClass =
  "h-9 w-full rounded-md border border-border bg-bg px-3 text-[13.5px] text-text outline-none focus:border-accent";

/** Идентификаторы вопросов и вариантов автору видеть не нужно — генерируем сами */
function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyQuestion(): QuizQuestion {
  return {
    id: newId("q"),
    text: "",
    options: [
      { id: newId("o"), text: "" },
      { id: newId("o"), text: "" },
    ],
    correct: [],
  };
}

type Props = {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
};

export function QuizBlockEditor({ questions, onChange }: Props) {
  const patchQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    onChange(questions.map((question, i) => (i === index ? { ...question, ...patch } : question)));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const toggleCorrect = (index: number, optionId: string) => {
    const question = questions[index];
    patchQuestion(index, {
      correct: question.correct.includes(optionId)
        ? question.correct.filter((id) => id !== optionId)
        : [...question.correct, optionId],
    });
  };

  return (
    <div className="space-y-4">
      {questions.length === 0 && (
        <p className="rounded-md border border-dashed border-border p-3 text-[13px] text-faint">
          Пока ни одного вопроса.
        </p>
      )}

      {questions.map((question, index) => (
        <div key={question.id} className="rounded-md border border-border bg-bg p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[12px] text-faint">Вопрос {index + 1}</span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveQuestion(index, -1)}
                disabled={index === 0}
                className="px-1.5 text-[12px] text-faint transition-colors hover:text-accent disabled:opacity-30"
                aria-label="Выше"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => moveQuestion(index, 1)}
                disabled={index === questions.length - 1}
                className="px-1.5 text-[12px] text-faint transition-colors hover:text-accent disabled:opacity-30"
                aria-label="Ниже"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => onChange(questions.filter((_, i) => i !== index))}
                className="px-2 text-[12.5px] text-muted transition-colors hover:text-err"
              >
                удалить
              </button>
            </div>
          </div>

          <input
            value={question.text}
            onChange={(event) => patchQuestion(index, { text: event.target.value })}
            placeholder="Текст вопроса"
            className={`${inputClass} mb-2`}
          />

          <p className="mb-1.5 text-[12px] text-faint">
            Отметьте галочкой верные варианты. Если их больше одного, вопрос станет
            с мультивыбором.
          </p>

          <div className="space-y-1.5">
            {question.options.map((option, optionIndex) => (
              <div key={option.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={question.correct.includes(option.id)}
                  onChange={() => toggleCorrect(index, option.id)}
                  className="accent-[var(--c-accent)]"
                  aria-label={`Вариант ${optionIndex + 1} верный`}
                />
                <input
                  value={option.text}
                  onChange={(event) =>
                    patchQuestion(index, {
                      options: question.options.map((item) =>
                        item.id === option.id ? { ...item, text: event.target.value } : item,
                      ),
                    })
                  }
                  placeholder={`Вариант ${optionIndex + 1}`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    patchQuestion(index, {
                      options: question.options.filter((item) => item.id !== option.id),
                      correct: question.correct.filter((id) => id !== option.id),
                    })
                  }
                  disabled={question.options.length <= 2}
                  className="shrink-0 px-1.5 text-[12.5px] text-muted transition-colors hover:text-err disabled:opacity-30"
                  title={question.options.length <= 2 ? "Нужно минимум два варианта" : "Удалить"}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                patchQuestion(index, {
                  options: [...question.options, { id: newId("o"), text: "" }],
                })
              }
              className="h-7 rounded-md border border-border px-2.5 text-[12.5px] text-muted transition-colors hover:bg-hover hover:text-text"
            >
              + вариант
            </button>

            {question.correct.length === 0 && (
              <span className="text-[12px] text-warn">Не отмечен верный вариант</span>
            )}
          </div>

          <input
            value={question.explanation ?? ""}
            onChange={(event) => patchQuestion(index, { explanation: event.target.value })}
            placeholder="Разбор, который увидит ученик после проверки (необязательно)"
            className={`${inputClass} mt-2`}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...questions, emptyQuestion()])}
        className="h-8 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text"
      >
        + вопрос
      </button>
    </div>
  );
}
