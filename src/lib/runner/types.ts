/**
 * Язык-независимые типы исполнения кода.
 *
 * Этот файл — шов между страницей задачи и конкретным исполнителем.
 * Страница задачи знает только про `Runner`, `Task` и `RunResult`, поэтому
 * добавление нового исполнителя (iframe для DOM-задач, серверный раннер для Go)
 * не требует изменений в UI.
 */

export type ConsoleLine = { level: 'log' | 'error'; text: string };

export type RuntimeError = {
  message: string;
  line?: number;
  column?: number;
  stack?: string;
};

export type TestResult = {
  name: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  error?: string;
};

export type RunResult = {
  logs: ConsoleLine[];
  results: TestResult[];
  error?: RuntimeError;
};

export type AlgoTestCase = {
  name: string;
  input: unknown[];
  expected: unknown;
};

export type AlgorithmTask = {
  kind: 'algorithm';
  slug: string;
  title: string;
  description: string;
  language: 'javascript';
  starterCode: string;
  tests: AlgoTestCase[];
};

export type DomCheck = { name: string; body: string };

export type DomTask = {
  kind: 'dom';
  slug: string;
  title: string;
  description: string;
  language: 'javascript';
  html: string;
  starterCode: string;
  checks: DomCheck[];
};

export type Task = AlgorithmTask | DomTask;

/**
 * `run`    — выполнить код и показать вывод, ничего не проверяя (черновик);
 * `submit` — прогнать проверки и вынести вердикт «решено / не решено».
 */
export type RunMode = "run" | "submit";

export type RunOptions = { mode?: RunMode };

export interface Runner {
  run(code: string, task: Task, options?: RunOptions): Promise<RunResult>;
}
