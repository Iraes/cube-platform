import type { AlgorithmTask } from '@/lib/runner/types';

export const toPositiveNumber: AlgorithmTask = {
  kind: 'algorithm', slug: 'to-positive-number', title: 'Бросить свою ошибку', language: 'javascript',
  description: `Ступенька к задаче «Массив в CSV». Прежде чем перехватывать ошибки, научимся их бросать.

Реализуйте \`toPositiveNumber(value)\`:

- значение не число — бросьте \`TypeError\` с сообщением \`'Ожидалось число'\`;
- число меньше нуля — бросьте \`RangeError\` с сообщением \`'Число не может быть отрицательным'\`;
- иначе верните само число.

Бросают так: \`throw new TypeError('Ожидалось число')\`. Тип ошибки — не украшение: по нему вызывающий код решает, что делать. \`TypeError\` говорит «мне дали не то», \`RangeError\` — «дали то, но значение вне допустимого». Перехватить их можно раздельно, проверив \`error instanceof TypeError\`.

Ноль отрицательным не считается.

Обратите внимание: \`NaN\` формально имеет тип \`number\`, но числом не является. Отсеките его через \`Number.isNaN\`, иначе он проскочит проверку.

Служебную функцию не изменяйте: она ловит ошибку и показывает проверке её тип и текст.`,
  starterCode: `function toPositiveNumber(value) {

}

function checkPositive(value) {
  try {
    return { ok: true, value: toPositiveNumber(value) };
  } catch (error) {
    return { ok: false, name: error.name, message: error.message };
  }
}
`,
  tests: [
    { name: 'Обычное число проходит', fn: 'checkPositive', input: [42], expected: { ok: true, value: 42 } },
    { name: 'Ноль допустим', fn: 'checkPositive', input: [0], expected: { ok: true, value: 0 } },
    { name: 'Строка → TypeError', fn: 'checkPositive', input: ['5'], expected: { ok: false, name: 'TypeError', message: 'Ожидалось число' } },
    { name: 'Отрицательное → RangeError', fn: 'checkPositive', input: [-3], expected: { ok: false, name: 'RangeError', message: 'Число не может быть отрицательным' } },
    { name: 'NaN — не число: TypeError', fn: 'checkPositive', input: [Number.NaN], expected: { ok: false, name: 'TypeError', message: 'Ожидалось число' } },
    { name: 'undefined → TypeError', fn: 'checkPositive', input: [undefined], expected: { ok: false, name: 'TypeError', message: 'Ожидалось число' } },
  ],
};
