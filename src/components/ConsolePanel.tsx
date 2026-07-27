"use client";

import type { RunMode, RunResult } from "@/lib/runner/types";
import { formatValue } from "@/lib/format";

type Props = {
  result: RunResult | null;
  running: boolean;
  mode: RunMode | null;
};

function ErrorBlock({ error }: { error: NonNullable<RunResult["error"]> }) {
  return (
    <div className="rounded-md border border-err/40 bg-err-soft p-3">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-err">
          Ошибка выполнения
        </span>
        {typeof error.line === "number" && (
          <span className="font-mono text-[11px] text-muted">
            строка {error.line}
            {typeof error.column === "number" ? `, символ ${error.column}` : ""}
          </span>
        )}
      </div>
      <p className="font-mono text-[12.5px] leading-relaxed break-words text-err">{error.message}</p>
    </div>
  );
}

function TestRow({ result }: { result: RunResult["results"][number] }) {
  return (
    <li className={`rounded-md p-2.5 ${result.passed ? "bg-ok-soft" : "bg-err-soft"}`}>
      <div className="flex gap-2">
        <span aria-hidden="true" className={`font-bold ${result.passed ? "text-ok" : "text-err"}`}>
          {result.passed ? "✓" : "✗"}
        </span>
        <span className="text-[13px] leading-snug text-text">{result.name}</span>
      </div>

      {!result.passed && (
        <div className="mt-2 space-y-1 pl-6 font-mono text-[12px]">
          {result.error ? (
            <p className="break-words text-err">{result.error}</p>
          ) : (
            <>
              <p className="break-words text-muted">
                <span className="text-faint">ожидалось: </span>
                {formatValue(result.expected)}
              </p>
              <p className="break-words text-muted">
                <span className="text-faint">получено: </span>
                {formatValue(result.actual)}
              </p>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export function ConsolePanel({ result, running, mode }: Props) {
  const passed = result?.results.filter((item) => item.passed).length ?? 0;
  const total = result?.results.length ?? 0;
  const allPassed = total > 0 && passed === total && !result?.error;
  const showTests = mode === "submit" && total > 0;

  return (
    <section className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {mode === "submit" ? "Результат проверки" : "Консоль"}
        </h2>
        {running && <span className="text-[12px] text-warn">выполняется…</span>}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {!result && !running && (
          <p className="text-[13px] leading-relaxed text-faint">
            «Запустить» — выполнить код и посмотреть вывод. «Отправить на проверку» — прогнать
            тесты и засчитать задачу.
          </p>
        )}

        {result?.error && <ErrorBlock error={result.error} />}

        {result && result.logs.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">
              Вывод
            </h3>
            <div className="space-y-0.5">
              {result.logs.map((line, index) => (
                <p
                  key={index}
                  className={`font-mono text-[12.5px] leading-relaxed break-words whitespace-pre-wrap ${
                    line.level === "error" ? "text-err" : "text-text"
                  }`}
                >
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {result && mode === "run" && result.logs.length === 0 && !result.error && (
          <p className="text-[13px] leading-relaxed text-faint">
            Код выполнен без ошибок, но ничего не вывел. Добавьте <code>console.log(...)</code>,
            чтобы посмотреть промежуточные значения.
          </p>
        )}

        {showTests && (
          <div>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">
              Проверки
            </h3>
            <ul className="space-y-1.5">
              {result!.results.map((item, index) => (
                <TestRow key={index} result={item} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {showTests && (
        <div
          className={`flex h-10 shrink-0 items-center border-t border-border px-4 text-[13px] font-semibold ${
            allPassed ? "text-ok" : "text-muted"
          }`}
        >
          Пройдено {passed} из {total}
          {allPassed ? (
            <span className="ml-2 font-normal text-ok">— задача засчитана</span>
          ) : (
            <span className="ml-2 font-normal text-muted">— задача не засчитана</span>
          )}
        </div>
      )}
    </section>
  );
}
