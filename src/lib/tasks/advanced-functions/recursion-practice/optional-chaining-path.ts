import type { AlgorithmTask } from '@/lib/runner/types';
export const optionalChainingPath: AlgorithmTask = {
  kind: 'algorithm', slug: 'optional-chaining-path', title: 'Optional Chaining', language: 'javascript',
  description: `Напишите \`optionalChaining(obj, chain)\`, где \`chain\` — массив имён свойств. Пройдите по цепочке и верните найденное значение. Если хотя бы одного свойства нет, верните \`undefined\`. Пустая цепочка возвращает сам объект.

Осторожно с ложными значениями: \`0\`, пустая строка и \`false\` — это найденные значения, а не отсутствующие. Проверять нужно наличие свойства, а не его истинность.

Постарайтесь решить задачу рекурсивно.

Служебные функции не изменяйте.`,
  starterCode: `function optionalChaining(obj, chain) {

}

// Служебные функции: каждая пара показывает и отсутствующее значение,
// и найденное рядом — чтобы «функция ничего не возвращает» не выглядело верным ответом
function checkExtraKey() {
  return {
    missing: optionalChaining({ a: { b: 1 } }, ['a', 'b', 'c']),
    found: optionalChaining({ a: { b: 1 } }, ['a', 'b']),
  };
}

function checkMissingBranch() {
  return {
    missing: optionalChaining({ a: { b: 1 } }, ['a', 'c']),
    found: optionalChaining({ a: { b: 1 } }, ['a']),
  };
}

function checkNullInChain() {
  return {
    missing: optionalChaining({ a: null }, ['a', 'b']),
    found: optionalChaining({ a: null }, ['a']),
  };
}
`,
  tests: [
    { name: 'Возвращает значение по полной цепочке', fn: 'optionalChaining', input: [{ a: { b: { c: { d: 'Привет!' } } } }, ['a', 'b', 'c', 'd']], expected: 'Привет!' },
    { name: 'Лишнее свойство → undefined, а рабочая цепочка по-прежнему находит значение', fn: 'checkExtraKey', input: [], expected: { missing: undefined, found: 1 } },
    { name: 'Отсутствующая ветка → undefined, а соседняя ветка находится', fn: 'checkMissingBranch', input: [], expected: { missing: undefined, found: { b: 1 } } },
    { name: 'Один шаг цепочки', fn: 'optionalChaining', input: [{ name: 'Аня' }, ['name']], expected: 'Аня' },
    { name: 'Пустая цепочка возвращает сам объект', fn: 'optionalChaining', input: [{ a: 1 }, []], expected: { a: 1 } },
    { name: 'Ложные значения не считаются отсутствующими', fn: 'optionalChaining', input: [{ a: { b: 0 } }, ['a', 'b']], expected: 0 },
    { name: 'Значение null в середине цепочки → undefined, а сам null находится', fn: 'checkNullInChain', input: [], expected: { missing: undefined, found: null } },
  ],
};
