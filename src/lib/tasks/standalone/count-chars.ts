import type { AlgorithmTask } from '@/lib/runner/types';

export const countChars: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'count-chars',
  title: 'Счётчик символов',
  language: 'javascript',
  description: `Напишите функцию \`solution(str)\`, которая считает, сколько раз каждый символ встречается в строке, и возвращает объект.

\`\`\`js
solution('abba');
// { a: 2, b: 2 }

solution('');
// {}
\`\`\`

Ключ объекта — символ, значение — количество повторений. Порядок ключей не важен: проверка сравнивает объекты **по содержимому**, а не по ссылке.

Для объекта удобны запись \`obj[key] = value\` и проверка \`obj[key] === undefined\`.`,
  starterCode: `function solution(str) {

}
`,
  tests: [
    { name: "solution('abba') → { a: 2, b: 2 }", input: ['abba'], expected: { a: 2, b: 2 } },
    {
      name: "solution('hello') → { h: 1, e: 1, l: 2, o: 1 }",
      input: ['hello'],
      expected: { h: 1, e: 1, l: 2, o: 1 },
    },
    { name: "Пустая строка: solution('') → {}", input: [''], expected: {} },
    {
      name: "Пробелы тоже считаются: solution('a a') → { a: 2, ' ': 1 }",
      input: ['a a'],
      expected: { a: 2, ' ': 1 },
    },
  ],
};
