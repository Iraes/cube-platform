"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BugReportButton } from "@/components/BugReportButton";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsolePanel } from "@/components/ConsolePanel";
import { DomPreview } from "@/components/DomPreview";
import { TaskDescription } from "@/components/TaskDescription";
import { runCode } from "@/lib/runner";
import type { CodeTask, ConsoleLine, RunMode, RunResult } from "@/lib/runner/types";
import type { BackLink, Step } from "@/lib/content/types";
import { postSubmission } from "@/lib/progressClient";
import type { DraftLoad, StorageLike } from "@/lib/drafts";
import {
  DRAFT_SAVE_DELAY_MS,
  draftKey,
  dropDraft,
  loadDraft,
  ownerStorage,
  saveDraft,
} from "@/lib/drafts";

/**
 * Черновик как внешнее хранилище для `useSyncExternalStore`.
 *
 * Сервер и первый клиентский рендер получают `null` (`getServerSnapshot`),
 * поэтому разметка совпадает и заготовка не мелькает. Само чтение идёт в
 * подписке — это эффект, а не рендер; сразу после подписки React сам сверяет
 * снимок через `getSnapshot` и перерисовывает компонент. `setState` в эффекте
 * при этом не нужен.
 */
type DraftStore = {
  subscribe: () => () => void;
  getSnapshot: () => DraftLoad | null;
  getServerSnapshot: () => null;
};

/** Подписки нет: ключ пишем только мы, чужие вкладки не синхронизируем */
const noop = () => {};
const serverDraft = (): null => null;

/**
 * Читаем ровно один раз на ключ: у `loadDraft` есть побочный эффект —
 * удаление битой записи, повторный вызов вернул бы уже `none`.
 */
function createDraftStore(draftOwner: string, key: string, starterCode: string): DraftStore {
  let loaded = false;
  let snapshot: DraftLoad | null = null;

  return {
    subscribe: () => {
      if (!loaded) {
        loaded = true;
        snapshot = loadDraft(ownerStorage(draftOwner), key, starterCode);
      }
      return noop;
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: serverDraft,
  };
}

/**
 * Всё, что нужно отложенной записи. `starterCode` лежит здесь, а не берётся
 * из пропсов: тогда запись не может сохранить код одной задачи с заготовкой
 * другой, если пропсы успели смениться.
 */
type DraftMeta = {
  storage: StorageLike | null;
  key: string;
  starterCode: string;
  timer: number | null;
  pending: string | null;
  lastSaved: string;
  broken: boolean;
};

let draftTimeFormat: Intl.DateTimeFormat | null = null;

/**
 * Время восстановления — клиентское: черновик записан на этом устройстве,
 * поэтому пояс берём у браузера. `PLATFORM_TIMEZONE` из `src/lib/datetime.ts`
 * в клиентский бандл не попадает, а `toLocaleString()` без пояса дал бы
 * разное время на разных машинах.
 */
function formatDraftTime(savedAt: number): string | null {
  try {
    const { timeZone } = new Intl.DateTimeFormat().resolvedOptions();
    if (!timeZone) return null;
    draftTimeFormat ??= new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    });
    return draftTimeFormat.format(new Date(savedAt));
  } catch {
    // пояс не разрешился или дата битая — покажем баннер без времени
    return null;
  }
}

/** «Восстановлен ваш черновик от 28 ноября в 00:12»; без пояса — без времени */
function restoreLabel(savedAt: number): string {
  const time = formatDraftTime(savedAt);
  return time ? `Восстановлен ваш черновик от ${time}` : "Восстановлен ваш черновик";
}

type Props = {
  task: CodeTask;
  solved: boolean;
  moduleSlug?: string;
  moduleTitle?: string;
  /** Куда возвращаться: по умолчанию модуль, из урока — в этот урок */
  backTo?: BackLink;
  nextStep?: Step;
  /** Демо-доступ: код запускается и проверяется, но результат не сохраняется */
  isDemo?: boolean;
  /**
   * Кто владеет черновиком — `user.id` для вошедшего или `guest` для демо и
   * неавторизованного: иначе черновики одного slug «наезжают» друг на друга.
   * Проп обязательный: значение по умолчанию молча отдало бы чужой черновик.
   */
  draftOwner: string;
};

export function TaskWorkspace({
  task,
  solved,
  moduleSlug,
  moduleTitle,
  backTo,
  nextStep,
  isDemo = false,
  draftOwner,
}: Props) {
  const router = useRouter();
  // Что ученик набрал в этой сессии; null — редактор ещё не трогали, и код
  // берётся из черновика или из заготовки.
  const [typedCode, setTypedCode] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [mode, setMode] = useState<RunMode | null>(null);
  const [running, setRunning] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  // Черновик не сохраняется: переполнение квоты или недоступное хранилище.
  const [storageBroken, setStorageBroken] = useState(false);
  // Баннер восстановления больше не нужен: «Сбросить» или код снова равен заготовке.
  const [restoreHidden, setRestoreHidden] = useState(false);

  // DOM-задачи: что сейчас крутится в превью и что оно успело вывести в консоль
  const [run, setRun] = useState<{ id: number; code: string } | null>(null);
  const [previewLogs, setPreviewLogs] = useState<ConsoleLine[]>([]);
  const isDom = task.kind === "dom";

  // Черновик в браузере. Ключ по владельцу: для вошедшего localStorage,
  // для демо и гостя — sessionStorage, чтобы черновики одного slug не
  // «наезжали» друг на друга (draftOwner).
  const storageKey = useMemo(() => draftKey(task.slug, draftOwner), [task.slug, draftOwner]);
  const draftStore = useMemo(
    () => createDraftStore(draftOwner, storageKey, task.starterCode),
    [draftOwner, storageKey, task.starterCode],
  );
  // null — снимка ещё нет (сервер и первый клиентский рендер)
  const draft = useSyncExternalStore(
    draftStore.subscribe,
    draftStore.getSnapshot,
    draftStore.getServerSnapshot,
  );
  const draftReady = draft !== null;
  const draftCode = draft !== null && draft.status === "restored" ? draft.code : task.starterCode;
  const code = typedCode ?? draftCode;

  // Актуальный код для обработчиков, которые создаются один раз.
  // Обновляется синхронно с вводом: между правкой и запуском может не быть
  // ни одного рендера (Ctrl+Enter сразу после набора кода).
  const codeRef = useRef(code);
  const runningRef = useRef(false);
  const draftMetaRef = useRef<DraftMeta | null>(null);

  // При отправке превью перезапускается вместе с фреймом проверок, и обе копии
  // кода пишут одно и то же. Пока проверка идёт, вывод превью не берём —
  // иначе ученик видит каждую строку дважды.
  const mutePreviewRef = useRef(false);

  // Одна запись на компонент: читает только draftMetaRef, поэтому не зависит
  // от пропсов и не может записать код одной задачи с заготовкой другой.
  const flush = useCallback(() => {
    const meta = draftMetaRef.current;
    if (!meta) return;

    if (meta.timer !== null) {
      window.clearTimeout(meta.timer);
      meta.timer = null;
    }

    const pending = meta.pending;
    if (pending === null) return;
    meta.pending = null;

    // Хранилище уже отказало — второй попытки не делаем
    if (meta.broken) return;

    const saved = saveDraft(meta.storage, meta.key, pending, meta.starterCode, Date.now());
    if (saved === "unavailable") {
      meta.broken = true;
      setStorageBroken(true);
      return;
    }

    meta.lastSaved = pending;
    // Код снова равен заготовке — черновика нет, баннер восстановления врёт
    if (saved === "cleared") setRestoreHidden(true);
  }, []);

  const handleCodeChange = useCallback((next: string) => {
    codeRef.current = next;
    setTypedCode(next);
  }, []);

  const execute = useCallback(
    async (nextMode: RunMode) => {
      if (runningRef.current) return;
      runningRef.current = true;
      mutePreviewRef.current = nextMode === "submit";
      setRunning(true);
      setMode(nextMode);
      setResult(null);
      setSaveFailed(false);
      setPreviewLogs([]);

      try {
        const submitted = codeRef.current;

        // Превью перезапускается вместе с кодом: ученик должен щупать то же,
        // что сейчас проверяется, а не результат прошлой попытки
        if (isDom) setRun({ id: Date.now(), code: submitted });

        const runResult = await runCode(submitted, task, { mode: nextMode });
        setResult(runResult);

        if (nextMode !== "submit") return;

        const passedAll =
          !runResult.error &&
          runResult.results.length > 0 &&
          runResult.results.every((item) => item.passed);

        // В демо проверки честные, но сохранять результат некуда — аккаунта нет
        if (isDemo) return;

        const saved = await postSubmission({
          taskSlug: task.slug,
          code: submitted,
          passed: passedAll,
        });

        if (!saved) {
          setSaveFailed(true);
          return;
        }

        // Отметка «решено» приходит с сервера — перечитываем страницу
        if (passedAll && !solved) router.refresh();
      } finally {
        runningRef.current = false;
        mutePreviewRef.current = false;
        setRunning(false);
      }
    },
    [task, solved, router, isDemo, isDom],
  );

  const handleReset = useCallback(() => {
    const meta = draftMetaRef.current;
    if (meta) {
      // Снимаем запланированную запись: иначе таймер вернёт удалённый черновик
      if (meta.timer !== null) {
        window.clearTimeout(meta.timer);
        meta.timer = null;
      }
      meta.pending = null;
      dropDraft(meta.storage, meta.key);
      // Код снова равен заготовке — новую запись планировать нечего
      meta.lastSaved = meta.starterCode;
    }

    codeRef.current = task.starterCode;
    setTypedCode(task.starterCode);
    setRestoreHidden(true);
    setStorageBroken(false);
    setResult(null);
    setMode(null);
    setRun(null);
    setPreviewLogs([]);
  }, [task.starterCode]);

  const handleSaveErrorDismiss = useCallback(() => {
    setStorageBroken(false);
  }, []);

  // Ключ и каркас задачи запоминаем вместе: пока черновика нет, meta пуста.
  // Очистка дописывает недобранное до смены задачи и при размонтировании —
  // дебаунс 700 мс иначе потерял бы последние символы.
  useEffect(() => {
    if (draft === null) return;

    draftMetaRef.current = {
      storage: ownerStorage(draftOwner),
      key: storageKey,
      starterCode: task.starterCode,
      timer: null,
      pending: null,
      lastSaved: draftCode,
      broken: false,
    };

    return () => {
      flush();
    };
  }, [draft, draftCode, draftOwner, storageKey, task.starterCode, flush]);

  // codeRef догоняет код, пришедший не из редактора: восстановление и «Сбросить»
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Отложенная запись после паузы в наборе. Зависимость [code] перезапускает
  // таймер на каждое изменение, таймер отменяется здесь же и в flush.
  useEffect(() => {
    const meta = draftMetaRef.current;
    if (!meta) return;
    if (code === meta.lastSaved) return;

    if (meta.timer !== null) {
      window.clearTimeout(meta.timer);
      meta.timer = null;
    }
    meta.pending = code;
    meta.timer = window.setTimeout(flush, DRAFT_SAVE_DELAY_MS);
  }, [code, flush]);

  // Уход со страницы до истечения дебаунса: F5, закрытие вкладки, сворачивание
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [flush]);

  const addPreviewLog = useCallback((line: ConsoleLine) => {
    if (mutePreviewRef.current) return;
    setPreviewLogs((prev) => (prev.length > 200 ? prev : [...prev, line]));
  }, []);

  // Вывод из превью подмешивается к результату запуска: для ученика это
  // одна консоль, независимо от того, какой фрейм написал строку
  const shownResult = useMemo<RunResult | null>(() => {
    if (previewLogs.length === 0) return result;
    if (!result) return { logs: previewLogs, results: [] };
    return { ...result, logs: [...result.logs, ...previewLogs] };
  }, [result, previewLogs]);

  // Ctrl+Enter — запустить, Ctrl+Shift+Enter — отправить на проверку
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
        solved={solved || justSolved}
        isDemo={isDemo}
        backTo={backTo}
        nextStep={nextStep}
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

          <BugReportButton contextKind="task" contextId={task.slug} contextTitle={task.title} />
        </div>

        {saveFailed && (
          <div className="shrink-0 border-b border-border bg-err-soft px-3 py-2 text-[12.5px] text-err">
            Результат проверен, но не сохранился на сервере — проверьте соединение
          </div>
        )}

        {justSolved && (
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-ok-soft px-3 py-2">
            <span className="text-[13px] font-semibold text-ok">
              {isDemo ? "Все проверки пройдены" : "Задача решена"}
            </span>
            {nextStep ? (
              <Link
                href={nextStep.href}
                className="h-7 rounded-md bg-ok px-3 text-[12.5px] font-semibold leading-7 text-accent-fg transition-opacity hover:opacity-90"
              >
                Дальше: {nextStep.title} →
              </Link>
            ) : (
              (backTo || isDemo || moduleSlug) && (
                <Link
                  href={backTo?.href ?? (isDemo ? "/demo" : `/modules/${moduleSlug}`)}
                  className="text-[12.5px] text-ok underline underline-offset-2"
                >
                  {backTo
                    ? `Вернуться к уроку «${backTo.label}»`
                    : isDemo
                      ? "Вернуться к демо"
                      : "Вернуться к модулю"}
                </Link>
              )
            )}
          </div>
        )}

        {/* flex-col: баннеры сверху, редактор занимает остаток высоты */}
        <div className="flex min-h-0 flex-1 flex-col">
          {draft !== null && draft.status === "restored" && !restoreHidden && (
            <div
              role="status"
              className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-accent-soft px-3 py-2"
            >
              <span className="flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-muted">
                <span>{restoreLabel(draft.savedAt)}</span>
                {draft.starterChanged && (
                  <span className="font-medium text-text">
                    Каркас задачи обновился — сверьтесь с описанием
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="h-6 shrink-0 rounded-md border border-border px-2.5 text-[12px] font-medium text-muted transition-colors hover:bg-hover hover:text-text"
              >
                Начать заново
              </button>
            </div>
          )}
          {storageBroken && (
            <div className="flex shrink-0 items-start gap-3 border-b border-border bg-warn/10 px-3 py-2">
              <span className="flex-1 text-[12.5px] text-warn">
                Черновик не сохраняется в этом браузере.
              </span>
              <button
                type="button"
                onClick={handleSaveErrorDismiss}
                className="shrink-0 text-[12px] text-warn underline underline-offset-2"
              >
                Скрыть
              </button>
            </div>
          )}
          {draftReady ? (
            <div className="min-h-0 flex-1">
              <CodeEditor value={code} onChange={handleCodeChange} onRun={() => void execute("run")} />
            </div>
          ) : (
            <div className="min-h-0 flex-1" aria-hidden="true" />
          )}
        </div>
      </section>

      <div className={isDom ? "h-[720px] lg:h-full" : "h-[430px] lg:h-full"}>
        {isDom ? (
          <div className="grid h-full min-h-0 grid-rows-2 gap-px bg-border">
            <DomPreview task={task} run={run} onConsole={addPreviewLog} />
            <ConsolePanel result={shownResult} running={running} mode={mode} isDemo={isDemo} />
          </div>
        ) : (
          <ConsolePanel result={shownResult} running={running} mode={mode} isDemo={isDemo} />
        )}
      </div>
    </main>
  );
}
