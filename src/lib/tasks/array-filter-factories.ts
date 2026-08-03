import type { AlgorithmTask } from '@/lib/runner/types';
export const arrayFilterFactories: AlgorithmTask = {
  kind: 'algorithm', slug: 'array-filter-factories', title: 'Array Filters', language: 'javascript',
  description: `Реализуйте фабрики предикатов для \`Array.prototype.filter\`:

- \`inRange(a, b)\` — значение после приведения к числу находится между границами включительно; если \`a > b\`, всегда \`false\`;
- \`inArray(values)\` — значение есть в массиве;
- \`notInArray(values)\` — значения нет в массиве.

Служебную функцию \`checkFilter\` не изменяйте.`,
  starterCode: `function inRange(a, b) {

}

function inArray(values) {

}

function notInArray(values) {

}

function checkFilter(array, kind, args) {
  const predicate = kind === 'range'
    ? inRange(args[0], args[1])
    : kind === 'in'
      ? inArray(args)
      : notInArray(args);
  return array.filter(predicate);
}
`,
  tests: [
    { name: 'inRange выбирает значения между 3 и 6', fn: 'checkFilter', input: [[1, 2, 3, 4, 5, 6, 7, true], 'range', [3, 6]], expected: [3, 4, 5, 6] },
    { name: 'inArray сохраняет найденные значения', fn: 'checkFilter', input: [[1, 2, 3, undefined], 'in', [1, 2, 10, undefined]], expected: [1, 2, undefined] },
    { name: 'notInArray исключает найденные значения', fn: 'checkFilter', input: [[1, 2, 3, 4], 'notIn', [1, 3]], expected: [2, 4] },
    { name: 'Обратный диапазон всегда пуст', fn: 'checkFilter', input: [[1, 2, 3], 'range', [5, 2]], expected: [] },
  ],
};
