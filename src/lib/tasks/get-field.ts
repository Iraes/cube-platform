import type { AlgorithmTask } from '@/lib/runner/types';
export const getField: AlgorithmTask = {
  kind: 'algorithm', slug: 'get-field', title: 'Get Field', language: 'javascript',
  description: `Реализуйте \`getField(data, field)\`. Функция принимает массив объектов и строку-ключ, а возвращает новый массив значений этого поля.

Если поля в объекте нет, в результате должен быть \`undefined\`. Если массив не передан, верните пустой массив.`,
  starterCode: `function getField(data, field) {

}
`,
  tests: [
    { name: 'Возвращает значения выбранного поля', fn: 'getField', input: [[{ name: 'Denis', age: 25 }, { name: 'Ivan' }, { name: 'Ann', age: 18 }], 'age'], expected: [25, undefined, 18] },
    { name: 'Другой ключ', fn: 'getField', input: [[{ name: 'Denis' }, { name: 'Ann' }], 'name'], expected: ['Denis', 'Ann'] },
    { name: 'Массив не передан → []', fn: 'getField', input: [undefined, 'age'], expected: [] },
  ],
};
