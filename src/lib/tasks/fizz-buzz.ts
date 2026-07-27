import type { AlgorithmTask } from '@/lib/runner/types';

export const fizzBuzz: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'fizz-buzz',
  title: 'FizzBuzz',
  language: 'javascript',
  description: `Классическая задача с собеседований — проверяет аккуратность в условиях.

Напишите функцию \`solution(n)\`, которая возвращает массив из \`n\` элементов для чисел от 1 до \`n\`. Для каждого числа:

- если делится и на 3, и на 5 — строка \`'FizzBuzz'\`;
- если делится только на 3 — строка \`'Fizz'\`;
- если делится только на 5 — строка \`'Buzz'\`;
- иначе — само число (именно число, не строка).

\`\`\`js
solution(5);  // [1, 2, 'Fizz', 4, 'Buzz']
solution(15); // [..., 13, 14, 'FizzBuzz']
\`\`\`

Порядок проверок важен: подумайте, какое условие должно идти первым.`,
  starterCode: `function solution(n) {

}
`,
  tests: [
    {
      name: "solution(5) → [1, 2, 'Fizz', 4, 'Buzz']",
      input: [5],
      expected: [1, 2, 'Fizz', 4, 'Buzz'],
    },
    {
      name: "solution(15) заканчивается на 'FizzBuzz'",
      input: [15],
      expected: [
        1,
        2,
        'Fizz',
        4,
        'Buzz',
        'Fizz',
        7,
        8,
        'Fizz',
        'Buzz',
        11,
        'Fizz',
        13,
        14,
        'FizzBuzz',
      ],
    },
    { name: 'solution(1) → [1]', input: [1], expected: [1] },
    { name: 'solution(0) → []', input: [0], expected: [] },
  ],
};
