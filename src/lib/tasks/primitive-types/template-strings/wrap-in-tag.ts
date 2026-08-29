import type { AlgorithmTask } from '@/lib/runner/types';
export const wrapInTag: AlgorithmTask = {
  kind: 'algorithm', slug: 'wrap-in-tag', title: 'Обернуть в тег', language: 'javascript',
  description: `Ступенька к задаче \`Wrap in paragraph\`. Реализуйте \`wrapInTag(tag, text)\`: верните текст, обёрнутый в указанный тег.

Собирать строку сложением кавычек и плюсов неудобно и легко ошибиться. Шаблонная строка в обратных апострофах читается куда лучше — значение подставляется через \`\${...}\`:

\`\`\`js
wrapInTag('p', 'Привет'); // '<p>Привет</p>'
wrapInTag('h1', 'Заголовок'); // '<h1>Заголовок</h1>'
\`\`\`

Дальше останется применить это к каждой строке текста.`,
  starterCode: `function wrapInTag(tag, text) {

}
`,
  tests: [
    { name: "wrapInTag('p', 'Привет') → '<p>Привет</p>'", fn: 'wrapInTag', input: ['p', 'Привет'], expected: '<p>Привет</p>' },
    { name: "wrapInTag('h1', 'Заголовок') → '<h1>Заголовок</h1>'", fn: 'wrapInTag', input: ['h1', 'Заголовок'], expected: '<h1>Заголовок</h1>' },
    { name: "Пустой текст: wrapInTag('span', '') → '<span></span>'", fn: 'wrapInTag', input: ['span', ''], expected: '<span></span>' },
    { name: "Пробелы внутри сохраняются", fn: 'wrapInTag', input: ['p', 'два слова'], expected: '<p>два слова</p>' },
  ],
};
