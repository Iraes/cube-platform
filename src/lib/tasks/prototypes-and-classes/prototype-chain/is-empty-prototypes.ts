import type { AlgorithmTask } from '@/lib/runner/types';

export const isEmptyPrototypes: AlgorithmTask = {
  kind: 'algorithm', slug: 'is-empty-prototypes', title: 'Пустой объект и прототипы', language: 'javascript',
  description: `Реализуйте две функции:

- \`isEmpty(object)\` проверяет только собственные свойства объекта;
- \`isEmptyWithProtos(object)\` проверяет объект и всю его цепочку прототипов, но не учитывает свойства \`Object.prototype\`.`,
  starterCode: `function isEmpty(object) {

}

function isEmptyWithProtos(object) {

}

function checkInheritedProperties(hasProperty) {
  const prototype = hasProperty ? { inherited: true } : Object.create(null);
  const object = Object.create(prototype);
  return {
    ownIsEmpty: isEmpty(object),
    chainIsEmpty: isEmptyWithProtos(object),
  };
}
`,
  tests: [
    { name: 'Пустой объект не имеет собственных свойств', fn: 'isEmpty', input: [{}], expected: true },
    { name: 'Находит собственное свойство', fn: 'isEmpty', input: [{ value: 1 }], expected: false },
    { name: 'Различает собственные и унаследованные свойства', fn: 'checkInheritedProperties', input: [true], expected: { ownIsEmpty: true, chainIsEmpty: false } },
    { name: 'Игнорирует Object.prototype', fn: 'isEmptyWithProtos', input: [{}], expected: true },
    { name: 'Работает с пустой цепочкой без Object.prototype', fn: 'checkInheritedProperties', input: [false], expected: { ownIsEmpty: true, chainIsEmpty: true } },
  ],
};
