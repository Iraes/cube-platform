import type { AlgorithmTask } from '@/lib/runner/types';
export const sequenceSum: AlgorithmTask = {
  kind: 'algorithm', slug: 'sequence-sum', title: 'Sequence Sum', language: 'javascript',
  description: `Реализуйте **с использованием рекурсии** функцию \`sequenceSum(begin, end)\`, которая возвращает сумму всех целых чисел от \`begin\` до \`end\` включительно.

Если \`begin > end\`, верните \`NaN\`. Если границы равны, верните это единственное число. Рекурсивно вызывайте именно \`sequenceSum\`.`,
  starterCode: `function sequenceSum(begin, end) {

}
`,
  tests: [
    { name: 'sequenceSum(1, 5) → 15', fn: 'sequenceSum', input: [1, 5], expected: 15 },
    { name: 'sequenceSum(4, 10) → 49', fn: 'sequenceSum', input: [4, 10], expected: 49 },
    { name: 'sequenceSum(-3, 2) → -3', fn: 'sequenceSum', input: [-3, 2], expected: -3 },
    { name: 'Пустая последовательность → NaN', fn: 'sequenceSum', input: [7, 2], expected: Number.NaN },
    { name: 'Одна граница → само число', fn: 'sequenceSum', input: [6, 6], expected: 6 },
  ],
};
