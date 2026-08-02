import type { DomTask } from './types';

/**
 * Сборка страницы-песочницы для DOM-задач.
 *
 * Фреймов два, и оба собираются здесь:
 *
 *   'preview' — видимое превью: разметка задачи + код ученика, без проверок.
 *               С ним можно кликать руками, не портя результат проверки.
 *   'checks'  — скрытый фрейм: то же самое плюс проверки, шлёт вердикт наверх.
 *
 * Порядок скриптов важен так же, как в воркере: сначала пролог (подмена
 * console и хелперы), потом код ученика как есть, потом проверки. Код ученика
 * не оборачивается ни во что, поэтому номера строк в ошибках совпадают
 * с редактором — с точностью до заголовка страницы, см. `DOM_LINE_OFFSET`.
 */

/** Сколько строк песочницы идёт до кода ученика — для разбора стека */
export const DOM_LINE_OFFSET = 0;

/** Сколько ждём вердикта от скрытого фрейма, прежде чем считать это зависанием */
export const DOM_TIMEOUT_MS = 5000;

export type SandboxFrame = 'preview' | 'checks';

/** Что прилетает из песочницы наверх */
export type SandboxMessage =
  | { source: 'cube'; frame: SandboxFrame; runId: number; type: 'console'; level: 'log' | 'error'; text: string }
  | { source: 'cube'; frame: SandboxFrame; runId: number; type: 'error'; message: string }
  | {
      source: 'cube';
      frame: SandboxFrame;
      runId: number;
      type: 'done';
      results: { name: string; passed: boolean; error?: string }[];
      error?: string;
    };

/** Безопасная вставка произвольного кода внутрь <script> */
function embed(code: string): string {
  return JSON.stringify(code).replace(/</g, '\\u003c');
}

const FORMAT_FN = `function (v) {
  if (typeof v === 'string') return v;
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'function') return '[функция ' + (v.name || 'без имени') + ']';
  if (v instanceof Error) return v.name + ': ' + v.message;
  if (typeof Element !== 'undefined' && v instanceof Element) {
    return '<' + v.tagName.toLowerCase() + (v.id ? '#' + v.id : '') + '>';
  }
  try {
    var s = JSON.stringify(v);
    return s === undefined ? String(v) : s;
  } catch (e) {
    return String(v);
  }
}`;

/**
 * Текст ошибки для ученика. У проверок и у `new Error(...)` имя всегда «Error»,
 * и приписка «Error:» перед понятной фразой только мешает — оставляем имя
 * лишь у настоящих типов вроде TypeError и ReferenceError.
 */
const ERROR_FN = `function (e) {
  if (e && e.message) {
    var name = e.name && e.name !== 'Error' ? e.name + ': ' : '';
    return name + String(e.message);
  }
  return 'Выброшено значение: ' + String(e);
}`;

/**
 * Пролог: связь с платформой, перехват консоли и ошибок, хелперы для проверок.
 * Хелперы висят на window, чтобы быть видимыми и коду ученика (для отладки),
 * и коду проверок.
 */
function prelude(frame: SandboxFrame, runId: number): string {
  return `
(function () {
  var fmt = ${FORMAT_FN};
  var errText = ${ERROR_FN};

  window.__cubePost = function (message) {
    message.source = 'cube';
    message.frame = ${JSON.stringify(frame)};
    message.runId = ${runId};
    parent.postMessage(message, '*');
  };

  window.__cubeError = null;

  ['log', 'info', 'warn', 'debug', 'error'].forEach(function (level) {
    console[level] = function () {
      var parts = [];
      for (var i = 0; i < arguments.length; i++) parts.push(fmt(arguments[i]));
      window.__cubePost({
        type: 'console',
        level: level === 'error' ? 'error' : 'log',
        text: parts.join(' ')
      });
    };
  });

  window.onerror = function (message) {
    window.__cubeError = String(message);
    window.__cubePost({ type: 'error', message: String(message) });
    return true;
  };

  window.addEventListener('unhandledrejection', function (event) {
    var text = 'Необработанная ошибка в промисе: ' + errText(event.reason);
    window.__cubeError = text;
    window.__cubePost({ type: 'error', message: text });
  });

  // --- Хелперы, доступные в проверках ---
  window.find = function (selector) {
    var el = document.querySelector(selector);
    if (!el) throw new Error('на странице нет элемента ' + selector);
    return el;
  };
  window.findAll = function (selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };
  window.click = function (target) {
    var el = typeof target === 'string' ? window.find(target) : target;
    el.click();
  };
  window.typeInto = function (target, text) {
    var el = typeof target === 'string' ? window.find(target) : target;
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  window.sleep = function (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  };
  window.assert = function (condition, message) {
    if (!condition) throw new Error(message || 'условие не выполнено');
  };
  window.assertEqual = function (actual, expected, message) {
    var a = JSON.stringify(actual);
    var b = JSON.stringify(expected);
    if (a !== b) {
      throw new Error((message ? message + ': ' : '') + 'ожидалось ' + b + ', получено ' + a);
    }
  };
})();
`;
}

/** Скрипт, который гоняет проверки и отправляет вердикт наверх */
function checksScript(task: DomTask): string {
  const checks = task.checks.map((check) => ({ name: check.name, body: check.body }));

  return `
(function () {
  var errText = ${ERROR_FN};
  var checks = ${embed(JSON.stringify(checks))};

  function start() {
    // Даём коду ученика повесить обработчики до первой проверки
    setTimeout(async function () {
      var results = [];
      var fatal = window.__cubeError;

      if (!fatal) {
        var list = JSON.parse(checks);
        for (var i = 0; i < list.length; i++) {
          try {
            var run = new Function('return (async function () {' + list[i].body + '})()');
            await run();
            results.push({ name: list[i].name, passed: true });
          } catch (e) {
            results.push({ name: list[i].name, passed: false, error: errText(e) });
          }
        }
      }

      window.__cubePost({ type: 'done', results: results, error: fatal || undefined });
    }, 30);
  }

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
`;
}

export type SandboxOptions = {
  task: DomTask;
  /** null — только разметка, без кода ученика: превью до первого запуска */
  code: string | null;
  runId: number;
  frame: SandboxFrame;
};

export function buildSandboxDoc({ task, code, runId, frame }: SandboxOptions): string {
  const userScript =
    code === null
      ? ''
      : `<script>
(function () {
  var errText = ${ERROR_FN};
  try {
    (0, eval)(${embed(code)});
  } catch (e) {
    window.__cubeError = errText(e);
    window.__cubePost({ type: 'error', message: errText(e) });
  }
})();
<\/script>`;

  const checks = frame === 'checks' && code !== null ? `<script>${checksScript(task)}<\/script>` : '';

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 20px;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: #f6f6f4;
    color: #2b2f33;
  }
${task.css ?? ''}
</style>
</head>
<body>
${task.html}
<script>${prelude(frame, runId)}<\/script>
${userScript}
${checks}
</body>
</html>`;
}
