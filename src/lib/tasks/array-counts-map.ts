import type { AlgorithmTask } from '@/lib/runner/types';

export const arrayCountsMap: AlgorithmTask = {
  kind: 'algorithm', slug: 'array-counts-map', title: 'Частоты элементов в Map', language: 'javascript',
  description: `Реализуйте \`getArraysCounts(values)\`. Верните экземпляр \`Map\`: его ключами должны быть уникальные элементы массива, а значениями — число их появлений. Объекты сравниваются по ссылке.`,
  starterCode: `function getArraysCounts(values) {

}
`,
  tests: [
    { name: 'Считает примитивы', fn: 'getArraysCounts', input: [[1, 1, 1, 2, 2, true, true]], expected: new Map<unknown, number>([[1, 3], [2, 2], [true, 2]]) },
    { name: 'Пустой массив даёт пустую Map', fn: 'getArraysCounts', input: [[]], expected: new Map() },
  ],
};
