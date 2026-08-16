import type { AlgorithmTask } from '@/lib/runner/types';

export const capitalize: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'capitalize',
  title: 'Capitalize',
  language: 'javascript',
  description: `Реализуйте функцию \`capitalize(str)\`, которая принимает строку и возвращает новую строку, где первая буква каждого слова заглавная, а все остальные — строчные.

Пример:
\`\`\`js
const str = 'sOme RanDoM sTRING';
capitalize(str); // 'Some Random String'
\`\`\`

Слова разделены пробелами. Пригодятся \`toUpperCase\`, \`toLowerCase\` и \`slice\`.`,
  starterCode: `function capitalize(str) {

}
`,
  tests: [
    {
      name: "capitalize('sOme RanDoM sTRING') → 'Some Random String'",
      fn: 'capitalize',
      input: ['sOme RanDoM sTRING'],
      expected: 'Some Random String',
    },
    {
      name: "capitalize('строка с ЗАГЛАВНЫМИ') → 'Строка С Заглавными'",
      fn: 'capitalize',
      input: ['строка с ЗАГЛАВНЫМИ'],
      expected: 'Строка С Заглавными',
    },
    { name: "Одно слово: capitalize('hello') → 'Hello'", fn: 'capitalize', input: ['hello'], expected: 'Hello' },
    { name: "Пустая строка: capitalize('') → ''", fn: 'capitalize', input: [''], expected: '' },
  ],
};
