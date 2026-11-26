/**
 * Проверка самого харнесса сравнения результатов.
 *
 * Задача доезжает до браузера через React Flight, а он не восстанавливает
 * свойства объектов со значением `undefined` (в массивах такие элементы
 * сохраняются). Поэтому проверки вида `expected: { missing: undefined }`
 * приходили в воркер уже без ключа, и верные решения падали.
 *
 * Здесь мы намеренно повторяем это поведение: выкидываем из expected все
 * свойства с undefined и убеждаемся, что эталонное решение по-прежнему
 * проходит все проверки. Второй прогон — контрольный: заведомо пустое
 * решение не должно проходить ни одной проверки, иначе сами проверки
 * ничего не стоят.
 */
import vm from 'node:vm';
import { buildWorkerSource } from '@/lib/runner/workerHarness';
import type { AlgorithmTask } from '@/lib/runner/types';
import { optionalChainingPath } from '@/lib/tasks/advanced-functions/recursion-practice/optional-chaining-path';
import { promisesInSeries } from '@/lib/tasks/async-code/async-await/promises-in-series';
import { objectCreatePolyfill } from '@/lib/tasks/prototypes-and-classes/object-create/object-create-polyfill';

const out = (line: string) => process.stdout.write(line + '\n');

/** Как Flight: свойства объектов с undefined пропадают, массив не трогаем */
function dropUndefinedKeys<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => dropUndefinedKeys(item)) as T;
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item === undefined) continue;
      result[key] = dropUndefinedKeys(item);
    }
    return result as T;
  }
  return value;
}

function toSource(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number') return Number.isNaN(value) ? 'NaN' : String(value);
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(toSource).join(',') + ']';
  if (typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => JSON.stringify(key) + ':' + toSource(item)).join(',') + '}';
  }
  return 'undefined';
}

type TestResult = { name: string; passed: boolean; error?: string };
type DoneMessage = { type: 'done'; results: TestResult[]; error?: { message: string } };

function run(code: string, tests: unknown[]): Promise<DoneMessage> {
  return new Promise((resolve) => {
    const host = { postMessage: (message: DoneMessage) => message.type === 'done' && resolve(message) };
    const quiet = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
    const context = vm.createContext({
      hostSelf: host,
      hostConsole: quiet,
      setTimeout,
      clearTimeout,
      Date,
      structuredClone,
    }) as unknown as {
      localTests: unknown;
      self: { onmessage: (event: { data: unknown }) => unknown };
    };
    const timer = setTimeout(() => resolve({ type: 'done', results: [], error: { message: 'таймаут' } }), 10_000);

    try {
      // Тесты строятся внутри контекста: объекты из другого realm не равны
      // по прототипу, и __cubeDeepEqual справедливо их отвергнет
      vm.runInContext(
        'var self = hostSelf; var console = hostConsole; var localTests = ' + toSource(tests) + ';',
        context as unknown as vm.Context,
      );
      vm.runInContext(buildWorkerSource(code), context as unknown as vm.Context);
      Promise.resolve(context.self.onmessage({ data: { tests: context.localTests, mode: 'submit' } }))
        .then(() => clearTimeout(timer))
        .catch((error: unknown) => {
          clearTimeout(timer);
          resolve({ type: 'done', results: [], error: { message: String(error) } });
        });
    } catch (error) {
      clearTimeout(timer);
      resolve({ type: 'done', results: [], error: { message: String(error) } });
    }
  });
}

/**
 * Служебные функции из стартового кода — ученик их не меняет.
 * Отрезаем первую функцию (заготовку ученика) и берём всё, что после неё.
 */
function helpers(starterCode: string): string {
  const lines = starterCode.split('\n');
  const start = lines.findIndex((line) => /^(async\s+)?function\s/.test(line));
  if (start === -1) return '';
  let end = start;
  while (end < lines.length && lines[end].trim() !== '}') end += 1;
  return lines.slice(end + 1).join('\n');
}

type Case = {
  task: AlgorithmTask;
  /** Эталонное решение задачи — должно проходить все проверки */
  solution: string;
  /** Контроль: решение, которое обязано провалить все проверки */
  control: string;
};

const CASES: Case[] = [
  {
    task: promisesInSeries,
    solution: `async function promisesInSeries(asyncFns = []) {
  let value;
  for (const fn of asyncFns) value = await fn(value);
  return value;
}`,
    control: promisesInSeries.starterCode,
  },
  {
    task: optionalChainingPath,
    solution: `function optionalChaining(obj, chain) {
  if (chain.length === 0) return obj;
  if (obj === null || obj === undefined) return undefined;
  const head = chain[0];
  if (!(head in Object(obj))) return undefined;
  return optionalChaining(obj[head], chain.slice(1));
}`,
    control: optionalChainingPath.starterCode,
  },
  {
    task: objectCreatePolyfill,
    // Пустая заготовка здесь проходит проверки на TypeError, поэтому контроль
    // не «ничего не написал», а «написал неверно»: объект без прототипа и свойств
    solution: `function objectCreate(prototype, properties) {
  if (prototype !== null && typeof prototype !== 'object') {
    throw new TypeError('прототип должен быть объектом или null');
  }
  const result = Object.create(prototype);
  if (properties !== undefined) Object.defineProperties(result, properties);
  return result;
}`,
    control: `function objectCreate(prototype, properties) {
  return {};
}`,
  },
];

async function main() {
  let failed = 0;

  for (const item of CASES) {
    const slug = item.task.slug;
    const tests = item.task.tests.map((test) => ({ ...test, expected: dropUndefinedKeys(test.expected) }));
    const helperCode = helpers(item.task.starterCode);

    const solved = await run(item.solution + helperCode, tests);
    const failedTests = solved.results.filter((result) => !result.passed);

    if (solved.error || failedTests.length > 0 || solved.results.length !== tests.length) {
      failed += 1;
      out('FAIL ' + slug + (solved.error ? '   ' + solved.error.message : ''));
      for (const result of failedTests) out('   ✗ ' + result.name);
      continue;
    }

    const control = await run(item.control + helperCode, tests);
    const controlPassed = control.results.filter((result) => result.passed).length;

    if (control.error || controlPassed > 0) {
      failed += 1;
      out('FAIL ' + slug + ': контрольное решение проходит ' + controlPassed + ' проверок' +
        (control.error ? ', ошибка: ' + control.error.message : ''));
      continue;
    }

    out('OK   харнесс: ' + slug + ' — ' + solved.results.length + ' проверок, контрольное решение 0');
  }

  if (failed > 0) {
    out('Провалено задач: ' + failed);
    process.exit(1);
  }
}

main();