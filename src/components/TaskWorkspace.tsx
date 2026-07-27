"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsolePanel } from "@/components/ConsolePanel";
import { TaskDescription } from "@/components/TaskDescription";
import { runCode } from "@/lib/runner";
import type { RunMode, RunResult, Task } from "@/lib/runner/types";
import type { Step } from "@/lib/content/types";
import { getSolvedTasks, markTaskSolved, subscribeToProgress } from "@/lib/progress";

type Props = {
  task: Task;
  moduleSlug?: string;
  moduleTitle?: string;
  nextStep?: Step;
};

export function TaskWorkspace({ task, moduleSlug, moduleTitle, nextStep }: Props) {
  const [code, setCode] = useState(task.starterCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [mode, setMode] = useState<RunMode | null>(null);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);

  // Актуальный код для обработчиков, которые создаются один раз.
  // Обновляется синхронно с вводом: между правкой и запуском может не быть
  // ни одного рендера (Ctrl+Enter сразу после набора кода).
  const codeRef = useRef(code);
  const runningRef = useRef(false);

  useEffect(() => {
    const sync = () => setSolved(getSolvedTasks().has(task.slug));
    sync();
    return subscribeToProgress(sync);
  }, [task.slug]);

  const handleCodeChange = useCallback((next: string) => {
    codeRef.current = next;
    setCode(next);
  }, []);

  const execute = useCallback(
    async (nextMode: RunMode) => {
      if (runningRef.current) return;
      runningRef.current = true;
      setRunning(true);
      setMode(nextMode);
      setResult(null);

      try {
        const runResult = await runCode(codeRef.current, task, { mode: nextMode });
        setResult(runResult);

        const passedAll =
          nextMode === "submit" &&
          !runResult.error &&
          runResult.results.length > 0 &&
          runResult.results.every((item) => item.passed);

        if (passedAll) markTaskSolved(task.slug);
      } finally {
        runningRef.current = false;
        setRunning(false);
      }
    },
    [task],
  );

  const handleReset = useCallback(() => {
    codeRef.current = task.starterCode;
    setCode(task.starterCode);
    setResult(null);
    setMode(null);
  }, [task]);

  // Ctrl+Enter работает и когда фокус вне редактора
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void execute(event.shiftKey ? "submit" : "run");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [execute]);

  const justSolved =
    mode === "submit" &&
    !running &&
    result !== null &&
    !result.error &&
    result.results.length > 0 &&
    result.results.every((item) => item.passed);

  return (
    <main className="grid grid-cols-1 gap-px bg-border lg:h-[calc(100vh-3.5rem)] lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)_minmax(340px,430px)]">
      <TaskDescription
        task={task}
        moduleSlug={moduleSlug}
        moduleTitle={moduleTitle}
        solved={solved}
      />

      <section className="flex h-[460px] min-h-0 flex-col bg-surface lg:h-full">
        <div className="flex h-11 shrink-0 flex-wrap items-center gap-2 border-b border-border px-3">
          <button
            type="button"
            onClick={() => void execute("run")}
            disabled={running}
            className="h-7 rounded-md border border-border-strong px-3.5 text-[13px] font-medium text-text transition-colors hover:bg-hover disabled:opacity-60"
            title="Выполнить код и посмотреть вывод, без проверок"
          >
            {running && mode === "run" ? "Выполняется…" : "▶ Запустить"}
          </button>

          <button
            type="button"
            onClick={() => void execute("submit")}
            disabled={running}
            className="h-7 rounded-md bg-accent px-3.5 text-[13px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
            title="Прогнать проверки и засчитать задачу"
          >
            {running && mode === "submit" ? "Проверяем…" : "Отправить на проверку"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="h-7 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text"
          >
            Сбросить
          </button>

          <span className="ml-auto font-mono text-[11px] text-faint">
            Ctrl+Enter · Ctrl+Shift+Enter
          </span>
        </div>

        {justSolved && (
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-ok-soft px-3 py-2">
            <span className="text-[13px] font-semibold text-ok">Задача решена</span>
            {nextStep ? (
              <Link
                href={nextStep.href}
                className="h-7 rounded-md bg-ok px-3 text-[12.5px] font-semibold leading-7 text-accent-fg transition-opacity hover:opacity-90"
              >
                Дальше: {nextStep.title} →
              </Link>
            ) : (
              moduleSlug && (
                <Link
                  href={`/modules/${moduleSlug}`}
                  className="text-[12.5px] text-ok underline underline-offset-2"
                >
                  Вернуться к модулю
                </Link>
              )
            )}
          </div>
        )}

        <div className="min-h-0 flex-1">
          <CodeEditor value={code} onChange={handleCodeChange} onRun={() => void execute("run")} />
        </div>
      </section>

      <div className="h-[430px] lg:h-full">
        <ConsolePanel result={result} running={running} mode={mode} />
      </div>
    </main>
  );
}
