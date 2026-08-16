import type { AlgorithmTask } from '@/lib/runner/types';
export const partitionTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'partition', title: 'Partition', language: 'javascript',
  description: `Реализуйте \`partition(array, callback)\`. Вызовите колбэк для каждого элемента и верните \`[trueArray, falseArray]\`: в первый массив попадают элементы с truthy-результатом, во второй — с falsey.

Если колбэк не передан, разделяйте сами элементы по их truthy/falsey. Исходный массив менять нельзя. Служебную функцию \`checkPartition\` не изменяйте — она адаптирует колбэки для проверок платформы.`,
  starterCode: `function partition(array, callback) {

}

function checkPartition(array, mode) {
  const callback = mode === 'greater3'
    ? (element) => element > 3
    : mode === 'active'
      ? (element) => element.active
      : undefined;
  return partition(array, callback);
}
`,
  tests: [
    { name: 'Разделяет числа по условию > 3', fn: 'checkPartition', input: [[1, 2, 3, 4, 5, 6], 'greater3'], expected: [[4, 5, 6], [1, 2, 3]] },
    { name: 'Без колбэка разделяет truthy и falsey', fn: 'checkPartition', input: [[0, 1, 2, {}, false, '', '0'], 'truthy'], expected: [[1, 2, {}, '0'], [0, false, '']] },
    { name: 'Работает с объектами', fn: 'checkPartition', input: [[{ user: 'fred', active: true }, { user: 'barney', active: false }], 'active'], expected: [[{ user: 'fred', active: true }], [{ user: 'barney', active: false }]] },
  ],
};
