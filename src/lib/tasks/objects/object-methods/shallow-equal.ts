import type { AlgorithmTask } from '@/lib/runner/types';
export const shallowEqual: AlgorithmTask = {
  kind: 'algorithm', slug: 'shallow-equal', title: 'Поверхностное сравнение', language: 'javascript',
  description: `Ступенька к «Глубокому сравнению». Здесь рекурсии ещё нет — только один уровень.

Реализуйте \`shallowEqual(a, b)\`: объекты равны, если у них одинаковый набор ключей и значения по каждому ключу строго равны (\`===\`).

Почему нельзя просто написать \`a === b\`: объекты сравниваются по ссылке, а не по содержимому. Два разных объекта с одинаковыми полями — это два разных объекта, и \`===\` даст \`false\`.

План: сравните количество ключей через \`Object.keys(...)\`, затем пройдите по ключам первого объекта и сверьте значения.

Обратите внимание на предпоследнюю проверку: вложенные объекты здесь считаются разными, даже если выглядят одинаково — потому что \`===\` для них сравнивает ссылки. Вот с этим и будет разбираться следующая задача, добавив рекурсию.`,
  starterCode: `function shallowEqual(a, b) {

}
`,
  tests: [
    { name: 'Одинаковые: { a: 1 } и { a: 1 } → true', fn: 'shallowEqual', input: [{ a: 1 }, { a: 1 }], expected: true },
    { name: 'Разные значения: { a: 1 } и { a: 2 } → false', fn: 'shallowEqual', input: [{ a: 1 }, { a: 2 }], expected: false },
    { name: 'Лишний ключ: { a: 1 } и { a: 1, b: 2 } → false', fn: 'shallowEqual', input: [{ a: 1 }, { a: 1, b: 2 }], expected: false },
    { name: 'Порядок ключей не важен', fn: 'shallowEqual', input: [{ a: 1, b: 2 }, { b: 2, a: 1 }], expected: true },
    { name: 'Вложенные объекты сравниваются по ссылке → false', fn: 'shallowEqual', input: [{ a: { b: 1 } }, { a: { b: 1 } }], expected: false },
    { name: 'Два пустых объекта → true', fn: 'shallowEqual', input: [{}, {}], expected: true },
  ],
};
