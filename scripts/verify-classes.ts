/**
 * Эталонные решения задач блока «Прототипы и классы», у которых раньше
 * была одна проверка на всё решение. Гоняются через настоящий скрипт воркера.
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

function run(code: string, tests: unknown[]): Promise<any> {
  return new Promise((resolve) => {
    const host: any = { postMessage: (m: any) => m.type === 'done' && resolve(m) };
    const quiet = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
    const ctx: any = vm.createContext({ hostSelf: host, hostConsole: quiet, Date, setTimeout, clearTimeout });
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

/** Оставляем служебные функции, убирая пустые заготовки */
function helpersOnly(starter: string): string {
  return starter
    .replace(/class\s+\w+(\s+extends\s+\w+)?\s*\{\s*\}/g, '')
    .replace(/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g, '');
}

const solutions: Record<string, string> = {
  'link-prototype': `function linkPrototype(object, prototype) {
    Object.setPrototypeOf(object, prototype);
    return object;
  }`,

  'book-library': `function Book(name, author, year, reader = null) {
    this.name = name;
    this.author = author;
    this.year = year;
    this.reader = reader;
  }
  Book.prototype.isAvailable = function () { return this.reader === null; };
  Book.prototype.getCurrentReader = function () { return this.reader; };
  Book.prototype.takeBook = function (readerName) {
    if (!this.isAvailable()) return false;
    this.reader = readerName;
    return true;
  };
  Book.prototype.returnBook = function () {
    if (this.isAvailable()) return false;
    this.reader = null;
    return true;
  };
  Book.prototype.changeBookName = function (name) {
    if (this.name === name) return false;
    this.name = name;
    return true;
  };
  Book.prototype.changeAuthorName = function (name) {
    if (this.author === name) return false;
    this.author = name;
    return true;
  };`,

  'bank-account': `class Person {
    constructor(firstName, lastName, birthDate) {
      this.firstName = firstName;
      this.lastName = lastName;
      this.birthDate = birthDate;
    }
    get fullName() { return this.firstName + ' ' + this.lastName; }
    getAge() {
      const birth = new Date(this.birthDate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
      return age;
    }
  }
  class Account {
    constructor(person, amount) {
      this.person = person;
      this.amount = amount;
      this.history = [];
    }
    #record(target, amount, description) {
      this.history.push({ timestamp: Date.now(), target, amount, description });
    }
    addMoney(amount, description = '') {
      this.amount += amount;
      this.#record('in', amount, description);
      return this.amount;
    }
    withdrawMoney(amount, description = '') {
      this.amount -= amount;
      this.#record('out', amount, description);
      return this.amount;
    }
    getAmount() { return this.amount; }
    getAccountHistory() { return this.history; }
    static transfer(from, to, amount) {
      from.withdrawMoney(amount, 'Перевод');
      to.addMoney(amount, 'Перевод');
    }
  }`,

  'user-profile-class': `class UserProfile {
    constructor(firstName, lastName, roles = []) {
      this.firstName = firstName;
      this.lastName = lastName;
      this.roles = [...roles];
    }
    get fullName() { return this.firstName + ' ' + this.lastName; }
    addRole(role) {
      if (!this.hasRole(role)) this.roles.push(role);
      return this;
    }
    hasRole(role) { return this.roles.includes(role); }
    static fromObject(data) {
      return new UserProfile(data.firstName, data.lastName, data.roles);
    }
  }`,

  'event-emitter': `class EventEmitter {
    constructor() { this.handlers = new Map(); }
    on(event, callback) {
      if (!this.handlers.has(event)) this.handlers.set(event, []);
      this.handlers.get(event).push(callback);
      return this;
    }
    off(event, callback) {
      const list = this.handlers.get(event);
      if (!list) return this;
      const index = list.indexOf(callback);
      if (index !== -1) list.splice(index, 1);
      return this;
    }
    once(event, callback) {
      const wrapper = (...args) => {
        this.off(event, wrapper);
        callback(...args);
      };
      return this.on(event, wrapper);
    }
    emit(event, ...args) {
      const list = this.handlers.get(event);
      if (!list) return false;
      for (const handler of [...list]) handler(...args);
      return true;
    }
  }
  class BroadcastEventEmitter extends EventEmitter {
    emit(event, ...args) {
      if (event !== '*') return super.emit(event, ...args);
      for (const name of [...this.handlers.keys()]) super.emit(name, ...args);
      return true;
    }
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
    }
  }
  out(failed === 0 ? '\nВсе задачи решаются эталонным решением' : '\nПроблемных: ' + failed);
  if (failed) process.exit(1);
}

main();
