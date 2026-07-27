import type {
  ConsoleLine,
  RunOptions,
  RunResult,
  Runner,
  RuntimeError,
  Task,
  TestResult,
} from './types';
import { LINE_OFFSET, buildWorkerSource, userCodeLineRange } from './workerHarness';

/** Через сколько глушим воркер: страхует от бесконечных циклов */
const TIMEOUT_MS = 4000;

type WorkerMessage =
  | { type: 'log'; line: ConsoleLine }
  | { type: 'done'; results: TestResult[]; error?: { message: string; stack?: string } };

type CodeLocation = { line?: number; column?: number };

/**
 * Достаёт позицию в коде пользователя из стека ошибки.
 *
 * Кадры стека воркера выглядят как `at solution (blob:http://host/uuid:7:11)`.
 * Берём первый кадр, попадающий в диапазон строк кода пользователя: кадры
 * харнесса лежат ниже по файлу и отсекаются сами.
 */
function locationFromStack(
  stack: string | undefined,
  range: { first: number; last: number },
): CodeLocation {
  if (!stack) return {};

  for (const frame of stack.split('\n')) {
    const match = /blob:[^\s)]+?:(\d+):(\d+)/.exec(frame);
    if (!match) continue;

    const line = Number(match[1]);
    const column = Number(match[2]);
    if (line >= range.first && line <= range.last) {
      return { line: line - LINE_OFFSET, column };
    }
  }

  return {};
}

function unsupported(task: Task): RunResult {
  return {
    logs: [],
    results: [],
    error: {
      message: `Задачи типа «${task.kind}» пока не исполняются в браузерном JS-раннере`,
    },
  };
}

export const browserJsRunner: Runner = {
  run(code: string, task: Task, options?: RunOptions): Promise<RunResult> {
    if (task.kind !== 'algorithm') {
      return Promise.resolve(unsupported(task));
    }

    const mode = options?.mode ?? 'submit';

    return new Promise<RunResult>((resolve) => {
      const source = buildWorkerSource(code);
      const range = userCodeLineRange(code);
      const blobUrl = URL.createObjectURL(
        new Blob([source], { type: 'application/javascript' }),
      );

      const worker = new Worker(blobUrl);
      const logs: ConsoleLine[] = [];
      let settled = false;

      const finish = (results: TestResult[], error?: RuntimeError) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(blobUrl);
        resolve({ logs, results, error });
      };

      const timer = setTimeout(() => {
        finish([], {
          message:
            `Превышено время выполнения (${TIMEOUT_MS / 1000} с). ` +
            'Скорее всего, в коде бесконечный цикл или рекурсия без выхода.',
        });
      }, TIMEOUT_MS);

      worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const message = event.data;

        if (message.type === 'log') {
          logs.push(message.line);
          return;
        }

        if (message.type === 'done') {
          const error = message.error
            ? {
                message: message.error.message,
                stack: message.error.stack,
                ...locationFromStack(message.error.stack, range),
              }
            : undefined;
          finish(message.results ?? [], error);
        }
      };

      // Синтаксическая ошибка в коде пользователя ломает загрузку скрипта воркера
      worker.onerror = (event: ErrorEvent) => {
        event.preventDefault();
        const rawLine = event.lineno;
        const inUserCode =
          typeof rawLine === 'number' && rawLine >= range.first && rawLine <= range.last;

        finish([], {
          message: event.message || 'Не удалось выполнить код',
          line: inUserCode ? rawLine - LINE_OFFSET : undefined,
          column: inUserCode ? event.colno : undefined,
        });
      };

      worker.postMessage({ mode, tests: mode === 'submit' ? task.tests : [] });
    });
  },
};
