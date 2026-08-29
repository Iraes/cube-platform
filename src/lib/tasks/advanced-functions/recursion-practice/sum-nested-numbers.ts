import type { AlgorithmTask } from '@/lib/runner/types';
export const sumNestedNumbers: AlgorithmTask = {
  kind: 'algorithm', slug: 'sum-nested-numbers', title: 'Сумма во вложенных массивах', language: 'javascript',
  description: `Ступенька к \`Get String Count\`. Здесь только массивы и числа — объектов пока нет.

Реализуйте \`sumNested(values)\`: сложите все числа, на какой бы глубине вложенности они ни лежали.

\`\`\`js
sumNested([1, 2, 3]); // 6
sumNested([1, [2, 3], 4]); // 10
sumNested([[1, [2, [3]]]]); // 6
\`\`\`

Приём тот же, что в факториале, только шаг — не одно уменьшение, а разбор по элементам: перебираете массив, и если элемент сам массив, вызываете для него \`sumNested\` и прибавляете результат, а если число — прибавляете как есть. Проверить, массив ли перед вами, помогает \`Array.isArray(value)\`.

Дальше добавятся объекты и проверка типа значения, но каркас останется этим же.`,
  starterCode: `function sumNested(values) {

}
`,
  tests: [
    { name: 'Плоский массив: sumNested([1, 2, 3]) → 6', fn: 'sumNested', input: [[1, 2, 3]], expected: 6 },
    { name: 'Один уровень вложенности: sumNested([1, [2, 3], 4]) → 10', fn: 'sumNested', input: [[1, [2, 3], 4]], expected: 10 },
    { name: 'Глубокая вложенность: sumNested([[1, [2, [3]]]]) → 6', fn: 'sumNested', input: [[[1, [2, [3]]]]], expected: 6 },
    { name: 'Пустой массив: sumNested([]) → 0', fn: 'sumNested', input: [[]], expected: 0 },
    { name: 'Пустые вложенные массивы не мешают', fn: 'sumNested', input: [[1, [], [2, []]]], expected: 3 },
  ],
};
