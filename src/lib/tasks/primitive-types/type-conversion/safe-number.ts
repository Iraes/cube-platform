import type { AlgorithmTask } from '@/lib/runner/types';
export const safeNumber: AlgorithmTask = {
  kind: 'algorithm', slug: 'safe-number', title: 'Безопасное число', language: 'javascript',
  description: `Ступенька к \`defaultTo\`. Реализуйте \`safeNumber(value)\`: приведите значение к числу и верните его. Если приведение даёт \`NaN\`, верните \`0\`.

Пригодятся \`Number(value)\` и проверка \`Number.isNaN(...)\`. Обратите внимание: \`NaN\` — единственное значение в JavaScript, которое не равно самому себе, поэтому сравнение \`результат === NaN\` не работает.`,
  starterCode: `function safeNumber(value) {

}
`,
  tests: [
    { name: "safeNumber('42') → 42", fn: 'safeNumber', input: ['42'], expected: 42 },
    { name: "safeNumber('3.5') → 3.5", fn: 'safeNumber', input: ['3.5'], expected: 3.5 },
    { name: "Не число: safeNumber('привет') → 0", fn: 'safeNumber', input: ['привет'], expected: 0 },
    { name: 'safeNumber(undefined) → 0', fn: 'safeNumber', input: [undefined], expected: 0 },
    { name: 'safeNumber(true) → 1', fn: 'safeNumber', input: [true], expected: 1 },
  ],
};
