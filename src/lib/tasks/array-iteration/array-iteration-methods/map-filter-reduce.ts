import type { AlgorithmTask } from '@/lib/runner/types';
export const mapFilterReduce: AlgorithmTask = {
  kind: 'algorithm', slug: 'map-filter-reduce', title: 'map, filter, reduce', language: 'javascript',
  description: `Ступенька ко всем задачам этого урока. Три метода по отдельности, на числах — без объектов и полей.

- \`squares(values)\` — новый массив из квадратов, порядок сохраняется. Это \`map\`: столько же элементов, каждый преобразован.
- \`positives(values)\` — только числа больше нуля. Это \`filter\`: элементы не меняются, часть отсеивается.
- \`total(values)\` — сумма всех чисел. Это \`reduce\`: массив сворачивается в одно значение. Не забудьте начальное значение вторым аргументом, иначе на пустом массиве будет ошибка.

Все три возвращают новое значение и не трогают исходный массив — в отличие от \`sort\` и \`splice\`, которые меняют массив на месте.

Дальше эти же методы применяются к массивам объектов: \`map\` вытащит поле, \`filter\` отберёт по условию, \`reduce\` посчитает сумму цен.`,
  starterCode: `function squares(values) {

}

function positives(values) {

}

function total(values) {

}
`,
  tests: [
    { name: 'squares([1, 2, 3]) → [1, 4, 9]', fn: 'squares', input: [[1, 2, 3]], expected: [1, 4, 9] },
    { name: 'squares([]) → []', fn: 'squares', input: [[]], expected: [] },
    { name: 'positives([-1, 0, 5, 3]) → [5, 3]', fn: 'positives', input: [[-1, 0, 5, 3]], expected: [5, 3] },
    { name: 'Ноль не положительный: positives([0]) → []', fn: 'positives', input: [[0]], expected: [] },
    { name: 'total([1, 2, 3]) → 6', fn: 'total', input: [[1, 2, 3]], expected: 6 },
    { name: 'Пустой массив: total([]) → 0', fn: 'total', input: [[]], expected: 0 },
  ],
};
