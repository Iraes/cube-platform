import type { AlgorithmTask } from '@/lib/runner/types';

export const buildQuery: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'build-query',
  title: 'Собрать строку запроса',
  language: 'javascript',
  description: `Перед \`fetch\` параметры поиска нужно приклеить к адресу. Реализуйте \`buildQuery(params)\`: соберите из объекта строку вида \`q=react&per_page=5\`.

Правила:

- пары соединяются знаком \`&\`, ключ и значение — знаком \`=\`;
- порядок такой же, как порядок ключей в объекте;
- значения \`undefined\` и \`null\` пропускаются целиком — незаданный параметр лучше не отправлять вовсе;
- ключ и значение экранируются через \`encodeURIComponent\`;
- пустой объект даёт пустую строку.

Экранирование обязательно. Запрос «cube platform» без него разорвёт адрес пробелом, а символы \`&\` и \`=\` внутри значения превратятся в лишние параметры — и сервер поймёт запрос не так, как вы задумали.

Пригодятся \`Object.entries\`, \`filter\`, \`map\` и \`join\`.`,
  starterCode: `function buildQuery(params) {

}
`,
  tests: [
    {
      name: "Обычный случай: { q: 'react', per_page: 5 } → 'q=react&per_page=5'",
      fn: 'buildQuery',
      input: [{ q: 'react', per_page: 5 }],
      expected: 'q=react&per_page=5',
    },
    {
      name: 'Пробел экранируется, а не разрывает адрес',
      fn: 'buildQuery',
      input: [{ q: 'cube platform' }],
      expected: 'q=cube%20platform',
    },
    {
      name: 'Служебные символы в значении экранируются',
      fn: 'buildQuery',
      input: [{ filter: 'a&b=c' }],
      expected: 'filter=a%26b%3Dc',
    },
    {
      name: 'undefined и null пропускаются',
      fn: 'buildQuery',
      input: [{ q: 'js', page: undefined, sort: null, per_page: 10 }],
      expected: 'q=js&per_page=10',
    },
    {
      name: 'Пустая строка — это значение, её пропускать не нужно',
      fn: 'buildQuery',
      input: [{ q: '', page: 2 }],
      expected: 'q=&page=2',
    },
    { name: 'Пустой объект → пустая строка', fn: 'buildQuery', input: [{}], expected: '' },
    {
      name: 'Ключ тоже экранируется',
      fn: 'buildQuery',
      input: [{ 'поиск по имени': 'Аня' }],
      expected: '%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%20%D0%BF%D0%BE%20%D0%B8%D0%BC%D0%B5%D0%BD%D0%B8=%D0%90%D0%BD%D1%8F',
    },
  ],
};
