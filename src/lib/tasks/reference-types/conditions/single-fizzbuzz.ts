import type { AlgorithmTask } from '@/lib/runner/types';
export const singleFizzBuzz: AlgorithmTask = {
  kind: 'algorithm', slug: 'single-fizzbuzz', title: 'FizzBuzz: одно число', language: 'javascript',
  description: `Реализуйте \`fizzbuzz(number)\`. Верните \`'Fizz'\`, если число кратно 3; \`'Buzz'\`, если кратно 5; \`'FizzBuzz'\`, если кратно обоим. В остальных случаях верните исходное число.`,
  starterCode: `function fizzbuzz(number) {

}
`,
  tests: [
    { name: '3 → Fizz', fn: 'fizzbuzz', input: [3], expected: 'Fizz' },
    { name: '10 → Buzz', fn: 'fizzbuzz', input: [10], expected: 'Buzz' },
    { name: '15 → FizzBuzz', fn: 'fizzbuzz', input: [15], expected: 'FizzBuzz' },
    { name: '7 → 7', fn: 'fizzbuzz', input: [7], expected: 7 },
  ],
};
