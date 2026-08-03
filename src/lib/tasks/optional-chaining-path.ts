import type { AlgorithmTask } from '@/lib/runner/types';
export const optionalChainingPath: AlgorithmTask = {
  kind: 'algorithm', slug: 'optional-chaining-path', title: 'Optional Chaining', language: 'javascript',
  description: `Напишите \`optionalChaining(obj, chain)\`, где \`chain\` — массив имён свойств. Пройдите по цепочке и верните найденное значение. Если хотя бы одного свойства нет, верните \`undefined\`.

Постарайтесь решить задачу рекурсивно.`,
  starterCode: `function optionalChaining(obj, chain) {

}
`,
  tests: [
    { name: 'Возвращает значение по полной цепочке', fn: 'optionalChaining', input: [{ a: { b: { c: { d: 'Привет!' } } } }, ['a', 'b', 'c', 'd']], expected: 'Привет!' },
    { name: 'Лишнее свойство → undefined', fn: 'optionalChaining', input: [{ a: { b: 1 } }, ['a', 'b', 'c']], expected: undefined },
    { name: 'Отсутствующая ветка → undefined', fn: 'optionalChaining', input: [{ a: { b: 1 } }, ['a', 'c']], expected: undefined },
  ],
};
