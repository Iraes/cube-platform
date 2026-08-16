import type { AlgorithmTask } from '@/lib/runner/types';

export const daysBetweenDates: AlgorithmTask = {
  kind: 'algorithm', slug: 'days-between-dates', title: 'Дни между датами', language: 'javascript',
  description: `Реализуйте \`getDaysBetweenDates(first, second)\`, возвращающую количество полных дней между датами. Принимайте строки, числа и объекты \`Date\`. Невалидная дата должна дать \`NaN\`, а отсутствие одного из аргументов — \`TypeError\`.`,
  starterCode: `function getDaysBetweenDates(first, second) {

}
`,
  tests: [
    { name: 'Считает соседние даты', fn: 'getDaysBetweenDates', input: ['1-1-2020', '1-2-2020'], expected: 1 },
    { name: 'Учитывает полные дни между Date', fn: 'getDaysBetweenDates', input: [new Date(2011, 6, 2, 6), new Date(2012, 6, 2, 18)], expected: 366 },
    { name: 'Работает с timestamp', fn: 'getDaysBetweenDates', input: [1409796000000, 1409925600000], expected: 1 },
    { name: 'Невалидная дата возвращает NaN', fn: 'getDaysBetweenDates', input: ['1-1-2020', 'дата'], expected: Number.NaN },
    { name: 'Требует два аргумента', fn: 'getDaysBetweenDates', input: [null], throws: 'TypeError' },
  ],
};
