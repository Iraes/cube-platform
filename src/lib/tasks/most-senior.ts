import type { AlgorithmTask } from '@/lib/runner/types';
export const mostSenior: AlgorithmTask = {
  kind: 'algorithm', slug: 'most-senior', title: 'Get Most Senior', language: 'javascript',
  description: `Реализуйте \`getMostSenior(humans)\`. Верните массив людей с максимальным значением поля \`age\`. Если максимальный возраст встречается несколько раз, включите всех таких людей, сохранив исходный порядок.`,
  starterCode: `function getMostSenior(humans) {

}
`,
  tests: [
    { name: 'Возвращает всех людей максимального возраста', fn: 'getMostSenior', input: [[{ name: 'Gabriel', age: 49 }, { name: 'Odval', age: 38 }, { name: 'Emilija', age: 19 }, { name: 'Sou', age: 49 }]], expected: [{ name: 'Gabriel', age: 49 }, { name: 'Sou', age: 49 }] },
    { name: 'Один самый старший человек', fn: 'getMostSenior', input: [[{ name: 'A', age: 20 }, { name: 'B', age: 30 }]], expected: [{ name: 'B', age: 30 }] },
  ],
};
