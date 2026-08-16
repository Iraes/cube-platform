import type { AlgorithmTask } from '@/lib/runner/types';

export const linkPrototype: AlgorithmTask = {
  kind: 'algorithm', slug: 'link-prototype', title: 'Связать объект с прототипом', language: 'javascript',
  description: `Реализуйте \`linkPrototype(object, prototype)\`. Установите объекту переданный прототип и верните сам \`object\`.

Не копируйте свойства прототипа в объект. Используйте стандартный метод работы с прототипами. Служебную проверку не изменяйте.`,
  starterCode: `function linkPrototype(object, prototype) {

}

function checkPrototypeLink() {
  const prototype = { inherited: 'из прототипа' };
  const object = { own: 'собственное' };
  const result = linkPrototype(object, prototype);
  return {
    sameObject: result === object,
    correctPrototype: Object.getPrototypeOf(object) === prototype,
    inherited: object.inherited,
    inheritedIsOwn: Object.hasOwn(object, 'inherited'),
    own: object.own,
  };
}
`,
  tests: [
    { name: 'Создаёт прототипную связь без копирования свойств', fn: 'checkPrototypeLink', input: [], expected: { sameObject: true, correctPrototype: true, inherited: 'из прототипа', inheritedIsOwn: false, own: 'собственное' } },
  ],
};
