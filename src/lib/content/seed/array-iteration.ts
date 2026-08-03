import type { SeedModule } from '@/lib/content/types';

export const arrayIteration: SeedModule = {
  slug: 'array-iteration',
  title: 'Функции перебора массивов и стрелочные функции',
  description: 'Стрелочный синтаксис, map, filter, reduce и практические преобразования коллекций.',
  lessons: [
    {
      slug: 'arrow-functions', title: 'Стрелочные функции', summary: 'Короткий синтаксис и лексический this',
      blocks: [
        { type: 'text', markdown: `Стрелочная функция — компактная форма функционального выражения:

\`\`\`js
const sum = (a, b) => a + b;
const square = value => value * value;
\`\`\`

Если тело состоит из одного выражения, результат возвращается неявно. Для возврата объекта в короткой форме оберните его в круглые скобки: \`() => ({ value: 1 })\`.

Стрелочные функции не имеют собственного \`this\` и \`arguments\`. Это удобно для колбэков, но не всегда подходит для методов объекта.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239202', title: 'Основы JavaScript #18: Arrow functions' },
        { type: 'article', url: 'https://learn.javascript.ru/arrow-functions-basics', title: 'Стрелочные функции — основы', source: 'learn.javascript.ru' },
        { type: 'article', url: 'https://learn.javascript.ru/arrow-functions', title: 'Стрелочные функции — подробно', source: 'learn.javascript.ru' },
      ],
    },
    {
      slug: 'array-iteration-methods', title: 'Перебирающие методы массивов', summary: 'map, filter и reduce вместо ручных циклов',
      blocks: [
        { type: 'text', markdown: `Методы перебора принимают callback и решают разные задачи:

- \`map\` создаёт новый массив преобразованных значений;
- \`filter\` создаёт массив элементов, прошедших проверку;
- \`reduce\` сворачивает массив в одно значение;
- \`find\` возвращает первый найденный элемент;
- \`some\` и \`every\` проверяют условия.

Выбирайте метод по смыслу. Если нужен новый массив той же длины — обычно это \`map\`; если часть элементов — \`filter\`; если итоговое число или объект — \`reduce\`.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239203', title: 'Основы JavaScript #19: Перебирающие методы массивов' },
        { type: 'article', url: 'https://learn.javascript.ru/array-methods', title: 'Методы массивов', source: 'learn.javascript.ru' },
        { type: 'article', url: 'https://habr.com/ru/articles/483182/', title: 'Практика методов массивов', source: 'Хабр' },
        { type: 'task', slug: 'get-field', note: 'Преобразуйте объекты через map.' },
        { type: 'task', slug: 'create-usernames', note: 'Добавьте вычисляемое поле каждому пользователю.' },
        { type: 'task', slug: 'calculate-price', note: 'Сверните заказы в общую стоимость.' },
        { type: 'task', slug: 'most-senior', note: 'Объедините поиск максимума и фильтрацию.' },
      ],
    },
    {
      slug: 'module-checklist', title: 'Самопроверка по основным концепциям', summary: 'Что стоит уметь объяснить перед переходом дальше',
      blocks: [
        { type: 'text', markdown: `Проверьте, можете ли вы своими словами объяснить и показать кодом:

- типы данных и приведение типов;
- хранение чисел и неточные вычисления;
- основные виды ошибок;
- рекурсию и базовый случай;
- замыкания и область видимости;
- различия \`var\`, \`let\`, \`const\` и hoisting;
- чистые функции и побочные эффекты;
- значения параметров по умолчанию;
- функции высшего порядка;
- отличия стрелочных функций от обычных;
- применение \`map\`, \`filter\` и \`reduce\`.

Если какой-то пункт вызывает затруднения, вернитесь к соответствующему уроку и попробуйте написать небольшой пример без подсказки.` },
      ],
    },
  ],
  taskSlugs: ['get-field', 'create-usernames', 'calculate-price', 'most-senior'],
};
