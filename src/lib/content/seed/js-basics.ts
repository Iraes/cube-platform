import type { SeedModule } from "@/lib/content/types";

export const jsBasics: SeedModule = {
  slug: "js-basics",
  title: "Основы JavaScript",
  description:
    "Переменные, типы данных и функции — минимум, без которого не написать ни одной программы. Сначала теория и видео, потом задачи на закрепление.",
  lessons: [
    {
      slug: "variables",
      title: "Переменные и типы данных",
      summary: "Где программа хранит данные и какими они бывают",
      blocks: [
        {
          type: "text",
          markdown: `Переменная — это именованная коробка для значения. В JavaScript их объявляют двумя словами:

- \`let\` — значение можно менять;
- \`const\` — переприсвоить нельзя.

\`\`\`js
const name = 'Аня';
let score = 10;
score = score + 5;
\`\`\`

По умолчанию берите \`const\` и меняйте на \`let\` только тогда, когда значение действительно должно меняться — так меньше шансов случайно всё сломать.

Основные типы значений: строки (\`'текст'\`), числа (\`42\`, \`3.14\`), логические (\`true\` / \`false\`), а также \`null\` и \`undefined\` для «пусто».`,
        },
        {
          // Ссылку на своё видео вставьте сюда — поддерживаются YouTube, Vimeo, RuTube, VK и файлы .mp4
          type: "video",
          url: "",
          title: "Видео: переменные и типы данных",
          note: "Вставьте ссылку в поле url этого блока — YouTube, Vimeo, RuTube, VK или файл .mp4.",
        },
        {
          type: "article",
          url: "https://learn.javascript.ru/variables",
          title: "Переменные",
          source: "learn.javascript.ru",
          note: "Базовая статья: объявление, имена, константы.",
        },
        {
          type: "article",
          url: "https://learn.javascript.ru/types",
          title: "Типы данных",
          source: "learn.javascript.ru",
          note: "Какие типы бывают и чем они отличаются.",
        },
      ],
    },
    {
      slug: "functions",
      title: "Функции",
      summary: "Как оформить кусок логики, чтобы переиспользовать его",
      blocks: [
        {
          type: "text",
          markdown: `Функция — это переиспользуемый кусок кода. Она принимает параметры и **возвращает** результат через \`return\`.

\`\`\`js
function sum(a, b) {
  return a + b;
}

sum(2, 3); // 5
\`\`\`

Два правила, на которых спотыкаются чаще всего:

1. Без \`return\` функция возвращает \`undefined\`. Вывод через \`console.log\` — это не возврат значения.
2. Код после \`return\` не выполняется — функция завершается сразу.

В задачах на этой платформе от вас всегда ждут функцию с именем \`solution\`: её вызывают проверки и сравнивают результат с ожидаемым.`,
        },
        {
          type: "article",
          url: "https://learn.javascript.ru/function-basics",
          title: "Функции",
          source: "learn.javascript.ru",
          note: "Параметры, возврат значения, область видимости.",
        },
      ],
    },
  ],
  taskSlugs: ["sum-two-numbers", "reverse-string", "fizz-buzz"],
};
