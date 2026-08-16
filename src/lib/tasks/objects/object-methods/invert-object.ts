import type { AlgorithmTask } from '@/lib/runner/types';

export const invertObject: AlgorithmTask = {
  kind: 'algorithm', slug: 'invert-object', title: 'Инверсия объекта', language: 'javascript',
  description: `Реализуйте \`invert(obj)\`: создайте новый объект, поменяв местами ключи и значения исходного. Если значения повторяются, более поздняя пара должна перезаписать предыдущую. Исходный объект не изменяйте.`,
  starterCode: `function invert(obj) {

}
`,
  tests: [
    { name: 'Меняет местами ключи и значения', fn: 'invert', input: [{ a: 1, b: 2, c: 3 }], expected: { 1: 'a', 2: 'b', 3: 'c' } },
    { name: 'Последнее повторяющееся значение имеет приоритет', fn: 'invert', input: [{ first: 'same', second: 'same' }], expected: { same: 'second' } },
    { name: 'Пустой объект остаётся пустым', fn: 'invert', input: [{}], expected: {} },
  ],
};
