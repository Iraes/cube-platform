import type { AlgorithmTask } from '@/lib/runner/types';

export const stopGninnipsMySdrow: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'stop-gninnipS-My-sdroW',
  title: 'Stop gninnipS My sdroW!',
  language: 'javascript',
  description: `Реализуйте функцию, которая принимает строку в качестве аргумента и возвращает новую строку, в которой каждое слово, которое содержит 5 или больше символов, написана наоборот.

Примеры:
\`\`\`js
solution('Hey fellow warriors'); // Hey wollef sroirraw
solution('This is a test'); // This is a test
solution('This is another test'); // This is rehtona test
\`\`\`
`,
  starterCode: `function solution(str) {

}
`,
  tests: [
    { name: "solution('Hey fellow warriors') === 'Hey wollef sroirraw'", input: ['Hey fellow warriors'], expected: 'Hey wollef sroirraw' },
    { name: "solution('This is a test') === 'This is a test'", input: ['This is a test'], expected: 'This is a test' },
    { name: "solution('This is another test') === 'This is rehtona test'", input: ['This is another test'], expected: 'This is rehtona test' },
  ],
};
