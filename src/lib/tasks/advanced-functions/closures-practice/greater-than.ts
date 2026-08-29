import type { AlgorithmTask } from '@/lib/runner/types';
export const greaterThan: AlgorithmTask = {
  kind: 'algorithm', slug: 'greater-than', title: 'Фабрика предикатов', language: 'javascript',
  description: `Ступенька к \`Array Filters\`, где фабрик сразу три. Здесь одна.

Реализуйте \`greaterThan(limit)\`: она возвращает **функцию**, которая проверяет, больше ли её аргумент, чем \`limit\`. Такую функцию можно сразу отдать в \`filter\`:

\`\`\`js
[1, 5, 10].filter(greaterThan(4)); // [5, 10]
\`\`\`

Смысл фабрики в том, что \`limit\` запоминается один раз, а получившимся предикатом можно пользоваться сколько угодно. Внутри — то же замыкание, что и в счётчике, только вместо изменяемой переменной сохраняется переданный аргумент.

Граница не включается: значение, равное \`limit\`, не проходит.

Служебную функцию не изменяйте.`,
  starterCode: `function greaterThan(limit) {

}

function checkGreaterThan(values, limit) {
  return values.filter(greaterThan(limit));
}
`,
  tests: [
    { name: 'Отбор больших: [1, 5, 10] с границей 4 → [5, 10]', fn: 'checkGreaterThan', input: [[1, 5, 10], 4], expected: [5, 10] },
    { name: 'Граница не включается: [3, 4, 5] с границей 4 → [5]', fn: 'checkGreaterThan', input: [[3, 4, 5], 4], expected: [5] },
    { name: 'Никто не подошёл → []', fn: 'checkGreaterThan', input: [[1, 2], 5], expected: [] },
    { name: 'Отрицательная граница: [-5, 0, 2] с границей -1 → [0, 2]', fn: 'checkGreaterThan', input: [[-5, 0, 2], -1], expected: [0, 2] },
  ],
};
