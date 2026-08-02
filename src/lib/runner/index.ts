import { browserJsRunner } from './browserJsRunner';
import type { RunOptions, RunResult, Runner, Task } from './types';

export * from './types';

/**
 * Заглушка для типов задач, у которых исполнитель ещё не написан.
 * Возвращает понятный результат вместо исключения, чтобы UI не падал.
 */
function notImplementedRunner(kind: Task['kind']): Runner {
  return {
    run: async () => ({
      logs: [],
      results: [],
      error: { message: `Исполнитель для задач типа «${kind}» ещё не реализован` },
    }),
  };
}

/**
 * Единственное место, где тип задачи превращается в исполнителя.
 * Здесь же появятся iframeDomRunner (этап 1b) и серверный раннер для Go.
 */
export function getRunner(task: Task): Runner {
  switch (task.kind) {
    case 'algorithm':
      return browserJsRunner;
    case 'dom':
      return notImplementedRunner('dom');
    case 'quiz':
      // У теста нет кода: ответы проверяет сервер, экран свой
      return notImplementedRunner('quiz');
    default: {
      const exhaustive: never = task;
      return notImplementedRunner((exhaustive as Task).kind);
    }
  }
}

export function runCode(code: string, task: Task, options?: RunOptions): Promise<RunResult> {
  return getRunner(task).run(code, task, options);
}
