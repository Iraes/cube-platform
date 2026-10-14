/**
 * Эталонное решение задачи «Две цепочки промисов», прогнанное через
 * настоящий скрипт воркера.
 *
 * Здесь это важнее обычного: задача целиком про порядок микрозадач,
 * а он зависит от окружения, в котором исполняется код. Проверять такую
 * задачу через new Function в обход харнесса — значит проверять не то.
 */
import vm from 'node:vm';
import { buildWorkerSource } from '@/lib/runner/workerHarness';
import { promiseChainsOrder } from '@/lib/tasks/async-code/promises/promise-chains-order';

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

function run(code: string, tests: unknown[]): Promise<any> {
  return new Promise((resolve) => {
    const host: any = { postMessage: (m: any) => m.type === 'done' && resolve(m) };
    const quiet = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
    const ctx: any = vm.createContext({
      hostSelf: host, hostConsole: quiet, setTimeout, clearTimeout, Date,
    });
    const timer = setTimeout(() => resolve({ results: [], error: { message: 'таймаут' } }), 10_000);
    try {
      vm.runInContext(
        'var self = hostSelf; var console = hostConsole; var structuredClone = function (v) { return v; };'
          + 'var localTests = ' + toSource(tests) + ';',
        ctx,
      );
      vm.runInContext(buildWorkerSource(code), ctx);
      Promise.resolve(ctx.self.onmessage({ data: { tests: ctx.localTests, mode: 'submit' } }))
        .then(() => clearTimeout(timer))
        .catch((e: any) => { clearTimeout(timer); resolve({ results: [], error: { message: String(e) } }); });
    } catch (e) {
      clearTimeout(timer);
      resolve({ results: [], error: { message: String(e) } });
    }
  });
}

/** Оставляем служебные функции, убирая пустые заготовки ученика */
function helpersOnly(starter: string): string {
  return starter.replace(/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g, '');
}

const solution = `
function resolvedChain(log) {
  return Promise.resolve()
    .then(() => log(1))
    .then(() => log(2))
    .catch(() => log(3))
    .then(() => log(4));
}

function rejectedChain(log) {
  return Promise.reject()
    .then(() => log(5))
    .then(() => log(6))
    .catch(() => log(7))
    .then(() => log(8));
}

function bothChains(log) {
  resolvedChain(log);
  rejectedChain(log);
}

function withoutCatch(log) {
  return Promise.resolve()
    .then(() => log(1))
    .then(() => log(2))
    .then(() => log(4));
}
`;

async function main() {
  const task = promiseChainsOrder;

  const empty = await run(task.starterCode, task.tests);
  const emptyPassed = empty.results.filter((r: any) => r.passed).length;

  const solved = await run(helpersOnly(task.starterCode) + solution, task.tests);
  const bad = solved.results.filter((r: any) => !r.passed);

  if (solved.error || bad.length > 0) {
    out('FAIL ' + task.slug + (solved.error ? '   ' + solved.error.message : ''));
    for (const r of bad) {
      out('   ✗ ' + r.name + '\n       ' + (r.error ?? 'получено: ' + JSON.stringify(r.actual)));
    }
    process.exit(1);
  }

  out('OK   ' + task.slug + '   проверок ' + solved.results.length
    + ', пустая заготовка проходит ' + emptyPassed);

  if (emptyPassed > 0) {
    out('ВНИМАНИЕ: пустая заготовка не должна проходить ни одной проверки');
    process.exit(1);
  }
}

main();
