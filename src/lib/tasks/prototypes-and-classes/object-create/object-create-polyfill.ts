import type { AlgorithmTask } from '@/lib/runner/types';

export const objectCreatePolyfill: AlgorithmTask = {
  kind: 'algorithm', slug: 'object-create-polyfill', title: 'Полифил Object.create', language: 'javascript',
  description: `Реализуйте \`objectCreate(prototype, properties)\` — аналог \`Object.create\`.

Первый аргумент должен быть объектом или \`null\`, иначе породите \`TypeError\`. Новый объект обязан наследовать переданный прототип. Если передан второй аргумент, примените его как набор дескрипторов через \`Object.defineProperties\`.`,
  starterCode: `function objectCreate(prototype, properties) {

}

function inspectCreatedObject(prototype, properties) {
  const result = objectCreate(prototype, properties);
  return {
    correctPrototype: Object.getPrototypeOf(result) === prototype,
    inherited: result.inherited,
    ownValue: result.ownValue,
    ownsValue: Object.hasOwn(result, 'ownValue'),
    enumerable: Object.prototype.propertyIsEnumerable.call(result, 'ownValue'),
  };
}
`,
  tests: [
    { name: 'Устанавливает прототип и свойства по дескрипторам', fn: 'inspectCreatedObject', input: [{ inherited: 'да' }, { ownValue: { value: 42, enumerable: true } }], expected: { correctPrototype: true, inherited: 'да', ownValue: 42, ownsValue: true, enumerable: true } },
    { name: 'Поддерживает null-прототип', fn: 'inspectCreatedObject', input: [null, { ownValue: { value: 'ok' } }], expected: { correctPrototype: true, inherited: undefined, ownValue: 'ok', ownsValue: true, enumerable: false } },
    { name: 'Отклоняет примитив вместо прототипа', fn: 'objectCreate', input: [42], throws: 'TypeError' },
    { name: 'Требует первый аргумент', fn: 'objectCreate', input: [], throws: 'TypeError' },
  ],
};
