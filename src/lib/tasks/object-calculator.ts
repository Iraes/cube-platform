import type { AlgorithmTask } from '@/lib/runner/types';
export const objectCalculator: AlgorithmTask = {
  kind: 'algorithm', slug: 'object-calculator', title: 'Object Calculator', language: 'javascript',
  description: `Реализуйте \`createObjectCalculator(initialA, initialB)\`. Функция возвращает объект с методами:

- \`read(a, b)\` сохраняет новые значения в свойства объекта;
- \`sum()\` возвращает сумму сохранённых значений;
- \`mul()\` возвращает произведение.

Используйте \`this\`. Служебную функцию \`checkCalculator\` не изменяйте.`,
  starterCode: `function createObjectCalculator(initialA, initialB) {

}

function checkCalculator(initialA, initialB, nextA, nextB) {
  const calculator = createObjectCalculator(initialA, initialB);
  const before = [calculator.sum(), calculator.mul()];
  calculator.read(nextA, nextB);
  return { before, after: [calculator.sum(), calculator.mul()] };
}
`,
  tests: [
    { name: 'Считает с начальными и обновлёнными значениями', fn: 'checkCalculator', input: [2, 3, 12, 34], expected: { before: [5, 6], after: [46, 408] } },
    { name: 'Работает с нулём и отрицательными числами', fn: 'checkCalculator', input: [0, 5, -2, 4], expected: { before: [5, 0], after: [2, -8] } },
  ],
};
