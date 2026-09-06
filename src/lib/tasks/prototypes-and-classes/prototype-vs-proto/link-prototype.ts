import type { AlgorithmTask } from '@/lib/runner/types';

export const linkPrototype: AlgorithmTask = {
  kind: 'algorithm', slug: 'link-prototype', title: 'Связать объект с прототипом', language: 'javascript',
  description: `Реализуйте \`linkPrototype(object, prototype)\`. Установите объекту переданный прототип и верните сам \`object\`.

Свойства прототипа копировать нельзя — нужна именно связь. Разница видна сразу: скопированное свойство станет собственным, и \`Object.hasOwn\` это покажет. А при настоящей связи свойство остаётся в прототипе, объект лишь находит его по цепочке.

Стандартный способ — \`Object.setPrototypeOf(object, prototype)\`. Прототипом может быть и \`null\`: тогда цепочка обрывается, и объект перестаёт наследовать даже методы \`Object.prototype\`.

Служебные функции не изменяйте.`,
  starterCode: `function linkPrototype(object, prototype) {

}

function makePair() {
  return { prototype: { inherited: 'из прототипа' }, object: { own: 'собственное' } };
}

function checkReturnsSameObject() {
  const { prototype, object } = makePair();
  return linkPrototype(object, prototype) === object;
}

function checkPrototypeSet() {
  const { prototype, object } = makePair();
  linkPrototype(object, prototype);
  return Object.getPrototypeOf(object) === prototype;
}

function checkInheritedVisible() {
  const { prototype, object } = makePair();
  linkPrototype(object, prototype);
  return object.inherited;
}

function checkNotCopied() {
  const { prototype, object } = makePair();
  linkPrototype(object, prototype);
  return { isOwn: Object.hasOwn(object, 'inherited'), keys: Object.keys(object) };
}

function checkOwnPropertyKept() {
  const { prototype, object } = makePair();
  linkPrototype(object, prototype);
  return object.own;
}

function checkNullPrototype() {
  const object = { own: 'собственное' };
  linkPrototype(object, null);
  return { prototype: Object.getPrototypeOf(object), own: object.own };
}
`,
  tests: [
    { name: 'Возвращает тот же объект, а не копию', fn: 'checkReturnsSameObject', input: [], expected: true },
    { name: 'Прототип действительно установлен', fn: 'checkPrototypeSet', input: [], expected: true },
    { name: 'Свойство прототипа видно через объект', fn: 'checkInheritedVisible', input: [], expected: 'из прототипа' },
    { name: 'Свойство не скопировано: оно не собственное', fn: 'checkNotCopied', input: [], expected: { isOwn: false, keys: ['own'] } },
    { name: 'Собственное свойство не потерялось', fn: 'checkOwnPropertyKept', input: [], expected: 'собственное' },
    { name: 'Прототипом может быть null — цепочка обрывается', fn: 'checkNullPrototype', input: [], expected: { prototype: null, own: 'собственное' } },
  ],
};
