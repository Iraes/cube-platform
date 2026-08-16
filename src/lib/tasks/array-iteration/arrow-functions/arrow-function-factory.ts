import type { AlgorithmTask } from '@/lib/runner/types';

export const arrowFunctionFactory: AlgorithmTask = {
  kind: 'algorithm', slug: 'arrow-function-factory', title: 'Фабрика множителей', language: 'javascript',
  description: `Напишите стрелочную функцию \`makeMultiplier(multiplier)\`. Она должна вернуть другую стрелочную функцию, которая принимает число и умножает его на сохранённый \`multiplier\`.

Пример: \`makeMultiplier(3)(5) // 15\`. Служебную функцию проверки не изменяйте.`,
  starterCode: `const makeMultiplier = (multiplier) => {

};

function checkMultiplier(multiplier, values) {
  const multiply = makeMultiplier(multiplier);
  return {
    values: values.map(multiply),
    returnsFunction: typeof multiply === 'function',
    usesArrowSyntax: multiply.toString().includes('=>'),
  };
}
`,
  tests: [
    { name: 'Создаёт стрелочную функцию с сохранённым множителем', fn: 'checkMultiplier', input: [3, [1, 2, 5]], expected: { values: [3, 6, 15], returnsFunction: true, usesArrowSyntax: true } },
    { name: 'Каждый вызов создаёт независимую функцию', fn: 'checkMultiplier', input: [-2, [0, 4]], expected: { values: [0, -8], returnsFunction: true, usesArrowSyntax: true } },
  ],
};
