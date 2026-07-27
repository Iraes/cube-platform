import type { AlgorithmTask } from '@/lib/runner/types';

export const filterEven: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'filter-even',
  title: 'Только чётные',
  language: 'javascript',
  description: `Напишите функцию \`solution(numbers)\`, которая принимает массив чисел и возвращает **новый массив** только из чётных чисел, сохраняя исходный порядок.

\`\`\`js
solution([1, 2, 3, 4, 5, 6]); // [2, 4, 6]
solution([1, 3, 5]);          // []
\`\`\`

Число чётное, если остаток от деления на 2 равен нулю: \`n % 2 === 0\`.

Исходный массив изменять не нужно — верните новый. Проверка сравнивает массивы **по содержимому**, а не по ссылке.`,
  starterCode: `function solution(numbers) {

}
`,
  tests: [
    {
      name: 'solution([1, 2, 3, 4, 5, 6]) → [2, 4, 6]',
      input: [[1, 2, 3, 4, 5, 6]],
      expected: [2, 4, 6],
    },
    { name: 'Чётных нет: solution([1, 3, 5]) → []', input: [[1, 3, 5]], expected: [] },
    { name: 'Пустой массив: solution([]) → []', input: [[]], expected: [] },
    {
      name: 'Отрицательные и ноль: solution([-2, -1, 0, 7]) → [-2, 0]',
      input: [[-2, -1, 0, 7]],
      expected: [-2, 0],
    },
  ],
};
