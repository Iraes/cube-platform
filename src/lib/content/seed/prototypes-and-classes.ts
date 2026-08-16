import type { SeedModule } from '@/lib/content/types';

export const prototypesAndClasses: SeedModule = {
  slug: 'prototypes-and-classes',
  title: 'Прототипы и классы',
  description: 'Прототипное наследование, функции-конструкторы, контекст this, Object.create, ES6-классы и событийная модель.',
  lessons: [
    {
      slug: 'prototype-chain', title: 'Наследование и цепочка прототипов', summary: 'Как объект находит унаследованные свойства',
      blocks: [
        { type: 'text', markdown: `У каждого обычного объекта есть внутренняя ссылка \`[[Prototype]]\`. Если собственного свойства нет, JavaScript ищет его в прототипе, затем в прототипе прототипа — до \`null\`.

Собственные свойства можно проверить через \`Object.hasOwn(object, key)\`. Цикл \`for...in\` видит и перечисляемые унаследованные свойства, поэтому внутри него часто нужна такая проверка.

Прототип даёт объектам общее поведение без копирования методов в каждый экземпляр.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239213', title: 'Что такое прототип' },
        { type: 'article', url: 'https://learn.javascript.ru/prototypes', title: 'Прототипы и наследование', source: 'learn.javascript.ru' },
        { type: 'task', slug: 'is-empty-prototypes', note: 'Разделите проверку собственных и унаследованных свойств.' },
      ],
    },
    {
      slug: 'constructor-functions', title: 'Функции-конструкторы', summary: 'Создание однотипных объектов через new',
      blocks: [
        { type: 'text', markdown: `При вызове \`new Constructor()\` JavaScript создаёт объект, связывает его с \`Constructor.prototype\`, вызывает конструктор с новым объектом в \`this\` и возвращает объект.

Данные экземпляра задают внутри конструктора, а общие методы размещают в \`Constructor.prototype\`. Тогда все экземпляры используют одну функцию вместо отдельных копий.` },
        { type: 'article', url: 'https://learn.javascript.ru/constructor-new', title: 'Конструкторы и оператор new', source: 'learn.javascript.ru' },
        { type: 'task', slug: 'book-library', note: 'Спроектируйте библиотечную модель на функции-конструкторе.' },
      ],
    },
    {
      slug: 'this-call-apply-bind', title: 'Контекст this и управление вызовом', summary: 'Позднее связывание, call, apply и bind',
      blocks: [
        { type: 'text', markdown: `У обычной функции значение \`this\` определяется местом вызова. В \`object.method()\` контекстом становится объект слева от точки. Если передать метод как callback отдельно, связь с объектом потеряется.

- \`fn.call(context, a, b)\` вызывает функцию с указанным контекстом;
- \`fn.apply(context, [a, b])\` делает то же с массивом аргументов;
- \`fn.bind(context)\` возвращает новую привязанную функцию.

Декоратор должен передавать исходной функции и контекст, и аргументы, а также возвращать её результат.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239214', title: 'Контекст this, call, bind и apply' },
        { type: 'article', url: 'https://learn.javascript.ru/call-apply-decorators', title: 'Декораторы и переадресация вызова', source: 'learn.javascript.ru' },
        { type: 'task', slug: 'prototype-decorator', note: 'Оберните метод через прототип, сохранив контракт.' },
      ],
    },
    {
      slug: 'object-create', title: 'Object.create и методы прототипов', summary: 'Явное создание прототипной связи и дескрипторы',
      blocks: [
        { type: 'text', markdown: `\`Object.create(prototype, descriptors)\` создаёт объект с заданным прототипом. Это позволяет строить цепочку наследования без функции-конструктора.

Второй аргумент содержит дескрипторы свойств — \`value\`, \`writable\`, \`enumerable\`, \`configurable\`, а также \`get\` и \`set\`. Их можно применить отдельно через \`Object.defineProperties\`.

Современные методы \`Object.getPrototypeOf\` и \`Object.setPrototypeOf\` предпочтительнее прямой работы с \`__proto__\`.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239218', title: 'Object.create, getters и setters' },
        { type: 'article', url: 'https://learn.javascript.ru/prototype-methods', title: 'Методы прототипов', source: 'learn.javascript.ru' },
        { type: 'task', slug: 'object-create-polyfill', note: 'Воспроизведите поведение Object.create.' },
      ],
    },
    {
      slug: 'classes', title: 'ES6-классы', summary: 'Конструкторы, методы, геттеры, static и наследование',
      blocks: [
        { type: 'text', markdown: `Класс — удобный синтаксис поверх прототипной модели. \`constructor\` инициализирует экземпляр, обычные методы попадают в прототип, геттер выглядит как свойство, а \`static\` создаёт метод самого класса.

\`extends\` связывает классы наследованием. В конструкторе наследника сначала вызывают \`super(...)\`. Методы могут возвращать новый экземпляр своего класса — это удобно для неизменяемых цепочек вызовов.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239219', title: 'Всё об ES6-классах' },
        { type: 'article', url: 'https://learn.javascript.ru/class', title: 'Класс: базовый синтаксис', source: 'learn.javascript.ru' },
        { type: 'task', slug: 'bank-account', note: 'Создайте связанную модель клиента и банковского счёта.' },
        { type: 'task', slug: 'fluent-calc', note: 'Реализуйте неизменяемый fluent-интерфейс.' },
        { type: 'task', slug: 'event-emitter', note: 'Примените классы и наследование к событийной модели.' },
      ],
    },
    {
      slug: 'prototype-vs-proto', title: 'prototype и __proto__', summary: 'Связь конструктора, экземпляра и цепочки наследования',
      blocks: [
        { type: 'text', markdown: `\`prototype\` — обычное свойство функции-конструктора. При вызове с \`new\` оно становится прототипом созданного объекта.

\`__proto__\` — исторический аксессор к внутреннему \`[[Prototype]]\` конкретного объекта. Поэтому выражение \`instance.__proto__ === Constructor.prototype\` обычно истинно, но в прикладном коде лучше использовать \`Object.getPrototypeOf(instance)\`.

Не путайте прототип объекта с полем \`prototype\` конструктора: это разные стороны одной связи.` },
        { type: 'article', url: 'https://habr.com/ru/companies/otus/articles/685528/', title: '__proto__ и prototype', source: 'Хабр' },
      ],
    },
  ],
  taskSlugs: ['is-empty-prototypes', 'book-library', 'prototype-decorator', 'object-create-polyfill', 'bank-account', 'fluent-calc', 'event-emitter'],
};
