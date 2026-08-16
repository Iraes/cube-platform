import type { AlgorithmTask } from '@/lib/runner/types';
export const moveToStart: AlgorithmTask = {
  kind: 'algorithm', slug: 'move-to-start', title: 'Move To Start', language: 'javascript',
  description: `Реализуйте \`moveToStart(arr, n)\`: перенесите \`n\` элементов с конца массива в начало и верните новый массив. Исходный массив изменять нельзя. Если \`n >= arr.length\`, верните новую копию в исходном порядке.`,
  starterCode: `function moveToStart(arr, n) {

}
`,
  tests: [
    { name: 'Переносит три элемента с конца', fn: 'moveToStart', input: [[1, 2, 3, 4, 5], 3], expected: [3, 4, 5, 1, 2] },
    { name: 'n больше длины сохраняет порядок', fn: 'moveToStart', input: [[1, 2, 3], 10], expected: [1, 2, 3] },
    { name: 'n = 0 сохраняет порядок', fn: 'moveToStart', input: [[1, 2, 3], 0], expected: [1, 2, 3] },
  ],
};
