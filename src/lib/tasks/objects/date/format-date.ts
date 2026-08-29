import type { AlgorithmTask } from '@/lib/runner/types';
export const formatDateTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'format-date', title: 'Дата в формате ДД.ММ.ГГГГ', language: 'javascript',
  description: `Ступенька к «Дням между датами». Сначала научимся просто читать части даты.

Реализуйте \`formatDate(date)\`: получите из объекта \`Date\` строку вида \`31.12.2000\`. День и месяц всегда двузначные — 5 января это \`05.01\`.

Три вещи, на которых спотыкаются все:

- \`getMonth()\` возвращает месяц с нуля: январь это \`0\`, декабрь — \`11\`. Прибавьте единицу.
- \`getDate()\` — это число месяца, а \`getDay()\` — день недели. Нужен первый.
- Дополнить нулём слева удобно через \`String(value).padStart(2, '0')\`.

Дальше эти же геттеры понадобятся, чтобы считать разницу между датами.`,
  starterCode: `function formatDate(date) {

}
`,
  tests: [
    { name: '31 декабря 2000 → 31.12.2000', fn: 'formatDate', input: [new Date(2000, 11, 31)], expected: '31.12.2000' },
    { name: 'Однозначный день и месяц дополняются нулём: 5 января 2024 → 05.01.2024', fn: 'formatDate', input: [new Date(2024, 0, 5)], expected: '05.01.2024' },
    { name: 'Октябрь — двузначный месяц: 9 октября 2019 → 09.10.2019', fn: 'formatDate', input: [new Date(2019, 9, 9)], expected: '09.10.2019' },
    { name: 'Високосный день: 29 февраля 2024 → 29.02.2024', fn: 'formatDate', input: [new Date(2024, 1, 29)], expected: '29.02.2024' },
  ],
};
