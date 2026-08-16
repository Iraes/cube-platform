import type { AlgorithmTask } from '@/lib/runner/types';

export const analyzeNumbers: AlgorithmTask = {
  kind: 'algorithm', slug: 'analyze-numbers', title: 'Анализ набора чисел', language: 'javascript',
  description: `Реализуйте \`analyzeNumbers(values)\` с помощью методов массивов.

Верните объект:

- \`evenSquares\` — квадраты только чётных чисел в исходном порядке;
- \`total\` — сумма всех исходных чисел.

Исходный массив изменять нельзя.`,
  starterCode: `function analyzeNumbers(values) {

}
`,
  tests: [
    { name: 'Фильтрует, преобразует и сворачивает массив', fn: 'analyzeNumbers', input: [[1, 2, 3, 4]], expected: { evenSquares: [4, 16], total: 10 } },
    { name: 'Работает с отрицательными числами и пустым результатом фильтра', fn: 'analyzeNumbers', input: [[-3, 1, 5]], expected: { evenSquares: [], total: 3 } },
    { name: 'Обрабатывает пустой массив', fn: 'analyzeNumbers', input: [[]], expected: { evenSquares: [], total: 0 } },
  ],
};
