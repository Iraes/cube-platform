import type { AlgorithmTask } from '@/lib/runner/types';

export const throttleTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'throttle', title: 'Ограничение частоты вызовов', language: 'javascript',
  description: `Реализуйте \`throttle(fn, delay, now = Date.now)\`. Результирующая функция вызывает \`fn\` сразу, затем игнорирует попытки до истечения \`delay\`. Она обязана передавать исходные аргументы и \`this\`.

Третий аргумент — источник времени для детерминированных тестов. Вызывайте \`now()\` вместо прямого \`Date.now()\`; таймеры здесь не нужны.`,
  starterCode: `function throttle(fn, delay, now = Date.now) {

}

function checkThrottle(times, delay) {
  let time = 0;
  const calls = [];
  const wrapped = throttle(function (value) { calls.push(this.label + ':' + value); }, delay, () => time);
  for (const entry of times) {
    time = entry.time;
    wrapped.call({ label: entry.context }, entry.value);
  }
  return calls;
}
`,
  tests: [
    { name: 'Вызывает функцию не чаще заданного интервала', fn: 'checkThrottle', input: [[{ time: 0, context: 'x', value: 1 }, { time: 20, context: 'x', value: 2 }, { time: 50, context: 'x', value: 3 }, { time: 99, context: 'x', value: 4 }, { time: 100, context: 'x', value: 5 }], 50], expected: ['x:1', 'x:3', 'x:5'] },
    { name: 'Передаёт контекст и аргумент', fn: 'checkThrottle', input: [[{ time: 0, context: 'first', value: 'a' }, { time: 10, context: 'skip', value: 'b' }, { time: 30, context: 'second', value: 'c' }], 30], expected: ['first:a', 'second:c'] },
  ],
};
