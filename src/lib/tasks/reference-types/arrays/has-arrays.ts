import type { AlgorithmTask } from '@/lib/runner/types';
export const hasArrays: AlgorithmTask = {
  kind: 'algorithm', slug: 'has-arrays', title: 'Has Arrays', language: 'javascript',
  description: `Реализуйте \`hasArrays(arr)\`. Верните \`true\`, если среди элементов входного массива есть хотя бы один массив, иначе \`false\`.`,
  starterCode: `function hasArrays(arr) {

}
`,
  tests: [
    { name: 'Находит вложенный массив', fn: 'hasArrays', input: [[false, true, [1, 2], {}, 1]], expected: true },
    { name: 'Пустой массив → false', fn: 'hasArrays', input: [[]], expected: false },
    { name: 'Обычный объект не считается массивом', fn: 'hasArrays', input: [[{}, { 0: 'a' }]], expected: false },
  ],
};
