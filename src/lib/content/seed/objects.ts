import type { LessonBlock, SeedModule } from '@/lib/content/types';

function quickQuiz(id: string, text: string, options: string[], correct: number[], explanation: string): LessonBlock {
  return {
    type: 'quiz', title: 'Проверьте понимание',
    questions: [{
      id, text,
      options: options.map((option, index) => ({ id: `${id}-${index}`, text: option })),
      correct: correct.map((index) => `${id}-${index}`),
      explanation,
    }],
  };
}

export const objectsModule: SeedModule = {
  slug: 'objects',
  title: 'Объекты',
  description: 'Методы объектов, spread/rest, деструктуризация, Map, Set и Date — от теории до практических преобразований данных.',
  lessons: [
    {
      slug: 'object-methods', title: 'Методы объектов', summary: 'Получение ключей, значений и пар свойств',
      blocks: [
        { type: 'text', markdown: `Встроенные методы помогают представить объект как коллекцию:

- \`Object.keys(object)\` возвращает массив ключей;
- \`Object.values(object)\` — массив значений;
- \`Object.entries(object)\` — массив пар \`[ключ, значение]\`;
- \`Object.fromEntries(pairs)\` собирает объект из пар.

Эти методы удобны для фильтрации, преобразования и подсчёта данных. Они не изменяют исходный объект.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239204', title: 'Основы JavaScript #20: Методы объектов' },
        quickQuiz('object-methods', 'Что возвращают методы объектов?', ['Object.keys — массив ключей', 'Object.values — массив значений', 'Object.entries — массив пар', 'Object.fromEntries — Map'], [0, 1, 2], 'Object.fromEntries создаёт обычный объект из последовательности пар.'),
        { type: 'task', slug: 'invert-object', note: 'Поменяйте местами ключи и значения.' },
        { type: 'task', slug: 'deep-equal', note: 'Сравните вложенные структуры рекурсивно.' },
      ],
    },
    {
      slug: 'spread-rest', title: 'Spread и rest', summary: 'Расширение коллекций и остаточные параметры',
      blocks: [
        { type: 'text', markdown: `Один синтаксис \`...\` решает две разные задачи.

**Spread** раскрывает элементы массива или свойства объекта в новом значении:

\`const copy = { ...user, active: true };\`

**Rest** собирает оставшиеся аргументы или свойства:

\`function sum(...numbers) { /* numbers — массив */ }\`

Копирование через spread поверхностное: вложенные объекты продолжают ссылаться на те же значения.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239222', title: 'Все о Spread и Rest' },
        { type: 'article', url: 'https://learn.javascript.ru/rest-parameters-spread-operator', title: 'Остаточные параметры и оператор расширения', source: 'learn.javascript.ru' },
        quickQuiz('spread-rest', 'Как работает синтаксис ...?', ['Spread раскрывает коллекцию', 'Rest собирает оставшиеся значения', 'Spread делает глубокую копию', 'Rest всегда возвращает Set'], [0, 1], 'Копирование через spread поверхностное, а rest обычно собирает значения в массив или объект.'),
        { type: 'task', slug: 'sum-rest', note: 'Обработайте произвольное количество аргументов.' },
        { type: 'task', slug: 'merge-objects', note: 'Объедините объекты с приоритетом последних свойств.' },
      ],
    },
    {
      slug: 'destructuring', title: 'Деструктуризация', summary: 'Извлечение значений из объектов и массивов',
      blocks: [
        { type: 'text', markdown: `Деструктуризация извлекает нужные части структуры в отдельные переменные.

\`const { name, age = 0 } = user;\`

Можно переименовывать свойства, задавать значения по умолчанию и применять деструктуризацию прямо в параметрах функции. Для массивов позиция имеет значение, а пропуск элемента обозначается запятой.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239223', title: 'Все о деструктуризации в JavaScript' },
        { type: 'article', url: 'https://learn.javascript.ru/destructuring-assignment', title: 'Деструктурирующее присваивание', source: 'learn.javascript.ru' },
        quickQuiz('destructuring', 'Что позволяет деструктуризация объекта?', ['Извлечь свойства в переменные', 'Переименовать переменную', 'Задать значение по умолчанию', 'Автоматически глубоко скопировать объект'], [0, 1, 2], 'Деструктуризация извлекает значения, но не выполняет глубокого копирования.'),
        { type: 'task', slug: 'languages-statistic', note: 'Соберите статистику из массива объектов.' },
      ],
    },
    {
      slug: 'map', title: 'Map', summary: 'Коллекция ключей и значений без ограничения на тип ключа',
      blocks: [
        { type: 'text', markdown: `\`Map\` хранит пары «ключ — значение», но, в отличие от обычного объекта, ключом может быть любое значение, включая объект.

- \`map.set(key, value)\` добавляет пару;
- \`map.get(key)\` читает значение;
- \`map.has(key)\` проверяет ключ;
- \`map.size\` сообщает количество пар.

При переборе \`Map\` сохраняет порядок добавления.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239175', title: 'JavaScript — Map' },
        { type: 'article', url: 'https://learn.javascript.ru/map-set', title: 'Map и Set', source: 'learn.javascript.ru' },
        quickQuiz('map-collection', 'Чем Map отличается от обычного объекта?', ['Ключом может быть объект', 'Есть свойство size', 'Сохраняется порядок добавления', 'Ключи всегда превращаются в строки'], [0, 1, 2], 'Map не приводит все ключи к строкам и предоставляет специализированный интерфейс коллекции.'),
        { type: 'task', slug: 'array-counts-map', note: 'Посчитайте частоту значений с ключами разных типов.' },
      ],
    },
    {
      slug: 'set', title: 'Set', summary: 'Коллекция уникальных значений',
      blocks: [
        { type: 'text', markdown: `\`Set\` хранит каждое значение только один раз. Это делает его удобным для удаления повторов и быстрой проверки наличия.

\`const unique = [...new Set(values)];\`

Объекты считаются одинаковыми только тогда, когда это одна и та же ссылка. Два отдельных объекта с одинаковыми полями останутся двумя значениями.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239176', title: 'JavaScript — Set' },
        { type: 'article', url: 'https://learn.javascript.ru/map-set', title: 'Map и Set', source: 'learn.javascript.ru' },
        quickQuiz('set-collection', 'Как Set определяет повторы объектов?', ['По совпадению всех полей', 'По ссылочной идентичности', 'По JSON-представлению', 'Объекты нельзя хранить в Set'], [1], 'Два отдельных объекта считаются разными, даже если содержат одинаковые поля.'),
        { type: 'task', slug: 'unique-set', note: 'Удалите повторы, сохранив порядок.' },
      ],
    },
    {
      slug: 'date', title: 'Дата и время', summary: 'Создание дат и вычисление интервалов',
      blocks: [
        { type: 'text', markdown: `Объект \`Date\` хранит момент времени как количество миллисекунд от начала Unix-эпохи. Метод \`getTime()\` возвращает это число.

Разность двух дат — интервал в миллисекундах. Для перевода в дни разделите его на \`1000 * 60 * 60 * 24\` и определите, как округлять неполные дни. Проверяйте валидность через \`Number.isNaN(date.getTime())\`.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239182', title: 'JavaScript — Date' },
        { type: 'article', url: 'https://learn.javascript.ru/date', title: 'Дата и время', source: 'learn.javascript.ru' },
        { type: 'article', url: 'https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date', title: 'Date', source: 'MDN' },
        quickQuiz('date-time', 'Как надёжно проверить, что объект Date содержит невалидную дату?', ['date === NaN', 'Number.isNaN(date.getTime())', 'typeof date === undefined', 'date.length === 0'], [1], 'getTime возвращает NaN для невалидной даты, который проверяется через Number.isNaN.'),
        { type: 'task', slug: 'days-between-dates', note: 'Вычислите количество полных дней между датами.' },
      ],
    },
  ],
  taskSlugs: ['invert-object', 'deep-equal', 'sum-rest', 'merge-objects', 'languages-statistic', 'array-counts-map', 'unique-set', 'days-between-dates'],
};
