import type { AlgorithmTask } from '@/lib/runner/types';

export const deepEqualTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'deep-equal', title: 'Глубокое сравнение', language: 'javascript',
  description: `Реализуйте \`deepEqual(a, b)\`. Примитивы сравнивайте строго, а объекты и массивы — рекурсивно, независимо от порядка ключей. Корректно обработайте \`null\`.`,
  starterCode: `function deepEqual(a, b) {

}
`,
  tests: [
    { name: 'Равные вложенные объекты', fn: 'deepEqual', input: [{ a: { b: 1 }, c: [2, 3] }, { c: [2, 3], a: { b: 1 } }], expected: true },
    { name: 'Разные вложенные значения', fn: 'deepEqual', input: [{ a: { b: 1 } }, { a: { b: 2 } }], expected: false },
    { name: 'Строго сравнивает примитивы', fn: 'deepEqual', input: [0, false], expected: false },
    { name: 'Корректно сравнивает null', fn: 'deepEqual', input: [null, null], expected: true },
    { name: 'Замечает дополнительное свойство', fn: 'deepEqual', input: [{ name: 'Misha' }, { name: 'Misha', extra: null }], expected: false },
  ],
};
