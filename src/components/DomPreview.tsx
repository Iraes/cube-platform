"use client";

import { useEffect, useMemo, useRef } from "react";
import { buildSandboxDoc, type SandboxMessage } from "@/lib/runner/domSandbox";
import type { ConsoleLine, DomTask } from "@/lib/runner/types";

type Props = {
  task: DomTask;
  /** Активный запуск: null — код ещё не запускали, показываем чистую разметку */
  run: { id: number; code: string } | null;
  /** Вывод из превью: ученик кликает по фрагменту, console.log должен быть виден */
  onConsole: (line: ConsoleLine) => void;
};

/**
 * Живой фрагмент страницы, к которому подключается код ученика.
 *
 * Это именно превью «для рук»: по нему кликают, в него печатают. Проверки
 * идут в отдельном скрытом фрейме (см. `iframeDomRunner`), иначе они дёргали бы
 * интерфейс прямо во время работы.
 */
export function DomPreview({ task, run, onConsole }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Колбэк в ref: подписка не должна пересоздаваться на каждый рендер
  const onConsoleRef = useRef(onConsole);
  onConsoleRef.current = onConsole;

  const doc = useMemo(
    () => buildSandboxDoc({ task, code: run?.code ?? null, runId: run?.id ?? 0, frame: "preview" }),
    [task, run],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as SandboxMessage | undefined;
      if (!data || data.source !== "cube" || data.frame !== "preview") return;
      if (event.source !== frameRef.current?.contentWindow) return;

      if (data.type === "console") {
        onConsoleRef.current({ level: data.level, text: data.text });
      } else if (data.type === "error") {
        onConsoleRef.current({ level: "error", text: data.message });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <section className="flex min-h-0 flex-col bg-surface">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Фрагмент страницы
        </h2>
        <span className="truncate text-[12px] text-faint">
          {run ? "код подключён — можно кликать" : "запустите код, чтобы подключить его"}
        </span>
      </div>

      <iframe
        // key по runId: перезапуск должен начинаться с чистой разметки
        key={run?.id ?? "empty"}
        ref={frameRef}
        title="Фрагмент страницы"
        sandbox="allow-scripts"
        srcDoc={doc}
        className="min-h-0 w-full flex-1 border-0 bg-white"
      />
    </section>
  );
}
