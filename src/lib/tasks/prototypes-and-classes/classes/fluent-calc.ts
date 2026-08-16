import type { AlgorithmTask } from '@/lib/runner/types';

export const fluentCalc: AlgorithmTask = {
  kind: 'algorithm', slug: 'fluent-calc', title: 'Неизменяемый калькулятор', language: 'javascript',
  description: `Реализуйте класс \`Calc\` с методами \`add(value)\`, \`sub(value)\` и \`result()\`. Начальное значение конструктора по умолчанию равно нулю.

\`add\` и \`sub\` должны поддерживать цепочки вызовов и возвращать **новый** экземпляр \`Calc\`, не изменяя предыдущий.`,
  starterCode: `class Calc {

}

function checkCalc(initial = 0) {
  const base = new Calc(initial);
  const tenMore = base.add(10);
  return {
    base: base.result(),
    tenMore: tenMore.result(),
    chained: tenMore.sub(5).add(2).result(),
    immutable: base !== tenMore && base.result() === initial,
  };
}
`,
  tests: [
    { name: 'Поддерживает цепочки без мутации', fn: 'checkCalc', input: [], expected: { base: 0, tenMore: 10, chained: 7, immutable: true } },
    { name: 'Принимает начальное значение', fn: 'checkCalc', input: [5], expected: { base: 5, tenMore: 15, chained: 12, immutable: true } },
  ],
};
