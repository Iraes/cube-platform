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
  "console.log=function(){__cubePush('log',arguments)};console.info=console.log;console.warn=console.log;console.debug=console.log;console.error=function(){__cubePush('error',arguments)};";

const HARNESS = `
function __cubePush(level, args) {
  var n = (globalThis.__cubeLogCount || 0) + 1;
  globalThis.__cubeLogCount = n;
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
  for (var i = 0; i < args.length; i++) parts.push(__cubeFormat(args[i]));
  self.postMessage({ type: 'log', line: { level: level, text: parts.join(' ') } });
}

function __cubeFormat(value, seen) {
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
    for (var i = 0; i < value.length; i++) items.push(__cubeFormat(value[i], nested));
    return '[' + items.join(', ') + ']';
  }
  if (value instanceof Map) {
    var pairs = [];
    value.forEach(function (v, k) {
      pairs.push(__cubeFormat(k, nested) + ' => ' + __cubeFormat(v, nested));
    });
    return 'Map(' + pairs.join(', ') + ')';
  }
  if (value instanceof Set) {
    var vals = [];
    value.forEach(function (v) { vals.push(__cubeFormat(v, nested)); });
    return 'Set(' + vals.join(', ') + ')';
  }
  var keys = Object.keys(value);
  var props = [];
  for (var j = 0; j < keys.length; j++) {
    props.push(keys[j] + ': ' + __cubeFormat(value[keys[j]], nested));
  }
  return '{ ' + props.join(', ') + ' }';
}

function __cubeDeepEqual(a, b) {
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
      if (!__cubeDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    var mapKeys = Array.from(a.keys());
    for (var m = 0; m < mapKeys.length; m++) {
      if (!b.has(mapKeys[m])) return false;
      if (!__cubeDeepEqual(a.get(mapKeys[m]), b.get(mapKeys[m]))) return false;
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
    if (!__cubeDeepEqual(a[ka[k]], b[ka[k]])) return false;
  }
  return true;
}

/** Значение может быть непередаваемым через postMessage (функция, DOM-узел) */
function __cubeCloneable(value) {
  try {
    structuredClone(value);
    return value;
  } catch (e) {
    return '[значение не сериализуется: ' + __cubeFormat(value) + ']';
  }
}

function __cubeErrorText(e) {
  if (e instanceof Error) return e.name + ': ' + e.message;
  if (e && e.message) return String(e.message);
  return 'Выброшено значение: ' + __cubeFormat(e);
}

/**
 * Достаёт функцию ученика по имени.
 *
 * Именно прямой eval, а не globalThis[name]: объявления через let и const
 * на верхнем уровне скрипта в globalThis не попадают, а прямой eval видит
 * лексическое окружение — то есть и function-объявления, и const.
 */
function __cubeResolve(name) {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) return undefined;
  try {
    return eval(name);
  } catch (e) {
    return undefined;
  }
}

/** Проверка «вызов должен выбросить ошибку такого типа» */
function __cubeCheckThrown(testCase, thrown, didThrow) {
  var expected = testCase.throws;

  if (!didThrow) {
    return {
      passed: false,
      error:
        'Ошибки не было: вызов вернул значение вместо того, чтобы породить ' + expected + '.'
    };
  }

  var ctor = typeof globalThis[expected] === 'function' ? globalThis[expected] : null;
  var matches = ctor ? thrown instanceof ctor : false;

  // Запасной путь: ошибка из другого realm не пройдёт instanceof
  if (!matches && thrown && thrown.name === expected) matches = true;

  if (!matches) {
    return {
      passed: false,
      error: 'Ожидалась ошибка ' + expected + ', а получилась ' + __cubeErrorText(thrown)
    };
  }

  if (testCase.messageIncludes) {
    var text = thrown && thrown.message ? String(thrown.message) : '';
    if (text.indexOf(testCase.messageIncludes) === -1) {
      return {
        passed: false,
        error:
          'Тип ошибки верный, но в тексте нет «' + testCase.messageIncludes + '»: ' + text
      };
    }
  }

  return { passed: true, error: undefined };
}

async function __cubeRunTests(tests) {
  var results = [];
  var firstError = null;

  for (var i = 0; i < tests.length; i++) {
    var testCase = tests[i];
    var input = Array.isArray(testCase.input) ? testCase.input : [];
    var fnName = testCase.fn || 'solution';
    var fn = __cubeResolve(fnName);

    if (typeof fn !== 'function') {
      results.push({
        name: testCase.name,
        passed: false,
        error:
          typeof fn === 'undefined'
            ? 'В коде не найдена функция ' + fnName
            : fnName + ' объявлена, но это не функция, а ' + typeof fn
      });
      continue;
    }

    var thrown = null;
    var didThrow = false;
    var actual;

    try {
      // Функция вызывается ровно один раз, результат переиспользуется
      actual = fn.apply(null, input);
      if (actual && typeof actual.then === 'function') actual = await actual;
    } catch (e) {
      thrown = e;
      didThrow = true;
    }

    // Задачи «породи ошибку»: проверяем тип выброшенного, а не результат
    if (testCase.throws) {
      var verdict = __cubeCheckThrown(testCase, thrown, didThrow);
      results.push({
        name: testCase.name,
        passed: verdict.passed,
        error: verdict.error
      });
      continue;
    }

    if (didThrow) {
      // Падение одного теста не останавливает остальные
      if (!firstError) {
        firstError = {
          message: __cubeErrorText(thrown),
          stack: thrown && thrown.stack ? String(thrown.stack) : undefined
        };
      }
      results.push({
        name: testCase.name,
        passed: false,
        expected: __cubeCloneable(testCase.expected),
        error: __cubeErrorText(thrown)
      });
      continue;
    }

    results.push({
      name: testCase.name,
      passed: __cubeDeepEqual(actual, testCase.expected),
      expected: __cubeCloneable(testCase.expected),
      actual: __cubeCloneable(actual)
    });
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

  // Задача может требовать несколько функций со своими именами — тогда
  // отсутствие solution не ошибка, и о пропавшей функции скажет её тест.
  var needsSolution = tests.some(function (testCase) {
    return !testCase.fn;
  });

  if (needsSolution && typeof solution === 'undefined') {
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

  if (needsSolution && typeof solution !== 'function') {
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
    var outcome = await __cubeRunTests(tests);
    self.postMessage({ type: 'done', results: outcome.results, error: outcome.error });
  } catch (e) {
    self.postMessage({
      type: 'done',
      results: [],
      error: { message: __cubeErrorText(e), stack: e && e.stack ? String(e.stack) : undefined }
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
