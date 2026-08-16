import type { AlgorithmTask } from '@/lib/runner/types';
export const findAllIdx: AlgorithmTask = {
  kind: 'algorithm', slug: 'find-all-idx', title: 'Find All Indexes', language: 'javascript',
  description: `Напишите \`findAllIdx(arr, value)\`, которая возвращает массив индексов всех элементов, строго равных \`value\`.

\`findAllIdx([1, 0, 1, 0, 0, 1], 0) // [1, 3, 4]\``,
  starterCode: `function findAllIdx(arr, value) {

}
`,
  tests: [
    { name: 'Находит все индексы', fn: 'findAllIdx', input: [[1, 0, 1, 0, 0, 1], 0], expected: [1, 3, 4] },
    { name: 'Нет совпадений → []', fn: 'findAllIdx', input: [[1, 1], 0], expected: [] },
    { name: 'Использует строгое сравнение', fn: 'findAllIdx', input: [[1, '1', 1], 1], expected: [0, 2] },
  ],
};
