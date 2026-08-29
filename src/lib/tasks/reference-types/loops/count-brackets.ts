import type { AlgorithmTask } from '@/lib/runner/types';
export const countBrackets: AlgorithmTask = {
  kind: 'algorithm', slug: 'count-brackets', title: 'Баланс скобок: счёт', language: 'javascript',
  description: `Ступенька к задаче \`Are Brackets Balanced\`. Пока ничего не проверяем — только считаем.

Реализуйте \`countBrackets(str)\`: пройдите строку циклом и верните разницу между числом открывающих и закрывающих скобок. Открывающая прибавляет единицу, закрывающая — вычитает.

\`\`\`js
countBrackets('(())'); // 0 — сколько открыли, столько и закрыли
countBrackets('((('); // 3 — три остались незакрытыми
countBrackets('())'); // -1 — закрыли лишнюю
\`\`\`

Это половина решения задачи про баланс. Там к этому счётчику добавится всего одно правило: он ни в какой момент не должен уходить в минус.`,
  starterCode: `function countBrackets(str) {

}
`,
  tests: [
    { name: "countBrackets('(())') → 0", fn: 'countBrackets', input: ['(())'], expected: 0 },
    { name: "countBrackets('(((') → 3", fn: 'countBrackets', input: ['((('], expected: 3 },
    { name: "countBrackets('())') → -1", fn: 'countBrackets', input: ['())'], expected: -1 },
    { name: "Пустая строка: countBrackets('') → 0", fn: 'countBrackets', input: [''], expected: 0 },
    { name: "Скобки вперемешку: countBrackets('()(()') → 1", fn: 'countBrackets', input: ['()(()'], expected: 1 },
  ],
};
