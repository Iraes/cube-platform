import type { AlgorithmTask } from '@/lib/runner/types';

export const debounceTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'debounce', title: 'Сбор серии вызовов', language: 'javascript',
  description: `Реализуйте \`debounce(fn, delay)\`. Каждый новый вызов отменяет прежний таймер. Исходная функция запускается один раз через \`delay\` после последней попытки и получает аргументы и \`this\` именно последнего вызова.`,
  starterCode: `function debounce(fn, delay) {

}

function checkDebounce(entries, delay) {
  return new Promise((resolve) => {
    const calls = [];
    const wrapped = debounce(function (value) { calls.push(this.label + ':' + value); }, delay);
    for (const entry of entries) {
      setTimeout(() => wrapped.call({ label: entry.context }, entry.value), entry.time);
    }
    const lastTime = entries.length ? entries[entries.length - 1].time : 0;
    setTimeout(() => resolve(calls), lastTime + delay + 20);
  });
}
`,
  tests: [
    { name: 'Оставляет только последний вызов серии', fn: 'checkDebounce', input: [[{ time: 0, context: 'a', value: 1 }, { time: 5, context: 'b', value: 2 }, { time: 10, context: 'last', value: 3 }], 15], expected: ['last:3'] },
    { name: 'Передаёт контекст и аргумент', fn: 'checkDebounce', input: [[{ time: 0, context: 'card', value: 'save' }], 10], expected: ['card:save'] },
  ],
};
