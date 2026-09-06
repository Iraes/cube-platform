import type { AlgorithmTask } from '@/lib/runner/types';
export const optionalChainingPath: AlgorithmTask = {
  kind: 'algorithm', slug: 'optional-chaining-path', title: 'Optional Chaining', language: 'javascript',
  description: `Напишите \`optionalChaining(obj, chain)\`, где \`chain\` — массив имён свойств. Пройдите по цепочке и верните найденное значение. Если хотя бы одного свойства нет, верните \`undefined\`. Пустая цепочка возвращает сам объект.

Осторожно с ложными значениями: \`0\`, пустая строка и \`false\` — это найденные значения, а не отсутствующие. Проверять нужно наличие свойства, а не его истинность.

Постарайтесь решить задачу рекурсивно.`,
  starterCode: `function optionalChaining(obj, chain) {

}
`,
  tests: [
    { name: 'Возвращает значение по полной цепочке', fn: 'optionalChaining', input: [{ a: { b: { c: { d: 'Привет!' } } } }, ['a', 'b', 'c', 'd']], expected: 'Привет!' },
    { name: 'Лишнее свойство → undefined', fn: 'optionalChaining', input: [{ a: { b: 1 } }, ['a', 'b', 'c']], expected: undefined },
    { name: 'Отсутствующая ветка → undefined', fn: 'optionalChaining', input: [{ a: { b: 1 } }, ['a', 'c']], expected: undefined },
    { name: 'Один шаг цепочки', fn: 'optionalChaining', input: [{ name: 'Аня' }, ['name']], expected: 'Аня' },
    { name: 'Пустая цепочка возвращает сам объект', fn: 'optionalChaining', input: [{ a: 1 }, []], expected: { a: 1 } },
    { name: 'Ложные значения не считаются отсутствующими', fn: 'optionalChaining', input: [{ a: { b: 0 } }, ['a', 'b']], expected: 0 },
    { name: 'Значение null в середине цепочки', fn: 'optionalChaining', input: [{ a: null }, ['a', 'b']], expected: undefined },
  ],
};
