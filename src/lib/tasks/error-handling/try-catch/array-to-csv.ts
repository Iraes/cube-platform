import type { AlgorithmTask } from '@/lib/runner/types';

export const arrayToCsv: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'array-to-csv',
  title: 'Массив в CSV',
  language: 'javascript',
  description: `Реализуйте функцию \`arrayToCsv(data)\`, которая превращает двумерный массив в строку CSV.

- строки таблицы разделяются переводом строки \`\\n\`;
- значения внутри строки разделяются запятыми;
- допустимы только строки и числа;
- значение с запятой, двойной кавычкой или переводом строки нужно заключить в двойные кавычки;
- двойную кавычку внутри значения нужно удвоить;
- при любом другом типе значения выбросьте \`Error\` с текстом \`Unexpected value\`.

Например, \`arrayToCsv([[1, 2], ['a,b', 'c']])\` возвращает строку \`1,2\\n"a,b",c\`.

Сначала удобно написать функцию для преобразования одного значения, а затем применить её во вложенных \`map\`.`,
  starterCode: `function arrayToCsv(data) {

}
`,
  tests: [
    { name: 'Преобразует числа и простые строки', fn: 'arrayToCsv', input: [[[1, 2], ['a', 'b']]], expected: '1,2\na,b' },
    { name: 'Заключает значения с запятыми в кавычки', fn: 'arrayToCsv', input: [[[1, 2], ['a,b', 'c,d']]], expected: '1,2\n"a,b","c,d"' },
    { name: 'Удваивает кавычки внутри значения', fn: 'arrayToCsv', input: [[['"text"', 'other "long" text']]], expected: '"""text""","other ""long"" text"' },
    { name: 'Поддерживает перевод строки внутри значения', fn: 'arrayToCsv', input: [[['первая\nвторая', 3]]], expected: '"первая\nвторая",3' },
    { name: 'Отклоняет значения неподдерживаемого типа', fn: 'arrayToCsv', input: [[[1, true]]], throws: 'Error', messageIncludes: 'Unexpected value' },
  ],
};
