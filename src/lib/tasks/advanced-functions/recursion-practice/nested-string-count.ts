import type { AlgorithmTask } from '@/lib/runner/types';
export const nestedStringCount: AlgorithmTask = {
  kind: 'algorithm', slug: 'nested-string-count', title: 'Get String Count', language: 'javascript',
  description: `Реализуйте **с использованием рекурсии** функцию \`getStringCount(value)\`. Она принимает массив или объект и считает количество строк среди всех вложенных значений.

Рекурсивно вызывайте именно \`getStringCount\`. \`null\`, числа и логические значения строками не считаются.`,
  starterCode: `function getStringCount(value) {

}
`,
  tests: [
    { name: 'Считает строки во вложенном объекте', fn: 'getStringCount', input: [{ first: '1', second: '2', third: false, fourth: ['anytime', 2, 3, 4], fifth: null }], expected: 3 },
    { name: 'Считает строки во вложенном массиве', fn: 'getStringCount', input: [['1', '2', ['3']]], expected: 3 },
    { name: 'Нет строк → 0', fn: 'getStringCount', input: [{ a: 1, b: [false, null] }], expected: 0 },
  ],
};
