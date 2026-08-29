import type { AlgorithmTask } from '@/lib/runner/types';
export const swapValues: AlgorithmTask = {
  kind: 'algorithm', slug: 'swap-values', title: 'Обмен значений', language: 'javascript',
  description: `Разминка на переменные. Реализуйте \`swapValues(a, b)\` — она возвращает массив из двух элементов, где значения переставлены местами: сначала \`b\`, потом \`a\`.

Записать \`a = b\` в первой же строке не выйдет: старое значение \`a\` потеряется, и вернутся два одинаковых элемента. Заведите временную переменную через \`let\` и сохраните в ней то, что вот-вот перезапишете.`,
  starterCode: `function swapValues(a, b) {

}
`,
  tests: [
    { name: 'swapValues(1, 2) → [2, 1]', fn: 'swapValues', input: [1, 2], expected: [2, 1] },
    { name: "swapValues('первый', 'второй') → ['второй', 'первый']", fn: 'swapValues', input: ['первый', 'второй'], expected: ['второй', 'первый'] },
    { name: 'Одинаковые значения: swapValues(0, 0) → [0, 0]', fn: 'swapValues', input: [0, 0], expected: [0, 0] },
    { name: 'swapValues(null, undefined) → [undefined, null]', fn: 'swapValues', input: [null, undefined], expected: [undefined, null] },
  ],
};
