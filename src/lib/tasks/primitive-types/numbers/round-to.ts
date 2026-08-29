import type { AlgorithmTask } from '@/lib/runner/types';
export const roundTo: AlgorithmTask = {
  kind: 'algorithm', slug: 'round-to', title: 'Округление до знака', language: 'javascript',
  description: `Ступенька к \`compareWithPrecision\`. Реализуйте \`roundTo(value, digits)\` — округлите число до \`digits\` знаков после запятой и верните **число**, а не строку.

Метод \`toFixed(digits)\` округляет, но возвращает строку — её нужно превратить обратно в число.

Последняя проверка показывает, зачем это нужно: \`0.1 + 0.2\` в JavaScript даёт \`0.30000000000000004\`, потому что дробные числа хранятся в двоичном виде и часть значений в него не укладывается точно. Именно из-за этого дальше понадобится сравнение с погрешностью.`,
  starterCode: `function roundTo(value, digits) {

}
`,
  tests: [
    { name: 'roundTo(3.14159, 2) → 3.14', fn: 'roundTo', input: [3.14159, 2], expected: 3.14 },
    { name: 'roundTo(10.5678, 1) → 10.6', fn: 'roundTo', input: [10.5678, 1], expected: 10.6 },
    { name: 'Целое остаётся целым: roundTo(7, 2) → 7', fn: 'roundTo', input: [7, 2], expected: 7 },
    { name: 'roundTo(0.1 + 0.2, 2) → 0.3', fn: 'roundTo', input: [0.1 + 0.2, 2], expected: 0.3 },
    { name: 'Возвращается число, а не строка', fn: 'roundTo', input: [2.5, 0], expected: 3 },
  ],
};
