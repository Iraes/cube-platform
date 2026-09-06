import type { AlgorithmTask } from '@/lib/runner/types';

export const sumAsync: AlgorithmTask = {
  kind: 'algorithm', slug: 'sum-async', title: 'Два await подряд', language: 'javascript',
  description: `Ступенька к задачам про повышение зарплат. Тот же приём, но на двух числах.

Реализуйте \`sumAsync(api)\`: получите два числа через \`api.getFirst()\` и \`api.getSecond()\` — обе возвращают промисы — и верните их сумму.

\`await\` разворачивает промис: слева от него оказывается уже значение, а не промис. Работает он только внутри \`async\`-функции, и такая функция всегда возвращает промис — даже если внутри вы пишете \`return a + b\`.

Частая ошибка новичка — забыть \`await\` и сложить сами промисы. Результатом будет строка вроде \`[object Promise][object Promise]\`, а не число: последняя проверка ловит именно это.

Обратите внимание на порядок: два \`await\` подряд выполняются **последовательно**, второй запрос стартует после первого. Здесь это неважно, но в задаче про зарплаты станет важным.`,
  starterCode: `async function sumAsync(api) {

}

async function checkSumAsync(first, second, delay) {
  const api = {
    getFirst: () => new Promise((resolve) => setTimeout(() => resolve(first), delay)),
    getSecond: () => new Promise((resolve) => setTimeout(() => resolve(second), delay)),
  };
  const result = await sumAsync(api);
  return { result, type: typeof result };
}
`,
  tests: [
    { name: 'Складывает два полученных числа', fn: 'checkSumAsync', input: [2, 3, 3], expected: { result: 5, type: 'number' } },
    { name: 'Работает с отрицательными', fn: 'checkSumAsync', input: [-10, 4, 1], expected: { result: -6, type: 'number' } },
    { name: 'Нули складываются в ноль', fn: 'checkSumAsync', input: [0, 0, 1], expected: { result: 0, type: 'number' } },
    { name: 'Результат — число, а не склейка промисов', fn: 'checkSumAsync', input: [7, 8, 2], expected: { result: 15, type: 'number' } },
  ],
};
