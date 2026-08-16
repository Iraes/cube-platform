import type { AlgorithmTask } from '@/lib/runner/types';

export const sumRest: AlgorithmTask = {
  kind: 'algorithm', slug: 'sum-rest', title: 'Сумма аргументов', language: 'javascript',
  description: `Реализуйте \`sum(...values)\`, принимающую любое количество аргументов. Складывайте числа и значения, которые можно корректно привести к числу. Значения, превращающиеся в \`NaN\`, игнорируйте. Вызов без аргументов возвращает 0.`,
  starterCode: `function sum(...values) {

}
`,
  tests: [
    { name: 'Складывает произвольное количество чисел', fn: 'sum', input: [1, 2, 3, 4, 5, 6], expected: 21 },
    { name: 'Без аргументов возвращает ноль', fn: 'sum', input: [], expected: 0 },
    { name: 'Приводит допустимые значения и игнорирует NaN', fn: 'sum', input: [1, 'bad', {}, [], 3, 4, 2, true, false], expected: 11 },
  ],
};
