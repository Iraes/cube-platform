import type { AlgorithmTask } from '@/lib/runner/types';

export const reverseString: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'reverse-string',
  title: 'Перевернуть строку',
  language: 'javascript',
  description: `Напишите функцию \`solution(str)\`, которая возвращает строку, записанную задом наперёд.

\`\`\`js
solution('привет'); // 'тевирп'
solution('abc');    // 'cba'
\`\`\`

Подсказка: строку можно разложить в массив символов, перевернуть его и склеить обратно — методами \`split\`, \`reverse\` и \`join\`.

Пустая строка должна остаться пустой.`,
  starterCode: `function solution(str) {

}
`,
  tests: [
    { name: "solution('привет') === 'тевирп'", input: ['привет'], expected: 'тевирп' },
    { name: "solution('abc') === 'cba'", input: ['abc'], expected: 'cba' },
    { name: "Один символ: solution('a') === 'a'", input: ['a'], expected: 'a' },
    { name: "Пустая строка: solution('') === ''", input: [''], expected: '' },
  ],
};
