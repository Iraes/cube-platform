import type { AlgorithmTask } from '@/lib/runner/types';
export const onceTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'once', title: 'Once', language: 'javascript',
  description: `Реализуйте \`once(fn)\`, которая возвращает новую функцию. При первом вызове она вызывает \`fn\` и возвращает её результат, а повторные вызовы не дают эффекта.

Служебную функцию \`checkOnce\` не изменяйте: она позволяет платформе проверить несколько вызовов одной и той же функции.`,
  starterCode: `function once(fn) {

}

function checkOnce(values) {
  const calls = [];
  const wrapped = once((value) => {
    calls.push(value);
    return value * 2;
  });
  const results = values.map((value) => wrapped(value));
  return { calls, results };
}
`,
  tests: [
    { name: 'Исходная функция вызывается только один раз', fn: 'checkOnce', input: [[2, 4, 6]], expected: { calls: [2], results: [4, undefined, undefined] } },
    { name: 'Первый вызов может получить ноль', fn: 'checkOnce', input: [[0, 1]], expected: { calls: [0], results: [0, undefined] } },
  ],
};
