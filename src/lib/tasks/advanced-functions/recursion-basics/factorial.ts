import type { AlgorithmTask } from '@/lib/runner/types';
export const factorial: AlgorithmTask = {
  kind: 'algorithm', slug: 'factorial', title: 'Факториал', language: 'javascript',
  description: `Первая рекурсия — на самом простом примере. Реализуйте \`factorial(n)\`: произведение всех целых от 1 до \`n\`. Факториал нуля равен единице.

У любой рекурсивной функции две части, и писать их удобно именно в таком порядке:

1. **База** — случай, когда ответ известен сразу и вызывать себя не нужно. Здесь это \`n <= 1\`, ответ \`1\`.
2. **Шаг** — сведение задачи к такой же, но поменьше. Здесь это \`n * factorial(n - 1)\`.

Без базы функция вызывала бы себя бесконечно, и платформа оборвала бы выполнение по таймауту. Если так случилось — проверьте, что база написана и что шаг действительно уменьшает \`n\`.

Разберётесь здесь — \`sequenceSum\` устроена так же: только вместо умножения сложение, а база другая.`,
  starterCode: `function factorial(n) {

}
`,
  tests: [
    { name: 'factorial(5) → 120', fn: 'factorial', input: [5], expected: 120 },
    { name: 'factorial(3) → 6', fn: 'factorial', input: [3], expected: 6 },
    { name: 'База: factorial(1) → 1', fn: 'factorial', input: [1], expected: 1 },
    { name: 'Факториал нуля: factorial(0) → 1', fn: 'factorial', input: [0], expected: 1 },
    { name: 'factorial(10) → 3628800', fn: 'factorial', input: [10], expected: 3628800 },
  ],
};
