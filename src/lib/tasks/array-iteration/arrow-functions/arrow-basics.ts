import type { AlgorithmTask } from '@/lib/runner/types';
export const arrowBasics: AlgorithmTask = {
  kind: 'algorithm', slug: 'arrow-basics', title: 'Стрелочный синтаксис', language: 'javascript',
  description: `Ступенька к «Фабрике множителей». Там стрелочная функция возвращает другую стрелочную функцию — а это сразу два новых понятия. Сначала разберёмся с самим синтаксисом.

Допишите три стрелочные функции:

- \`double(n)\` — умножает число на два;
- \`isEven(n)\` — возвращает \`true\` для чётного числа;
- \`fullName(first, last)\` — соединяет имя и фамилию через пробел.

Если тело функции — одно выражение, фигурные скобки и \`return\` можно убрать, и значение вернётся само:

\`\`\`js
const triple = (n) => n * 3;
\`\`\`

Это не украшательство: именно в таком виде функции обычно передают в \`map\` и \`filter\`, с которыми вы будете работать в следующем уроке.`,
  starterCode: `const double = (n) => {

};

const isEven = (n) => {

};

const fullName = (first, last) => {

};
`,
  tests: [
    { name: 'double(4) → 8', fn: 'double', input: [4], expected: 8 },
    { name: 'double(-3) → -6', fn: 'double', input: [-3], expected: -6 },
    { name: 'isEven(10) → true', fn: 'isEven', input: [10], expected: true },
    { name: 'isEven(7) → false', fn: 'isEven', input: [7], expected: false },
    { name: "fullName('Иван', 'Петров') → 'Иван Петров'", fn: 'fullName', input: ['Иван', 'Петров'], expected: 'Иван Петров' },
  ],
};
