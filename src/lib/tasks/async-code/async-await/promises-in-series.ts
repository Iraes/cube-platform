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

// Пустой список и вызов без аргумента проверяем вместе с рабочей функцией:
// иначе «ничего не вернула» выглядело бы верным ответом
async function checkEmptyArray() {
  return {
    empty: await promisesInSeries([]),
    single: await promisesInSeries([async () => 'готово']),
  };
}

async function checkDefaultArgument() {
  return {
    withoutArgument: await promisesInSeries(),
    withOne: await promisesInSeries([async () => 42]),
  };
}
`,
  tests: [
    { name: 'Передаёт результат и не запускает функции параллельно', fn: 'checkPromisesInSeries', input: [[{ add: 2, delay: 5 }, { add: 3, delay: 1 }, { add: 4, delay: 2 }]], expected: { value: 9, order: ['start-0', 'end-0', 'start-1', 'end-1', 'start-2', 'end-2'] } },
    { name: 'Одна функция: результат передаётся наружу', fn: 'checkPromisesInSeries', input: [[{ add: 7, delay: 1 }]], expected: { value: 7, order: ['start-0', 'end-0'] } },
    { name: 'Порядок сохраняется, даже если первая функция медленнее', fn: 'checkPromisesInSeries', input: [[{ add: 1, delay: 8 }, { add: 1, delay: 1 }]], expected: { value: 2, order: ['start-0', 'end-0', 'start-1', 'end-1'] } },
    { name: 'Пустой массив функций → undefined, а одна функция всё же вызывается', fn: 'checkEmptyArray', input: [], expected: { empty: undefined, single: 'готово' } },
    { name: 'Вызов без аргумента → undefined, а переданная функция работает', fn: 'checkDefaultArgument', input: [], expected: { withoutArgument: undefined, withOne: 42 } },
  ],
};
