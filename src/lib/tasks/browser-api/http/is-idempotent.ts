import type { AlgorithmTask } from '@/lib/runner/types';

export const isIdempotent: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'is-idempotent',
  title: 'Идемпотентность метода',
  language: 'javascript',
  description: `**Идемпотентный** запрос можно повторить сколько угодно раз, и состояние на сервере будет таким же, как после первого раза.

\`GET\` только читает. \`PUT\` кладёт ресурс в заданное состояние — повтори хоть десять раз, результат тот же. \`DELETE\` удаляет: второй вызов вернёт «уже нет», но состояние не изменится. А вот \`POST\` обычно создаёт новую запись, и три повтора дадут три заказа — поэтому он не идемпотентен.

Это не теория ради теории: именно по идемпотентности решают, можно ли автоматически повторить запрос после обрыва связи.

Реализуйте \`isIdempotent(method)\`:

- \`true\` для \`GET\`, \`HEAD\`, \`PUT\`, \`DELETE\`, \`OPTIONS\`, \`TRACE\`;
- \`false\` для \`POST\` и \`PATCH\`;
- \`false\` для всего незнакомого.

Метод может прийти в любом регистре и с пробелами по краям — приведите его к порядку перед проверкой.`,
  starterCode: `function isIdempotent(method) {

}
`,
  tests: [
    { name: "isIdempotent('GET') → true", fn: 'isIdempotent', input: ['GET'], expected: true },
    { name: "isIdempotent('PUT') → true", fn: 'isIdempotent', input: ['PUT'], expected: true },
    { name: "isIdempotent('DELETE') → true", fn: 'isIdempotent', input: ['DELETE'], expected: true },
    { name: "POST создаёт новое: isIdempotent('POST') → false", fn: 'isIdempotent', input: ['POST'], expected: false },
    { name: "isIdempotent('PATCH') → false", fn: 'isIdempotent', input: ['PATCH'], expected: false },
    { name: "Регистр не важен: isIdempotent('get') → true", fn: 'isIdempotent', input: ['get'], expected: true },
    { name: "Пробелы по краям: isIdempotent('  Put  ') → true", fn: 'isIdempotent', input: ['  Put  '], expected: true },
    { name: "Незнакомый метод: isIdempotent('FETCH') → false", fn: 'isIdempotent', input: ['FETCH'], expected: false },
    { name: "Не строка: isIdempotent(undefined) → false", fn: 'isIdempotent', input: [undefined], expected: false },
  ],
};
