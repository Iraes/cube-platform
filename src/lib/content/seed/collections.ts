import type { SeedModule } from "@/lib/content/types";

export const collections: SeedModule = {
  slug: "collections",
  title: "Массивы и объекты",
  description:
    "Структуры, в которых хранятся списки и записи: перебор массива, работа с ключами объекта.",
  lessons: [
    {
      slug: "arrays",
      title: "Массивы и перебор",
      summary: "Список значений и способы пройтись по нему",
      blocks: [
        {
          type: "text",
          markdown: `Массив хранит упорядоченный список значений. Обращение по индексу начинается с нуля:

\`\`\`js
const users = ['Аня', 'Борис', 'Вера'];
users[0];      // 'Аня'
users.length;  // 3
\`\`\`

Перебрать массив можно циклом \`for...of\`, а можно методами:

\`\`\`js
const numbers = [1, 2, 3, 4];

numbers.filter((n) => n % 2 === 0); // [2, 4]  — отобрать
numbers.map((n) => n * 2);          // [2, 4, 6, 8] — преобразовать
\`\`\`

Важно: \`filter\` и \`map\` возвращают **новый** массив, а исходный не меняют.`,
        },
        {
          type: "article",
          url: "https://learn.javascript.ru/array",
          title: "Массивы",
          source: "learn.javascript.ru",
        },
        {
          type: "article",
          url: "https://learn.javascript.ru/array-methods",
          title: "Методы массивов",
          source: "learn.javascript.ru",
          note: "filter, map, reduce и остальные — пригодятся в задачах.",
        },
      ],
    },
    {
      slug: "objects",
      title: "Объекты",
      summary: "Данные парами «ключ — значение»",
      blocks: [
        {
          type: "text",
          markdown: `Объект хранит данные парами «ключ — значение»:

\`\`\`js
const user = { name: 'Аня', age: 25 };

user.name;      // 'Аня'
user['age'];    // 25
user.city = 'Москва';   // добавили поле
\`\`\`

Запись через точку удобнее, но когда ключ лежит в переменной — нужны квадратные скобки:

\`\`\`js
const key = 'name';
user[key]; // 'Аня'
\`\`\`

Это основной приём для подсчётов: собираем объект, где ключ — то, что считаем, а значение — счётчик.`,
        },
        {
          type: "article",
          url: "https://learn.javascript.ru/object",
          title: "Объекты",
          source: "learn.javascript.ru",
        },
      ],
    },
  ],
  taskSlugs: ["filter-even", "count-chars"],
};
