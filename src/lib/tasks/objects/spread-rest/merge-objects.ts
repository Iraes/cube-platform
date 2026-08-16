import type { AlgorithmTask } from '@/lib/runner/types';

export const mergeObjects: AlgorithmTask = {
  kind: 'algorithm', slug: 'merge-objects', title: 'Объединение объектов', language: 'javascript',
  description: `Реализуйте \`merge(...objects)\`. Верните новый объект со свойствами всех аргументов. При совпадении ключей значение из более позднего объекта имеет приоритет.`,
  starterCode: `function merge(...objects) {

}
`,
  tests: [
    { name: 'Объединяет поля и учитывает приоритет', fn: 'merge', input: [{ name: 'John', age: 22 }, { age: 20, role: 'student' }, { role: 'developer', country: 'USA' }], expected: { name: 'John', age: 20, role: 'developer', country: 'USA' } },
    { name: 'Без аргументов возвращает пустой объект', fn: 'merge', input: [], expected: {} },
  ],
};
