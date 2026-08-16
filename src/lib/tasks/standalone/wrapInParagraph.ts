import type { AlgorithmTask } from '@/lib/runner/types';

export const wrapInParagraph: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'wrap-in-paragraph',
  title: 'Wrap in paragraph',
  language: 'javascript',
  description: `На входе текст, разделённый переносами строк. Напишите функцию \`wrapInParagraph(text)\`, которая оборачивает каждую строку в тег \`<p>\` и возвращает результат одной строкой.

Обратите внимание: лишних символов в результате быть не должно — ни пробелов, ни переносов между тегами. Только исходный текст и теги.

\`\`\`js
const text = \`Some
simple multiline
text\`;

wrapInParagraph(text);
// '<p>Some</p><p>simple multiline</p><p>text</p>'

wrapInParagraph('some\\ntext');
// '<p>some</p><p>text</p>'
\`\`\`

Пробелы внутри строки — часть текста, их трогать не нужно. Пустая строка на входе даёт \`<p></p>\`.

Пригодятся \`split\`, \`map\` и \`join\`.`,
  starterCode: `function wrapInParagraph(text) {

}
`,
  tests: [
    {
      name: "wrapInParagraph('Some\\nsimple multiline\\ntext') → '<p>Some</p><p>simple multiline</p><p>text</p>'",
      fn: 'wrapInParagraph',
      input: ['Some\nsimple multiline\ntext'],
      expected: '<p>Some</p><p>simple multiline</p><p>text</p>',
    },
    {
      name: "wrapInParagraph('some\\ntext') → '<p>some</p><p>text</p>'",
      fn: 'wrapInParagraph',
      input: ['some\ntext'],
      expected: '<p>some</p><p>text</p>',
    },
    {
      name: "Без переносов: wrapInParagraph('text') → '<p>text</p>'",
      fn: 'wrapInParagraph',
      input: ['text'],
      expected: '<p>text</p>',
    },
    {
      name: "Пробелы внутри строки сохраняются: wrapInParagraph('первая строка\\nвторая строка') → '<p>первая строка</p><p>вторая строка</p>'",
      fn: 'wrapInParagraph',
      input: ['первая строка\nвторая строка'],
      expected: '<p>первая строка</p><p>вторая строка</p>',
    },
    {
      name: "Пустая строка: wrapInParagraph('') → '<p></p>'",
      fn: 'wrapInParagraph',
      input: [''],
      expected: '<p></p>',
    },
  ],
};
