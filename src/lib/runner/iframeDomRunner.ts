import { DOM_TIMEOUT_MS, buildSandboxDoc, type SandboxMessage } from './domSandbox';
import type { ConsoleLine, RunOptions, RunResult, Runner, Task, TestResult } from './types';

/**
 * Исполнитель DOM-задач.
 *
 * Проверки идут в скрытом iframe-двойнике, а не в том, который видит ученик:
 * проверки кликают по кнопкам и печатают в поля, и делать это в видимом превью
 * значило бы дёргать интерфейс под руками. Видимое превью рисует `DomPreview`.
 *
 * Изоляция — на `sandbox="allow-scripts"` без `allow-same-origin`: код ученика
 * оказывается в уникальном origin, откуда не достать ни куки платформы,
 * ни её DOM. Общение только через postMessage.
 */

let nextRunId = 1;

function collect(task: Task, code: string, mode: RunOptions['mode']): Promise<RunResult> {
  const runId = nextRunId++;
  const domTask = task as Extract<Task, { kind: 'dom' }>;

  return new Promise<RunResult>((resolve) => {
    const logs: ConsoleLine[] = [];
    let error: RunResult['error'];
    let settled = false;

    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:900px;height:700px;border:0;';

    const finish = (results: TestResult[]) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      frame.remove();
      resolve({ logs, results, error });
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data as SandboxMessage | undefined;
      if (!data || data.source !== 'cube' || data.runId !== runId) return;
      if (event.source !== frame.contentWindow) return;

      if (data.type === 'console') {
        logs.push({ level: data.level, text: data.text });
        return;
      }

      if (data.type === 'error') {
        // Первая ошибка важнее: дальше обычно сыпется следствие
        if (!error) error = { message: data.message };
        return;
      }

      if (data.type === 'done') {
        if (data.error && !error) error = { message: data.error };
        finish(data.results);
      }
    };

    const timer = window.setTimeout(() => {
      if (!error) {
        error = {
          message:
            'Проверка не завершилась за 5 секунд. Обычно так бывает из-за бесконечного цикла ' +
            'или обработчика, который сам себя вызывает.',
        };
      }
      finish([]);
    }, DOM_TIMEOUT_MS);

    window.addEventListener('message', onMessage);

    // В режиме «Запустить» проверки не нужны: ученику важен вывод и превью
    frame.srcdoc = buildSandboxDoc({
      task: domTask,
      code,
      runId,
      frame: mode === 'submit' ? 'checks' : 'preview',
    });

    document.body.appendChild(frame);

    // Без проверок ждать нечего: даём коду отработать и отдаём вывод
    if (mode !== 'submit') {
      window.setTimeout(() => finish([]), 120);
    }
  });
}

export const iframeDomRunner: Runner = {
  run(code, task, options) {
    if (task.kind !== 'dom') {
      return Promise.resolve({
        logs: [],
        results: [],
        error: { message: 'Эта задача не про DOM — исполнитель выбран неверно' },
      });
    }

    return collect(task, code, options?.mode ?? 'submit');
  },
};
