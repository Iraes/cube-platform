import type { AlgorithmTask } from '@/lib/runner/types';
export const greetDefault: AlgorithmTask = {
  kind: 'algorithm', slug: 'greet-default', title: 'Параметр по умолчанию', language: 'javascript',
  description: `Разминка на функции. Реализуйте \`greet(name, greeting)\`, которая возвращает строку вида \`«Привет, Аня!»\`.

Второй параметр необязательный: если приветствие не передали, используйте \`'Привет'\`. Значение по умолчанию задаётся прямо в списке параметров — \`function greet(name, greeting = 'Привет')\`, отдельная проверка внутри не нужна.

Обратите внимание на разницу: не передали аргумент вовсе — сработает значение по умолчанию; передали \`undefined\` — тоже сработает; а вот пустая строка значением по умолчанию не заменяется.`,
  starterCode: `function greet(name, greeting) {

}
`,
  tests: [
    { name: "greet('Аня') → 'Привет, Аня!'", fn: 'greet', input: ['Аня'], expected: 'Привет, Аня!' },
    { name: "greet('Пётр', 'Здравствуй') → 'Здравствуй, Пётр!'", fn: 'greet', input: ['Пётр', 'Здравствуй'], expected: 'Здравствуй, Пётр!' },
    { name: "undefined включает значение по умолчанию", fn: 'greet', input: ['Ира', undefined], expected: 'Привет, Ира!' },
    { name: "Пустая строка — это переданное значение", fn: 'greet', input: ['Ира', ''], expected: ', Ира!' },
  ],
};
