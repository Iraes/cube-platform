import type { AlgorithmTask } from '@/lib/runner/types';
export const balancedBrackets: AlgorithmTask = {
  kind: 'algorithm', slug: 'balanced-brackets', title: 'Are Brackets Balanced', language: 'javascript',
  description: `Реализуйте \`areBracketsBalanced(str)\` для строки из круглых скобок. Каждой открывающей скобке должна соответствовать закрывающая, а закрывающая не может идти раньше открывающей. Пустая строка корректна.`,
  starterCode: `function areBracketsBalanced(str) {

}
`,
  tests: [
    { name: 'Пустая строка корректна', fn: 'areBracketsBalanced', input: [''], expected: true },
    { name: 'Вложенные и соседние пары корректны', fn: 'areBracketsBalanced', input: ['(())()'], expected: true },
    { name: 'Закрывающая раньше открывающей', fn: 'areBracketsBalanced', input: [')('], expected: false },
    { name: 'Незакрытая скобка', fn: 'areBracketsBalanced', input: ['(()'], expected: false },
  ],
};
