import type { AlgorithmTask } from '@/lib/runner/types';

export const validationError: AlgorithmTask = {
  kind: 'algorithm', slug: 'validation-error', title: 'Своя ошибка', language: 'javascript',
  description: `Ступенька к задачам «Повторяемый запрос данных» и «Применение функций с отчётом». В обеих нужен собственный класс ошибки — сделаем его отдельно.

Создайте класс \`ValidationError\`, унаследованный от \`Error\`, и функцию \`validateAge(value)\`.

Требования к классу:

- конструктор принимает сообщение и передаёт его в \`super(message)\`;
- свойство \`name\` равно \`'ValidationError'\`;
- дополнительное свойство \`field\` — имя поля, из-за которого возникла ошибка, вторым аргументом конструктора.

\`validateAge(value)\` возвращает число, а при непригодном значении бросает \`ValidationError\` с полем \`'age'\` и сообщением \`'Возраст должен быть числом от 0 до 150'\`. Непригодно всё, что не число, а также числа вне диапазона.

Зачем свой класс, когда есть обычный \`Error\`: по типу ошибку можно отличить от чужой. Вызывающий код напишет \`error instanceof ValidationError\` и обработает только свой случай, а всё остальное пробросит дальше. Со строковым сравнением сообщений так не выйдет — тексты меняются.

Не забудьте задать \`name\`: по умолчанию у наследника он остаётся \`'Error'\`.`,
  starterCode: `class ValidationError extends Error {

}

function validateAge(value) {

}

function checkAge(value) {
  try {
    return { ok: true, value: validateAge(value) };
  } catch (error) {
    return {
      ok: false,
      name: error.name,
      field: error.field,
      message: error.message,
      isValidation: error instanceof ValidationError,
      isError: error instanceof Error,
    };
  }
}
`,
  tests: [
    { name: 'Подходящий возраст проходит', fn: 'checkAge', input: [30], expected: { ok: true, value: 30 } },
    { name: 'Ноль допустим', fn: 'checkAge', input: [0], expected: { ok: true, value: 0 } },
    {
      name: 'Не число: ошибка своего типа, с полем и именем',
      fn: 'checkAge',
      input: ['тридцать'],
      expected: { ok: false, name: 'ValidationError', field: 'age', message: 'Возраст должен быть числом от 0 до 150', isValidation: true, isError: true },
    },
    {
      name: 'Слишком много: та же ошибка',
      fn: 'checkAge',
      input: [200],
      expected: { ok: false, name: 'ValidationError', field: 'age', message: 'Возраст должен быть числом от 0 до 150', isValidation: true, isError: true },
    },
    {
      name: 'Отрицательный возраст',
      fn: 'checkAge',
      input: [-1],
      expected: { ok: false, name: 'ValidationError', field: 'age', message: 'Возраст должен быть числом от 0 до 150', isValidation: true, isError: true },
    },
  ],
};
