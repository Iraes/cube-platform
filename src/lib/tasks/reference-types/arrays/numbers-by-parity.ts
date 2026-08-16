import type { AlgorithmTask } from '@/lib/runner/types';
export const numbersByParity: AlgorithmTask = {
  kind: 'algorithm', slug: 'numbers-by-parity', title: 'Parity', language: 'javascript',
  description: `Реализуйте \`getNumbersByParity(data, parity)\`. Для \`'even'\` верните новый массив чётных чисел, для \`'odd'\` — нечётных. Оба аргумента всегда корректны.`,
  starterCode: `function getNumbersByParity(data, parity) {

}
`,
  tests: [
    { name: 'Возвращает чётные числа', fn: 'getNumbersByParity', input: [[1, 2, 3, 4, 5, 6], 'even'], expected: [2, 4, 6] },
    { name: 'Возвращает нечётные числа', fn: 'getNumbersByParity', input: [[1, 2, 3, 4, 5, 6], 'odd'], expected: [1, 3, 5] },
    { name: 'Работает с отрицательными числами и нулём', fn: 'getNumbersByParity', input: [[-3, -2, -1, 0], 'even'], expected: [-2, 0] },
  ],
};
