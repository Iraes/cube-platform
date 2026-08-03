import type { SeedModule } from '@/lib/content/types';

export const referenceTypes: SeedModule = {
  slug: 'reference-types',
  title: 'Ссылочные типы данных',
  description: 'Объекты, условия, циклы, функции и массивы. Теория закрепляется десятью практическими задачами.',
  lessons: [
    {
      slug: 'objects', title: 'Объекты', summary: 'Данные в формате «ключ — значение»',
      blocks: [
        { type: 'text', markdown: `Объект хранит данные парами **ключ — значение**. Значением свойства может быть число, строка, массив, другой объект или функция.

\`\`\`js
const user = { name: 'Аня', age: 25 };
user.name;       // 'Аня'
user['age'];     // 25
\`\`\`

Квадратные скобки особенно важны, когда имя свойства хранится в переменной. На этом строятся объекты-счётчики: ключом становится символ, а значением — число повторений.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239194', title: 'Основы JavaScript #10: Объекты' },
        { type: 'article', url: 'https://learn.javascript.ru/object', title: 'Объекты', source: 'learn.javascript.ru', note: 'Создание, свойства, проверка существования и перебор.' },
        { type: 'task', slug: 'letters-count', note: 'Закрепите объекты на задаче-счётчике.' },
      ],
    },
    {
      slug: 'conditions', title: 'Условные операторы', summary: 'Ветвление программы по условию',
      blocks: [
        { type: 'text', markdown: `\`if\` выполняет блок кода, когда условие истинно. Ветки \`else if\` и \`else\` обрабатывают остальные случаи.

Для объединения условий используйте:

- \`&&\` — истинны оба условия;
- \`||\` — истинно хотя бы одно;
- \`!\` — логическое отрицание.

Проверяйте более строгие условия раньше общих, иначе нужная ветка может никогда не выполниться.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239195', title: 'Основы JavaScript #11: Условные операторы' },
        { type: 'task', slug: 'final-grade', note: 'Отработайте составные условия на расчёте итоговой оценки.' },
        { type: 'task', slug: 'single-fizzbuzz', note: 'Проверьте порядок условий на классической задаче.' },
      ],
    },
    {
      slug: 'ternary-and-switch', title: 'Тернарный оператор и switch', summary: 'Короткий выбор и несколько веток',
      blocks: [
        { type: 'text', markdown: `Тернарный оператор возвращает одно из двух значений:

\`const label = age >= 18 ? 'взрослый' : 'ребёнок';\`

\`switch\` удобен, когда одно выражение сравнивается с несколькими вариантами. Добавляйте \`break\`, чтобы выполнение не проваливалось в следующую ветку, и \`default\` для неизвестных значений.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239196', title: 'Основы JavaScript #12: Тернарный оператор. Switch case' },
        { type: 'task', slug: 'arithmetic', note: 'Реализуйте выбор арифметической операции.' },
      ],
    },
    {
      slug: 'loops', title: 'Циклы и итерации', summary: 'Повторение действий и перебор коллекций',
      blocks: [
        { type: 'text', markdown: `Циклы повторяют участок программы. \`for\` удобен, когда известны начало, условие и шаг. \`while\` повторяет код, пока условие истинно. \`for...of\` перебирает элементы строки или массива.

\`\`\`js
for (const item of items) {
  console.log(item);
}
\`\`\`

Следите, чтобы условие выхода когда-нибудь стало ложным — иначе получится бесконечный цикл.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239197', title: 'Основы JavaScript #13: Циклы' },
        { type: 'article', url: 'https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Loops_and_iteration', title: 'Циклы и итерации', source: 'MDN' },
        { type: 'task', slug: 'balanced-brackets', note: 'Используйте счётчик состояния во время прохода по строке.' },
        { type: 'task', slug: 'find-all-idx', note: 'Соберите индексы совпадающих элементов.' },
      ],
    },
    {
      slug: 'functions', title: 'Функции', summary: 'Параметры, вызов и возвращаемое значение',
      blocks: [
        { type: 'text', markdown: `Функция объединяет действия, принимает параметры и возвращает результат через \`return\`.

\`\`\`js
function sum(a, b) {
  return a + b;
}
\`\`\`

Без \`return\` функция возвращает \`undefined\`. Объявление функции и её вызов — разные действия: код внутри выполняется только при вызове.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239198', title: 'Основы JavaScript #14: Функции' },
        { type: 'article', url: 'https://learn.javascript.ru/function-basics', title: 'Функции', source: 'learn.javascript.ru' },
      ],
    },
    {
      slug: 'pure-functions', title: 'Чистые функции', summary: 'Предсказуемые функции без побочных эффектов',
      blocks: [
        { type: 'text', markdown: `Чистая функция при одинаковых аргументах всегда возвращает одинаковый результат и не изменяет внешнее состояние.

Изменение входного массива называется **мутацией**. Если нужно сохранить исходные данные, создайте новый массив через \`map\`, \`filter\`, \`slice\` или spread-синтаксис.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239225', title: 'Что такое чистые функции?' },
        { type: 'task', slug: 'replace-items', note: 'Сравните чистое преобразование и намеренную мутацию.' },
      ],
    },
    {
      slug: 'arrays', title: 'Массивы и базовые методы', summary: 'Упорядоченные коллекции и преобразования',
      blocks: [
        { type: 'text', markdown: `Массив хранит упорядоченную коллекцию, а индексация начинается с нуля.

- \`slice\` возвращает часть массива без мутации;
- \`map\` преобразует каждый элемент;
- \`filter\` оставляет элементы, подходящие под условие;
- \`Array.isArray(value)\` надёжно проверяет, является ли значение массивом.

Методы \`push\`, \`pop\` и \`splice\` изменяют исходный массив — учитывайте это при проектировании функции.` },
        { type: 'article', url: 'https://learn.javascript.ru/array', title: 'Массивы', source: 'learn.javascript.ru' },
        { type: 'video', url: 'https://vk.com/video-227259800_456239199', title: 'Основы JavaScript #15: Базовые методы массивов' },
        { type: 'task', slug: 'move-to-start', note: 'Соберите новый массив из двух частей.' },
        { type: 'task', slug: 'has-arrays', note: 'Найдите массив среди значений разных типов.' },
        { type: 'task', slug: 'numbers-by-parity', note: 'Отфильтруйте числа по чётности.' },
      ],
    },
  ],
  taskSlugs: ['letters-count', 'final-grade', 'single-fizzbuzz', 'arithmetic', 'balanced-brackets', 'find-all-idx', 'replace-items', 'move-to-start', 'has-arrays', 'numbers-by-parity'],
};
