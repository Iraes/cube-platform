import type { SeedModule } from '@/lib/content/types';

export const advancedFunctions: SeedModule = {
  slug: 'advanced-functions',
  title: 'Продвинутая работа с функциями',
  description: 'Рекурсия, функции высшего порядка, замыкания, фабрики предикатов и контекст this.',
  lessons: [
    {
      slug: 'recursion-basics', title: 'Рекурсия: основы', summary: 'Функция, которая вызывает саму себя',
      blocks: [
        { type: 'text', markdown: `Рекурсивная функция решает задачу через более простой вариант той же задачи. У неё обязательно должны быть:

1. **Базовый случай** — условие, при котором рекурсия останавливается.
2. **Рекурсивный шаг** — вызов функции с аргументами, приближающими к базовому случаю.

\`\`\`js
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
\`\`\`

Каждый вызов попадает в стек. Если базовый случай недостижим, стек переполнится.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239211', title: 'Работа с рекурсией на JavaScript' },
        { type: 'article', url: 'https://habr.com/ru/post/337030/', title: 'Рекурсия', source: 'Хабр' },
        { type: 'task', slug: 'sequence-sum', note: 'Сложите диапазон чисел рекурсивно.' },
      ],
    },
    {
      slug: 'recursion-practice', title: 'Рекурсия во вложенных структурах', summary: 'Обход массивов и объектов произвольной глубины',
      blocks: [
        { type: 'text', markdown: `Рекурсия особенно полезна, когда заранее неизвестна глубина структуры: дерево, вложенный объект или массив.

Алгоритм обычно проверяет тип текущего значения. Простое значение обрабатывается сразу, а каждый дочерний объект передаётся в следующий рекурсивный вызов. Результаты дочерних вызовов объединяются на обратном пути.` },
        { type: 'article', url: 'https://www.programiz.com/javascript/recursion', title: 'JavaScript Recursion', source: 'Programiz' },
        { type: 'task', slug: 'nested-string-count', note: 'Посчитайте строки на любой глубине.' },
        { type: 'task', slug: 'optional-chaining-path', note: 'Пройдите по цепочке вложенных свойств.' },
      ],
    },
    {
      slug: 'higher-order-functions', title: 'Функции высшего порядка и callback', summary: 'Функции как значения и аргументы',
      blocks: [
        { type: 'text', markdown: `В JavaScript функция — обычное значение. Её можно сохранить в переменную, передать аргументом или вернуть из другой функции.

Функция, принимающая или возвращающая другую функцию, называется **функцией высшего порядка**. Переданная функция часто называется **callback**.

Методы \`map\`, \`filter\` и \`reduce\` вызывают callback для элементов массива.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239200', title: 'Основы JavaScript #16: Функции высшего порядка' },
        { type: 'article', url: 'https://habr.com/ru/company/ruvds/blog/428570/', title: 'Функции высшего порядка', source: 'Хабр' },
        { type: 'task', slug: 'partition', note: 'Разделите массив с помощью callback.' },
      ],
    },
    {
      slug: 'closures', title: 'Замыкания', summary: 'Как функция запоминает внешнее окружение',
      blocks: [
        { type: 'text', markdown: `Замыкание — функция вместе с лексическим окружением, в котором она была создана. Внутренняя функция продолжает видеть переменные внешней функции даже после завершения внешнего вызова.

\`\`\`js
function makeCounter() {
  let value = 0;
  return () => ++value;
}
\`\`\`

Каждый вызов \`makeCounter\` создаёт независимое состояние.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239215', title: 'Что такое замыкания и как они работают' },
        { type: 'video', url: 'https://www.youtube.com/watch?v=UGapN-hrekw', title: 'Дополнительный разбор замыканий' },
        { type: 'task', slug: 'once', note: 'Сохраните состояние первого вызова в замыкании.' },
      ],
    },
    {
      slug: 'closures-practice', title: 'Фабрики функций', summary: 'Создание настроенных функций через замыкание',
      blocks: [
        { type: 'text', markdown: `Фабрика функций принимает настройки и возвращает готовую функцию, которая их помнит. Это удобно для создания предикатов:

\`\`\`js
function greaterThan(limit) {
  return (value) => value > limit;
}

[1, 5, 10].filter(greaterThan(4)); // [5, 10]
\`\`\`` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239180', title: 'Замыкания в JavaScript' },
        { type: 'article', url: 'https://learn.javascript.ru/closure', title: 'Замыкание', source: 'learn.javascript.ru' },
        { type: 'task', slug: 'array-filter-factories', note: 'Создайте фабрики предикатов для filter.' },
      ],
    },
    {
      slug: 'this-context', title: 'Контекст вызова и this', summary: 'Как метод получает доступ к объекту',
      blocks: [
        { type: 'text', markdown: `Значение \`this\` определяется способом вызова функции. При вызове \`object.method()\` внутри метода \`this\` указывает на объект слева от точки.

Стрелочные функции не создают собственный \`this\`, поэтому для методов, которым нужен динамический контекст, обычно используют обычную запись метода.

\`\`\`js
const user = {
  name: 'Аня',
  greet() { return this.name; }
};
\`\`\`` },
        { type: 'article', url: 'https://learn.javascript.ru/object-methods', title: 'Методы объекта и this', source: 'learn.javascript.ru' },
        { type: 'video', url: 'https://vk.com/video-227259800_456239201', title: 'Основы JavaScript #17: This' },
        { type: 'task', slug: 'object-calculator', note: 'Создайте объект-калькулятор с методами.' },
      ],
    },
  ],
  taskSlugs: ['sequence-sum', 'nested-string-count', 'optional-chaining-path', 'partition', 'once', 'array-filter-factories', 'object-calculator'],
};
