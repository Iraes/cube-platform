import type { AlgorithmTask } from '@/lib/runner/types';

export const sumTwoNumbers: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'sum-two-numbers',
  title: 'Сумма двух чисел',
  language: 'javascript',
  description: `Разминка, чтобы освоиться с платформой.

Напишите функцию \`solution(a, b)\`, которая возвращает сумму двух чисел.

\`\`\`js
solution(2, 3);   // 5
solution(-4, 10); // 6
\`\`\`

Результат нужно **вернуть** через \`return\`, а не вывести в консоль. Впрочем, \`console.log\` внутри кода работает — вывод появится в панели справа, это удобно для отладки.`,
  starterCode: `function solution(a, b) {
  // верните сумму a и b
}
`,
  tests: [
    { name: 'solution(2, 3) === 5', input: [2, 3], expected: 5 },
    { name: 'solution(-4, 10) === 6', input: [-4, 10], expected: 6 },
    { name: 'solution(0, 0) === 0', input: [0, 0], expected: 0 },
    { name: 'Дробные числа: solution(1.5, 2.25) === 3.75', input: [1.5, 2.25], expected: 3.75 },
  ],
};
