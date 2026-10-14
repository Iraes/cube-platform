import type { AlgorithmTask } from '@/lib/runner/types';

export const promiseChainsOrder: AlgorithmTask = {
  kind: 'algorithm', slug: 'promise-chains-order', title: 'Две цепочки промисов', language: 'javascript',
  description: `Задача про то, как ведут себя две независимые цепочки промисов, запущенные рядом. Сначала предскажите ответ на бумаге и только потом запускайте: весь смысл в расхождении между тем, что вы ожидали, и тем, что вышло.

Перед вами код:

\`\`\`js
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
  .catch(() => console.log(3))
  .then(() => console.log(4))

Promise.reject()
  .then(() => console.log(5))
  .then(() => console.log(6))
  .catch(() => console.log(7))
  .then(() => console.log(8))
\`\`\`

Соберите эти цепочки четырьмя функциями. Вместо \`console.log(n)\` вызывайте переданный \`log(n)\` — так проверка увидит порядок.

- \`resolvedChain(log)\` — только первая цепочка, от \`Promise.resolve()\`;
- \`rejectedChain(log)\` — только вторая, от \`Promise.reject()\`;
- \`bothChains(log)\` — обе сразу и в том же порядке: сначала первая, потом вторая;
- \`withoutCatch(log)\` — первая цепочка **без** звена \`.catch\`, то есть только \`1\`, \`2\` и \`4\`.

Три вещи, которые эта задача показывает:

- \`.catch\` в цепочке, где ничего не упало, обработчик не вызывает — значение проходит сквозь него дальше;
- \`.then\` на отклонённом промисе тоже ничего не вызывает — отказ идёт сквозь него до ближайшего \`.catch\`;
- и самое неожиданное: **звено, которое ничего не сделало, всё равно стоит шага.** Последняя проверка показывает это в лоб — уберите из первой цепочки один \`.catch\`, который и так не срабатывал, и порядок вывода изменится.

Почему именно так — разобрано в уроке, в разделе «⭐ Под капотом».

Служебные функции не изменяйте.`,
  starterCode: `function resolvedChain(log) {

}

function rejectedChain(log) {

}

function bothChains(log) {

}

function withoutCatch(log) {

}

/**
 * Собирает порядок вызовов log. Ответ отдаём из setTimeout: это макрозадача,
 * а значит к моменту её выполнения очередь микрозадач уже опустела
 * и цепочки точно досчитали до конца.
 */
function collect(build) {
  const order = [];
  build((value) => order.push(value));
  return new Promise((resolve) => setTimeout(() => resolve(order), 25));
}

async function checkResolved() {
  return collect(resolvedChain);
}

async function checkRejected() {
  return collect(rejectedChain);
}

async function checkBoth() {
  return collect(bothChains);
}

async function checkWithoutCatch() {
  return collect((log) => {
    withoutCatch(log);
    rejectedChain(log);
  });
}
`,
  tests: [
    {
      name: 'Успешная цепочка: .catch пропущен, значение прошло мимо него',
      fn: 'checkResolved',
      input: [],
      expected: [1, 2, 4],
    },
    {
      name: 'Отклонённая цепочка: оба .then пропущены, отказ поймал .catch',
      fn: 'checkRejected',
      input: [],
      expected: [7, 8],
    },
    {
      name: 'Две цепочки идут шаг в шаг, а не одна после другой',
      fn: 'checkBoth',
      input: [],
      expected: [1, 2, 7, 4, 8],
    },
    {
      name: 'Звено стоит шага: без лишнего .catch порядок уже другой',
      fn: 'checkWithoutCatch',
      input: [],
      expected: [1, 2, 4, 7, 8],
    },
  ],
};
