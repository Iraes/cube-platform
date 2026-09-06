import type { AlgorithmTask } from '@/lib/runner/types';

export const safeParse: AlgorithmTask = {
  kind: 'algorithm', slug: 'safe-parse', title: 'Безопасный разбор JSON', language: 'javascript',
  description: `Ступенька к «Счётчику в хранилище». Там разбор JSON — только часть работы; здесь он весь.

Реализуйте \`safeParse(text, fallback)\`: разберите строку и верните результат. Если строка повреждена и \`JSON.parse\` выбросил ошибку, верните \`fallback\`.

Оборачивайте в \`try\` **только сам разбор**, а не всю функцию. Широкий \`try\` проглотит и посторонние ошибки — те, которые вы обработать не умеете и о которых должны узнать.

Ещё одна тонкость: \`JSON.parse\` не бросает ошибку на строке \`'null'\` — она разбирается в значение \`null\`, и это корректный JSON. Отличайте «не разобралось» от «разобралось в пустое значение».

Дальше к этому добавится чтение из хранилища и запись обратно — но сердцевина останется этой.`,
  starterCode: `function safeParse(text, fallback) {

}
`,
  tests: [
    { name: 'Объект разбирается', fn: 'safeParse', input: ['{"a":1}', {}], expected: { a: 1 } },
    { name: 'Массив разбирается', fn: 'safeParse', input: ['[1,2,3]', []], expected: [1, 2, 3] },
    { name: 'Повреждённая строка → запасное значение', fn: 'safeParse', input: ['{это не json', { count: 0 }], expected: { count: 0 } },
    { name: 'Пустая строка → запасное значение', fn: 'safeParse', input: ['', {}], expected: {} },
    { name: 'Строка null разбирается в null, а не в запасное значение', fn: 'safeParse', input: ['null', { a: 1 }], expected: null },
    { name: 'Число тоже корректный JSON', fn: 'safeParse', input: ['42', 0], expected: 42 },
  ],
};
