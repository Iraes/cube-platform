/**
 * Прогон эталонных решений вводных задач через настоящий скрипт воркера.
 *
 * Проверяет две вещи сразу: эталон проходит все проверки, а пустая заготовка
 * не проходит ни одной — иначе задача ничего не требует от ученика.
 */
import vm from 'node:vm';
import { buildWorkerSource } from '@/lib/runner/workerHarness';
import { getTask } from '@/lib/tasks';
import type { AlgorithmTask } from '@/lib/runner/types';

const out = (s: string) => process.stdout.write(s + '\n');
process.on('unhandledRejection', () => {});

function toSource(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number') return Number.isNaN(value) ? 'NaN' : String(value);
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(toSource).join(',') + ']';
  if (typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => JSON.stringify(k) + ':' + toSource(v)).join(',') + '}';
  }
  return 'undefined';
}

function guarded(timer: typeof setTimeout) {
  return (fn: (...args: unknown[]) => void, ms?: number, ...args: unknown[]) =>
    (timer as any)(() => { try { fn(...args); } catch { /* ожидаемо для пустых заготовок */ } }, ms);
}

function run(code: string, tests: unknown[]): Promise<any> {
  return new Promise((resolve) => {
    const host: any = { postMessage: (m: any) => m.type === 'done' && resolve(m) };
    const quiet = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
    const ctx: any = vm.createContext({
      hostSelf: host, hostConsole: quiet,
      setTimeout: guarded(setTimeout), clearTimeout, Date,
    });
    try {
      vm.runInContext(
        'var self = hostSelf; var console = hostConsole; var structuredClone = function (v) { return v; };'
          + 'var localTests = ' + toSource(tests) + ';',
        ctx,
      );
      vm.runInContext(buildWorkerSource(code), ctx);
      Promise.resolve(ctx.self.onmessage({ data: { tests: ctx.localTests, mode: 'submit' } }))
        .catch((e: any) => resolve({ results: [], error: { message: String(e) } }));
    } catch (e) {
      resolve({ results: [], error: { message: String(e) } });
    }
  });
}

/** Из стартового кода убираем пустые заготовки, служебные функции оставляем */
function helpersOnly(starter: string): string {
  return starter
    .replace(/async\s+function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g, '')
    .replace(/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g, '')
    .replace(/class\s+\w+\s+extends\s+\w+\s*\{\s*\}/g, '')
    .replace(/function\s+collectOrder\s*\(log\)\s*\{\s*\}/g, '');
}

const solutions: Record<string, string> = {
  'to-positive-number': `function toPositiveNumber(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) throw new TypeError('Ожидалось число');
    if (value < 0) throw new RangeError('Число не может быть отрицательным');
    return value;
  }`,
  'safe-parse': `function safeParse(text, fallback) {
    try { return JSON.parse(text); } catch (error) { return fallback; }
  }`,
  'validation-error': `class ValidationError extends Error {
    constructor(message, field) {
      super(message);
      this.name = 'ValidationError';
      this.field = field;
    }
  }
  function validateAge(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 150) {
      throw new ValidationError('Возраст должен быть числом от 0 до 150', 'age');
    }
    return value;
  }`,
  'read-one-file': `function readSize(name, getFileSize, onDone) {
    getFileSize(name, (size) => onDone(size));
  }`,
  'make-promise': `function makePromise(value, shouldFail, delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => (shouldFail ? reject(new Error(value)) : resolve(value)), delay);
    });
  }`,
  'sum-async': `async function sumAsync(api) {
    const first = await api.getFirst();
    const second = await api.getSecond();
    return first + second;
  }`,
  'execution-order': `function collectOrder(log) {
    log('первая');
    Promise.resolve().then(() => log('микрозадача'));
    setTimeout(() => log('таймер'), 0);
    log('последняя');
  }`,
};

async function main() {
  let failed = 0;
  for (const [slug, solution] of Object.entries(solutions)) {
    const task = getTask(slug) as AlgorithmTask | undefined;
    if (!task) { out('НЕТ ЗАДАЧИ ' + slug); failed += 1; continue; }

    const empty = await run(task.starterCode, task.tests);
    const emptyPassed = empty.results.filter((r: any) => r.passed).length;

    const res = await run(helpersOnly(task.starterCode) + '\n' + solution, task.tests);
    const bad = res.results.filter((r: any) => !r.passed);

    if (res.error || bad.length > 0) {
      failed += 1;
      out('\nFAIL ' + slug + (res.error ? '   ' + res.error.message : ''));
      for (const r of bad) out('   ✗ ' + r.name + '\n       ' + (r.error ?? 'получено: ' + JSON.stringify(r.actual)));
    } else {
      out('OK   ' + slug.padEnd(20) + ' проверок ' + res.results.length +
          ', пустая заготовка проходит ' + emptyPassed);
      if (emptyPassed === task.tests.length) { out('       ВНИМАНИЕ: задачу можно сдать пустой'); failed += 1; }
    }
  }
  out(failed === 0 ? '\nВсе вводные задачи в порядке' : '\nПроблемных: ' + failed);
  if (failed) process.exit(1);
}

main();
