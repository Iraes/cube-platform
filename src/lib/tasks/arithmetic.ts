import type { AlgorithmTask } from '@/lib/runner/types';
export const arithmetic: AlgorithmTask = {
  kind: 'algorithm', slug: 'arithmetic', title: 'Arithmetic', language: 'javascript',
  description: `Реализуйте \`arithmetic(a, b, operator)\`. Оператор — одна из строк: \`add\`, \`subtract\`, \`multiply\`, \`divide\`. Для неизвестного оператора верните \`NaN\`.`,
  starterCode: `function arithmetic(a, b, operator) {

}
`,
  tests: [
    { name: 'Сложение', fn: 'arithmetic', input: [5, 2, 'add'], expected: 7 },
    { name: 'Вычитание', fn: 'arithmetic', input: [5, 2, 'subtract'], expected: 3 },
    { name: 'Умножение', fn: 'arithmetic', input: [5, 2, 'multiply'], expected: 10 },
    { name: 'Деление', fn: 'arithmetic', input: [5, 2, 'divide'], expected: 2.5 },
    { name: 'Неизвестный оператор → NaN', fn: 'arithmetic', input: [5, 2, 'unknown'], expected: Number.NaN },
  ],
};
