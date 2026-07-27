/**
 * Исходник Web Worker для JS-задач.
 *
 * Порядок сборки скрипта важен:
 *
 *   строка 1        — пролог: подмена console.*
 *   строки 2..N+1   — код пользователя (как есть, без обёрток)
 *   дальше          — харнесс: сравнение, прогон тестов, отправка результата
 *
 * Код пользователя вставляется целиком, а не оборачивается в `new Function`:
 * так номера строк в `error.stack` соответствуют номерам строк в редакторе
 * с точностью до фиксированного смещения `LINE_OFFSET`.
 *
 * Пролог обязан занимать ровно одну строку — иначе смещение поедет.
 * Функции харнесса объявлены через `function`, поэтому поднимаются
 * в начало скрипта и доступны прологу во время выполнения кода пользователя.
 */

/** Насколько номера строк в скрипте воркера смещены относительно редактора */
export const LINE_OFFSET = 1;

/** Максимум строк вывода, чтобы бесконечный цикл с console.log не завалил UI */
export const MAX_LOG_LINES = 500;

const PRELUDE =
  "console.log=function(){__fabelPush('log',arguments)};console.info=console.log;console.warn=console.log;console.debug=console.log;console.error=function(){__fabelPush('error',arguments)};";

const HARNESS = `
function __fabelPush(level, args) {
  var n = (globalThis.__fabelLogCount || 0) + 1;
  globalThis.__fabelLogCount = n;
  if (n > ${MAX_LOG_LINES}) {
    if (n === ${MAX_LOG_LINES + 1}) {
      self.postMessage({
        type: 'log',
        line: { level: 'error', text: 'Вывод обрезан: больше ${MAX_LOG_LINES} строк в консоли' }
      });
    }
    return;
  }
  var parts = [];
  for (var i = 0; i < args.length; i++) parts.push(__fabelFormat(args[i]));
  self.postMessage({ type: 'log', line: { level: level, text: parts.join(' ') } });
}

function __fabelFormat(value, seen) {
  seen = seen || [];
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  var t = typeof value;
  if (t === 'string') return seen.length === 0 ? value : JSON.stringify(value);
  if (t === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (t === 'boolean') return String(value);
  if (t === 'bigint') return String(value) + 'n';
  if (t === 'symbol') return String(value);
  if (t === 'function') return '[function ' + (value.name || 'anonymous') + ']';
  if (value instanceof Error) return value.name + ': ' + value.message;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return String(value);
  if (seen.indexOf(value) !== -1) return '[циклическая ссылка]';
  var nested = seen.concat([value]);
  if (Array.isArray(value)) {
    var items = [];
    for (var i = 0; i < value.length; i++) items.push(__fabelFormat(value[i], nested));
    return '[' + items.join(', ') + ']';
  }
  if (value instanceof Map) {
    var pairs = [];
    value.forEach(function (v, k) {
      pairs.push(__fabelFormat(k, nested) + ' => ' + __fabelFormat(v, nested));
    });
    return 'Map(' + pairs.join(', ') + ')';
  }
  if (value instanceof Set) {
    var vals = [];
    value.forEach(function (v) { vals.push(__fabelFormat(v, nested)); });
    return 'Set(' + vals.join(', ') + ')';
  }
  var keys = Object.keys(value);
  var props = [];
  for (var j = 0; j < keys.length; j++) {
    props.push(keys[j] + ': ' + __fabelFormat(value[keys[j]], nested));
  }
  return '{ ' + props.join(', ') + ' }';
}

function __fabelDeepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isNaN(a) && Number.isNaN(b);
  }
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return String(a) === String(b);
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!__fabelDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    var mapKeys = Array.from(a.keys());
    for (var m = 0; m < mapKeys.length; m++) {
      if (!b.has(mapKeys[m])) return false;
      if (!__fabelDeepEqual(a.get(mapKeys[m]), b.get(mapKeys[m]))) return false;
    }
    return true;
  }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    var setVals = Array.from(a.values());
    for (var s = 0; s < setVals.length; s++) {
      if (!b.has(setVals[s])) return false;
    }
    return true;
  }
  var ka = Object.keys(a);
  var kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (var k = 0; k < ka.length; k++) {
    if (!Object.prototype.hasOwnProperty.call(b, ka[k])) return false;
    if (!__fabelDeepEqual(a[ka[k]], b[ka[k]])) return false;
  }
  return true;
}

/** Значение может быть непередаваемым через postMessage (функция, DOM-узел) */
function __fabelCloneable(value) {
  try {
    structuredClone(value);
    return value;
  } catch (e) {
    return '[значение не сериализуется: ' + __fabelFormat(value) + ']';
  }
}

function __fabelErrorText(e) {
  if (e instanceof Error) return e.name + ': ' + e.message;
  if (e && e.message) return String(e.message);
  return 'Выброшено значение: ' + __fabelFormat(e);
}

async function __fabelRunTests(tests) {
  var results = [];
  var firstError = null;

  for (var i = 0; i < tests.length; i++) {
    var testCase = tests[i];
    var input = Array.isArray(testCase.input) ? testCase.input : [];
    try {
      // solution вызывается ровно один раз, результат переиспользуется
      var actual = solution.apply(null, input);
      if (actual && typeof actual.then === 'function') actual = await actual;
      results.push({
        name: testCase.name,
        passed: __fabelDeepEqual(actual, testCase.expected),
        expected: __fabelCloneable(testCase.expected),
        actual: __fabelCloneable(actual)
      });
    } catch (e) {
      // Падение одного теста не останавливает остальные
      if (!firstError) {
        firstError = {
          message: __fabelErrorText(e),
          stack: e && e.stack ? String(e.stack) : undefined
        };
      }
      results.push({
        name: testCase.name,
        passed: false,
        expected: __fabelCloneable(testCase.expected),
        error: __fabelErrorText(e)
      });
    }
  }

  return { results: results, error: firstError };
}

self.onmessage = async function (event) {
  var tests = (event.data && event.data.tests) || [];
  var mode = (event.data && event.data.mode) || 'submit';

  // Режим «Запустить»: код уже выполнился при загрузке скрипта,
  // вывод ушёл в консоль по мере появления. Проверки не трогаем.
  if (mode === 'run') {
    self.postMessage({ type: 'done', results: [] });
    return;
  }

  if (typeof solution === 'undefined') {
    self.postMessage({
      type: 'done',
      results: [],
      error: {
        message:
          'В коде не найдена функция solution. Объявите её, например: function solution(a, b) { ... }'
      }
    });
    return;
  }

  if (typeof solution !== 'function') {
    self.postMessage({
      type: 'done',
      results: [],
      error: {
        message:
          'solution объявлена, но это не функция, а ' + typeof solution +
          '. Задача ожидает функцию: function solution(...) { ... }'
      }
    });
    return;
  }

  try {
    var outcome = await __fabelRunTests(tests);
    self.postMessage({ type: 'done', results: outcome.results, error: outcome.error });
  } catch (e) {
    self.postMessage({
      type: 'done',
      results: [],
      error: { message: __fabelErrorText(e), stack: e && e.stack ? String(e.stack) : undefined }
    });
  }
};
`;

/**
 * Собирает исходник воркера. Код пользователя начинается со строки
 * `LINE_OFFSET + 1` — это используется при разборе стека ошибок.
 */
export function buildWorkerSource(userCode: string): string {
  return `${PRELUDE}\n${userCode}\n${HARNESS}`;
}

/** Сколько строк занимает код пользователя внутри скрипта воркера */
export function userCodeLineRange(userCode: string): { first: number; last: number } {
  const lines = userCode.split('\n').length;
  return { first: LINE_OFFSET + 1, last: LINE_OFFSET + lines };
}
