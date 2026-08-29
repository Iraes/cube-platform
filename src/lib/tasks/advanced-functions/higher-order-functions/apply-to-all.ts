import type { AlgorithmTask } from '@/lib/runner/types';
export const applyToAll: AlgorithmTask = {
  kind: 'algorithm', slug: 'apply-to-all', title: 'Применить ко всем', language: 'javascript',
  description: `Ступенька к \`Partition\`. Соберите собственный аналог \`map\`.

Реализуйте \`applyToAll(values, callback)\`: пройдите по массиву, вызовите \`callback\` для каждого элемента и верните новый массив из результатов. Исходный массив изменять нельзя.

Главное здесь — увидеть, что функцию можно передать в другую функцию как обычное значение, а потом вызвать: \`callback(element)\`. Никакой магии, скобки после имени и есть вызов.

Служебную функцию \`checkApplyToAll\` не изменяйте: она подставляет разные колбэки, потому что саму функцию в проверку передать нельзя.`,
  starterCode: `function applyToAll(values, callback) {

}

function checkApplyToAll(values, mode) {
  const callback = mode === 'double'
    ? (value) => value * 2
    : (value) => String(value);
  return applyToAll(values, callback);
}
`,
  tests: [
    { name: 'Удвоение: [1, 2, 3] → [2, 4, 6]', fn: 'checkApplyToAll', input: [[1, 2, 3], 'double'], expected: [2, 4, 6] },
    { name: 'Другой колбэк — другой результат: [1, 2] → строки', fn: 'checkApplyToAll', input: [[1, 2], 'text'], expected: ['1', '2'] },
    { name: 'Пустой массив → пустой массив', fn: 'checkApplyToAll', input: [[], 'double'], expected: [] },
    { name: 'Отрицательные числа и ноль', fn: 'checkApplyToAll', input: [[-2, 0], 'double'], expected: [-4, 0] },
  ],
};
