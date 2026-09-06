import type { AlgorithmTask } from '@/lib/runner/types';

export const executionOrder: AlgorithmTask = {
  kind: 'algorithm', slug: 'execution-order', title: 'Порядок выполнения', language: 'javascript',
  description: `Ступенька к \`throttle\` и \`debounce\`. Обе построены на таймерах, и прежде чем ими управлять, полезно понять, когда код доходит до выполнения.

Реализуйте \`collectOrder(log)\` — четыре вызова \`log\`, записанные **строго в таком порядке**:

1. синхронный вызов со строкой \`'первая'\`;
2. \`Promise.resolve().then(...)\` со строкой \`'микрозадача'\`;
3. \`setTimeout(..., 0)\` со строкой \`'таймер'\`;
4. синхронный вызов со строкой \`'последняя'\`.

А теперь главное: записанный порядок и порядок выполнения — **разные вещи**. Сначала пройдёт весь синхронный код, поэтому \`'последняя'\` обгонит и микрозадачу, и таймер, хотя записана после них. Потом выполнится очередь микрозадач — это \`.then\` у промиса. И только в самом конце дойдёт очередь до \`setTimeout\`, даже с нулевой задержкой.

То есть \`setTimeout(fn, 0)\` означает не «выполнить немедленно», а «выполнить после всего, что уже стоит в очереди». Промис обгонит такой таймер, хотя записан раньше него.

Отсюда же и работает \`debounce\`: пока отложенный вызов ждёт своей очереди, его ещё можно отменить.

Служебные функции не изменяйте.`,
  starterCode: `function collectOrder(log) {

}

function runOrder() {
  const order = [];
  collectOrder((label) => order.push(label));
  return new Promise((resolve) => setTimeout(() => resolve(order), 20));
}

async function checkOrder() {
  return runOrder();
}

async function checkTimerIsLast() {
  const order = await runOrder();
  return { last: order[order.length - 1], count: order.length };
}

async function checkSyncFirst() {
  const order = await runOrder();
  return order.slice(0, 2);
}
`,
  tests: [
    {
      name: 'Итоговый порядок отличается от записанного',
      fn: 'checkOrder',
      input: [],
      expected: ['первая', 'последняя', 'микрозадача', 'таймер'],
    },
    {
      name: 'Синхронный код проходит целиком первым',
      fn: 'checkSyncFirst',
      input: [],
      expected: ['первая', 'последняя'],
    },
    {
      name: 'Таймер выполняется последним, всего четыре записи',
      fn: 'checkTimerIsLast',
      input: [],
      expected: { last: 'таймер', count: 4 },
    },
  ],
};
