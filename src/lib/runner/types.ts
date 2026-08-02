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

/** Имена встроенных типов ошибок, которые задача может требовать «породить» */
export type ErrorKind =
  | 'ReferenceError'
  | 'TypeError'
  | 'RangeError'
  | 'SyntaxError'
  | 'EvalError'
  | 'URIError'
  | 'Error';

export type AlgoTestCase = {
  name: string;
  input: unknown[];
  /** Ожидаемый результат. Не нужен, если проверяем выброшенную ошибку */
  expected?: unknown;
  /**
   * Какую функцию вызывать. По умолчанию `solution` — в задачах,
   * где ученик пишет несколько функций, здесь их имена.
   */
  fn?: string;
  /**
   * Проверка «вызов должен выбросить ошибку такого типа».
   * Нужна для задач, где смысл именно в ошибке, а не в возвращённом значении.
   */
  throws?: ErrorKind;
  /** Дополнительно: часть текста ошибки. Осторожно — формулировки зависят от браузера */
  messageIncludes?: string;
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

export type QuizOption = { id: string; text: string };

export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
  /**
   * Идентификаторы верных вариантов. Если их несколько — вопрос
   * с мультивыбором, и засчитывается только полное совпадение.
   */
  correct: string[];
  /** Разбор, который показываем после проверки */
  explanation?: string;
};

/**
 * Тест с выбором вариантов. В отличие от задач с кодом, здесь нечего
 * исполнять: ответы сверяет сервер, чтобы правильные варианты
 * не уезжали в браузер вместе со страницей.
 */
export type QuizTask = {
  kind: 'quiz';
  slug: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
};

/** Задачи, где ученик пишет код: у них есть starterCode и свой исполнитель */
export type CodeTask = AlgorithmTask | DomTask;

export type Task = CodeTask | QuizTask;

/**
 * `run`    — выполнить код и показать вывод, ничего не проверяя (черновик);
 * `submit` — прогнать проверки и вынести вердикт «решено / не решено».
 */
export type RunMode = "run" | "submit";

export type RunOptions = { mode?: RunMode };

export interface Runner {
  run(code: string, task: Task, options?: RunOptions): Promise<RunResult>;
}
