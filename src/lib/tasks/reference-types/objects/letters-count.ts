import type { AlgorithmTask } from '@/lib/runner/types';

export const lettersCount: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'letters-count',
  title: 'Letters Count',
  language: 'javascript',
  description: `Реализуйте функцию \`lettersCount(str)\`, которая возвращает объект-счётчик букв строки.

Перед подсчётом приведите строку к нижнему регистру: большая и маленькая буквы считаются одинаковыми.

\`\`\`js
lettersCount('aAAbbccde');
// { a: 3, b: 2, c: 2, d: 1, e: 1 }
\`\`\``,
  starterCode: `function lettersCount(str) {

}
`,
  tests: [
    { name: "lettersCount('aAAbbccde') считает буквы без учёта регистра", fn: 'lettersCount', input: ['aAAbbccde'], expected: { a: 3, b: 2, c: 2, d: 1, e: 1 } },
    { name: "lettersCount('') → {}", fn: 'lettersCount', input: [''], expected: {} },
    { name: "lettersCount('JavaScript') корректно считает повторения", fn: 'lettersCount', input: ['JavaScript'], expected: { j: 1, a: 2, v: 1, s: 1, c: 1, r: 1, i: 1, p: 1, t: 1 } },
  ],
};
