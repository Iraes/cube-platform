import type { AlgorithmTask } from '@/lib/runner/types';

export const defaultTo: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'default-to',
  title: 'Default To',
  language: 'javascript',
  description: `Реализуйте функцию defaultTo, которая принимает значение первым аргументом и его значение по-умолчанию вторым. Если первое значение null, NaN или undefined, то должно быть возвращено значение по-умолчанию. Если нет, то нужно вернуть само значение (первый аргумент).

Пример:

\`\`\`js
console.log(defaultTo(1, 10)); // 1;
console.log(defaultTo(undefined, 10)); // 10;
\`\`\`
`,
  starterCode: `const defaultTo = (value, defaultValue) => {

};
`,
  tests: [
    { name: "defaultTo('text', 'X') → 'text'", fn: 'defaultTo', input: ['text', 'X'], expected: 'text' },
    {
      name: "defaultTo(1, 10) → 1",
      fn: 'defaultTo',
      input: [1, 10],
      expected: 1,
    },
    {
      name: "defaultTo(NaN, 'this is NaN') → 'this is NaN'",
      fn: 'defaultTo',
      input: [NaN, 'this is NaN'],
      expected: 'this is NaN',
    },
    {
      name: "defaultTo(undefined, 10) → 10",
      fn: 'defaultTo',
      input: [undefined, 10],
      expected: 10,
    },
    { name: "defaultTo(null, 10) → 10", fn: 'defaultTo', input: [null, 10], expected: 10 },
    { name: "Ноль — не пустое значение: defaultTo(0, 10) → 0", fn: 'defaultTo', input: [0, 10], expected: 0 },
  ],
};
