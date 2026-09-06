/**
 * Проверка задач блока «Browser API + HTTP».
 *
 * Обычные задачи гоняются через настоящий скрипт воркера, DOM-задачи —
 * через настоящую сборку песочницы, но в jsdom вместо iframe: сам браузер
 * здесь не нужен, а порядок скриптов и хелперы проверок те же самые.
 */
import vm from 'node:vm';
import { buildWorkerSource } from '@/lib/runner/workerHarness';
import { getTask } from '@/lib/tasks';
import type { AlgorithmTask, DomTask } from '@/lib/runner/types';

const out = (s: string) => process.stdout.write(s + '\n');

/* ---------- обычные задачи: настоящий харнесс воркера ---------- */

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

function runAlgorithm(code: string, tests: unknown[]): Promise<any> {
  return new Promise((resolve) => {
    const host: any = { postMessage: (m: any) => m.type === 'done' && resolve(m) };
    const quiet = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
    const ctx: any = vm.createContext({ hostSelf: host, hostConsole: quiet });
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

/* ---------- DOM-задачи: та же разметка и те же хелперы ---------- */

/** jsdom не в зависимостях проекта: ставится разово через npm i -D jsdom */
async function loadJsdom(): Promise<any | null> {
  try {
    return await import('jsdom');
  } catch {
    return null;
  }
}

async function runDom(task: DomTask, solution: string, jsdom: any) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(`<!doctype html><html><body>${task.html}</body></html>`, { runScripts: 'outside-only' });
  const win = dom.window as any;

  win.find = (selector: string) => {
    const el = win.document.querySelector(selector);
    if (!el) throw new Error('на странице нет элемента ' + selector);
    return el;
  };
  win.findAll = (selector: string) => Array.from(win.document.querySelectorAll(selector));
  win.click = (target: any) => (typeof target === 'string' ? win.find(target) : target).click();
  win.typeInto = (target: any, text: string) => {
    const el = typeof target === 'string' ? win.find(target) : target;
    el.value = text;
    el.dispatchEvent(new win.Event('input', { bubbles: true }));
    el.dispatchEvent(new win.Event('change', { bubbles: true }));
  };
  win.assert = (condition: unknown, message?: string) => {
    if (!condition) throw new Error(message || 'условие не выполнено');
  };
  win.assertEqual = (actual: unknown, expected: unknown, message?: string) => {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) throw new Error((message ? message + ': ' : '') + 'ожидалось ' + b + ', получено ' + a);
  };

  win.eval(solution);

  const failures: string[] = [];
  for (const check of task.checks) {
    try {
      win.eval('(function(){' + check.body + '})()');
    } catch (error) {
      failures.push('   ✗ ' + check.name + '\n       ' + (error as Error).message);
    }
  }
  return failures;
}

/* ---------- эталонные решения ---------- */

const algorithms: Record<string, string> = {
  'status-category': `function describeStatus(code) {
    if (typeof code !== 'number' || !Number.isFinite(code)) return 'неизвестный код';
    const group = Math.floor(code / 100);
    const names = { 1: 'информация', 2: 'успех', 3: 'перенаправление', 4: 'ошибка клиента', 5: 'ошибка сервера' };
    return names[group] ?? 'неизвестный код';
  }`,
  'build-query': `function buildQuery(params) {
    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
      .join('&');
  }`,
  'is-idempotent': `function isIdempotent(method) {
    if (typeof method !== 'string') return false;
    const known = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'];
    return known.includes(method.trim().toUpperCase());
  }`,
  'storage-counter': `function countVisit(storage, page) {
    let visits = {};
    const raw = storage.getItem('visits');
    if (raw) {
      try { visits = JSON.parse(raw); } catch (error) { visits = {}; }
    }
    visits[page] = (visits[page] || 0) + 1;
    storage.setItem('visits', JSON.stringify(visits));
    return visits;
  }`,
};

const doms: Record<string, string> = {
  'dom-find-elements': `function describePage() {
    return {
      title: document.querySelector('#title').textContent.trim(),
      tagCount: document.querySelectorAll('.tag').length,
      firstTag: document.querySelector('.tag').textContent,
    };
  }`,
  'dom-set-attributes': `function setupLink(url, text) {
    const link = document.querySelector('#link');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noreferrer noopener');
    link.textContent = text;
  }`,
  'dom-render-list': `function renderTodos(items) {
    const list = document.querySelector('#todo-list');
    list.innerHTML = '';
    for (const item of items) {
      const li = document.createElement('li');
      li.className = 'todo';
      li.textContent = item;
      list.append(li);
    }
  }`,
  'dom-delegate-clicks': `function setupList() {
    document.querySelector('#goods').addEventListener('click', (event) => {
      if (!event.target.classList.contains('remove')) return;
      event.target.closest('li').remove();
    });
  }`,
  'dom-toggle-box': `const btn = document.querySelector('#paint-btn');
  const box = document.querySelector('#box');
  btn.addEventListener('click', () => box.classList.add('box--active'));`,
  'dom-filter-list': `const search = document.querySelector('#search');
  const items = document.querySelectorAll('#user-list li');
  search.addEventListener('input', () => {
    const query = search.value.toLowerCase();
    for (const item of items) {
      item.classList.toggle('hidden', !item.textContent.toLowerCase().includes(query));
    }
  });`,
};

function helpersOnly(starter: string): string {
  return starter
    .replace(/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g, '')
    .replace(/const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{\s*\};?/g, '');
}

async function main() {
  let failed = 0;

  for (const [slug, solution] of Object.entries(algorithms)) {
    const task = getTask(slug) as AlgorithmTask | undefined;
    if (!task) { out('НЕТ ЗАДАЧИ ' + slug); failed += 1; continue; }

    const starterRun = await runAlgorithm(task.starterCode, task.tests);
    const passedOnStarter = starterRun.results.filter((r: any) => r.passed).length;

    const res = await runAlgorithm(helpersOnly(task.starterCode) + '\n' + solution, task.tests);
    const bad = res.results.filter((r: any) => !r.passed);
    if (res.error || bad.length > 0) {
      failed += 1;
      out('\nFAIL ' + slug);
      if (res.error) out('   общая ошибка: ' + res.error.message);
      for (const r of bad) out('   ✗ ' + r.name + '\n       ' + (r.error ?? 'получено: ' + JSON.stringify(r.actual)));
    } else {
      out('OK   ' + slug.padEnd(20) + ' проверок: ' + res.results.length +
          (passedOnStarter ? '   ВНИМАНИЕ: пустая заготовка проходит ' + passedOnStarter : ''));
    }
  }

  const jsdom = await loadJsdom();
  if (!jsdom) {
    out('\nDOM-задачи пропущены: нет jsdom. Поставьте разово — npm i -D jsdom');
    out(failed === 0 ? 'Обычные задачи решаются эталонным решением' : 'Проблемных задач: ' + failed);
    if (failed) process.exit(1);
    return;
  }

  for (const [slug, solution] of Object.entries(doms)) {
    const task = getTask(slug) as DomTask | undefined;
    if (!task) { out('НЕТ ЗАДАЧИ ' + slug); failed += 1; continue; }
    const failures = await runDom(task, solution, jsdom);
    if (failures.length) {
      failed += 1;
      out('\nFAIL ' + slug);
      failures.forEach((line) => out(line));
    } else {
      out('OK   ' + slug.padEnd(20) + ' проверок: ' + task.checks.length);
    }
  }

  out(failed === 0 ? '\nВсе задачи блока решаются эталонным решением' : '\nПроблемных задач: ' + failed);
  if (failed) process.exit(1);
}

main();
