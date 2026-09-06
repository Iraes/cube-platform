import type { AlgorithmTask } from '@/lib/runner/types';

export const promisesInSeries: AlgorithmTask = {
  kind: 'algorithm', slug: 'promises-in-series', title: 'Промисы последовательно', language: 'javascript',
  description: `Реализуйте \`promisesInSeries(asyncFns)\`. Вызывайте функции строго последовательно: следующая стартует только после завершения предыдущей и получает её результат. Верните промис с последним результатом. Вызов без аргумента должен разрешиться значением \`undefined\`.`,
  starterCode: `async function promisesInSeries(asyncFns = []) {

}

async function checkPromisesInSeries(steps) {
  const order = [];
  const functions = steps.map((step, index) => async (previous) => {
    order.push('start-' + index);
    await new Promise((resolve) => setTimeout(resolve, step.delay));
    order.push('end-' + index);
    return (previous ?? 0) + step.add;
  });
  const value = await promisesInSeries(functions);
  return { value, order };
}
`,
  tests: [
    { name: 'Передаёт результат и не запускает функции параллельно', fn: 'checkPromisesInSeries', input: [[{ add: 2, delay: 5 }, { add: 3, delay: 1 }, { add: 4, delay: 2 }]], expected: { value: 9, order: ['start-0', 'end-0', 'start-1', 'end-1', 'start-2', 'end-2'] } },
    { name: 'Пустая цепочка возвращает undefined', fn: 'promisesInSeries', input: [], expected: undefined },
  ],
};
