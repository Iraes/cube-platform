import type { AlgorithmTask } from '@/lib/runner/types';
export const calculatePrice: AlgorithmTask = {
  kind: 'algorithm', slug: 'calculate-price', title: 'Calculate Price', language: 'javascript',
  description: `Реализуйте \`calculatePrice(orders)\`, которая возвращает сумму числовых полей \`price\` всех заказов. Для пустого массива или отсутствующего аргумента верните \`0\`.`,
  starterCode: `function calculatePrice(orders) {

}
`,
  tests: [
    { name: 'Суммирует стоимость заказов', fn: 'calculatePrice', input: [[{ type: 'food', price: 130 }, { type: 'clothes', price: 7300 }, { type: 'other', price: 1400 }]], expected: 8830 },
    { name: 'Пустой массив → 0', fn: 'calculatePrice', input: [[]], expected: 0 },
    { name: 'Нет аргумента → 0', fn: 'calculatePrice', input: [undefined], expected: 0 },
  ],
};
