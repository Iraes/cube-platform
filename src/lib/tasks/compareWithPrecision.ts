import type { AlgorithmTask } from '@/lib/runner/types';

export const compareWithPrecision: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'compare-with-precision',
  title: 'compareWithPrecision',
  language: 'javascript',
  description: `Напишите функцию, которая сравнивает два числа с определенной погрешностью.

Пример:
\`\`\`js
compareWithPrecision(0.1 + 0.2, 0.3, 0.0001) // true
\`\`\`
`,
  starterCode: `function compareWithPrecision(a, b, precision) {

}
`,
  tests: [
    {
      name: "compareWithPrecision(0.1 + 0.2, 0.3, 0.0001) → true",
      fn: 'compareWithPrecision',
      input: [0.1 + 0.2, 0.3, 0.0001],
      expected: true,
    },
    {
      name: "Разница больше погрешности: compareWithPrecision(1, 1.5, 0.1) → false",
      fn: 'compareWithPrecision',
      input: [1, 1.5, 0.1],
      expected: false,
    },
    {
      name: "Порядок аргументов не важен: compareWithPrecision(0.3, 0.1 + 0.2, 0.0001) → true",
      fn: 'compareWithPrecision',
      input: [0.3, 0.1 + 0.2, 0.0001],
      expected: true,
    },
    {
      name: "Равные числа: compareWithPrecision(5, 5, 0.001) → true",
      fn: 'compareWithPrecision',
      input: [5, 5, 0.001],
      expected: true,
    },
  ],
};
