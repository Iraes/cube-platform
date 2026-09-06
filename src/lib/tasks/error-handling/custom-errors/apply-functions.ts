import type { AlgorithmTask } from '@/lib/runner/types';

export const applyFunctions: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'apply-functions',
  title: 'Применение функций с отчётом об ошибках',
  language: 'javascript',
  description: `Создайте класс \`ExecutionError\`, унаследованный от \`Error\`, и функцию \`applyFn(data, callback)\`.

\`applyFn\` должна независимо обработать каждый элемент массива и вернуть объект:

\`{ succeeded: [...], errors: [...] }\`

- в \`succeeded\` попадают результаты успешных вызовов \`callback(element)\`;
- ошибка одного элемента не останавливает обработку остальных;
- в \`errors\` для каждого сбоя попадает новый экземпляр \`ExecutionError\`;
- метод \`getArgData()\` у ошибки возвращает исходный элемент;
- стек \`ExecutionError\` должен сохранять стек пойманной ошибки, чтобы указывать на место сбоя в callback.

Дайте пользовательской ошибке имя \`ExecutionError\`. Служебную функцию проверки не изменяйте.`,
  starterCode: `class ExecutionError extends Error {

}

function applyFn(data, callback) {

}

function checkApplyFn(data, mode) {
  function callback(value) {
    if (mode === 'double') return value * 2;
    if (mode === 'parse') return JSON.parse(value);
    if (mode === 'positive' && value < 0) throw new RangeError('Только положительные числа');
    return value;
  }

  const result = applyFn(data, callback);
  return {
    succeeded: result.succeeded,
    errors: result.errors.map((error) => ({
      instance: error instanceof ExecutionError,
      name: error.name,
      argData: error.getArgData(),
      stackHasCallback: typeof error.stack === 'string' && error.stack.includes('callback'),
    })),
  };
}
`,
  tests: [
    { name: 'Собирает результаты успешных вызовов', fn: 'checkApplyFn', input: [[1, 2, 3], 'double'], expected: { succeeded: [2, 4, 6], errors: [] } },
    { name: 'Продолжает обработку после ошибки', fn: 'checkApplyFn', input: [['{"id":1}', '{{}', '{"id":2}'], 'parse'], expected: { succeeded: [{ id: 1 }, { id: 2 }], errors: [{ instance: true, name: 'ExecutionError', argData: '{{}', stackHasCallback: true }] } },
    { name: 'Сохраняет данные и стек каждой ошибки', fn: 'checkApplyFn', input: [[2, -1, 4, -3], 'positive'], expected: { succeeded: [2, 4], errors: [{ instance: true, name: 'ExecutionError', argData: -1, stackHasCallback: true }, { instance: true, name: 'ExecutionError', argData: -3, stackHasCallback: true }] } },
  ],
};
