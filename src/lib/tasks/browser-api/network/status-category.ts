import type { AlgorithmTask } from '@/lib/runner/types';

export const statusCategory: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'status-category',
  title: 'Разбор статус-кодов',
  language: 'javascript',
  description: `Ответ сервера всегда приходит с числовым кодом, и по первой цифре понятно, что случилось.

Реализуйте \`describeStatus(code)\` — верните строку:

- \`'информация'\` — коды 1xx;
- \`'успех'\` — 2xx;
- \`'перенаправление'\` — 3xx;
- \`'ошибка клиента'\` — 4xx: запрос неверный, повторять его без изменений бессмысленно;
- \`'ошибка сервера'\` — 5xx: запрос нормальный, сломалось на той стороне, и повтор может помочь;
- \`'неизвестный код'\` — всё, что не попало в диапазон 100–599, а также нечисловые значения.

Первую цифру удобно получить делением: \`Math.floor(code / 100)\`.

Разница между 4xx и 5xx — не формальность. По ней решают, показывать ли пользователю «проверьте данные» или «попробуйте позже», и стоит ли повторять запрос автоматически.`,
  starterCode: `function describeStatus(code) {

}
`,
  tests: [
    { name: "describeStatus(200) → 'успех'", fn: 'describeStatus', input: [200], expected: 'успех' },
    { name: "describeStatus(404) → 'ошибка клиента'", fn: 'describeStatus', input: [404], expected: 'ошибка клиента' },
    { name: "describeStatus(500) → 'ошибка сервера'", fn: 'describeStatus', input: [500], expected: 'ошибка сервера' },
    { name: "describeStatus(301) → 'перенаправление'", fn: 'describeStatus', input: [301], expected: 'перенаправление' },
    { name: "describeStatus(100) → 'информация'", fn: 'describeStatus', input: [100], expected: 'информация' },
    { name: "Граница диапазона: describeStatus(599) → 'ошибка сервера'", fn: 'describeStatus', input: [599], expected: 'ошибка сервера' },
    { name: "Вне диапазона: describeStatus(42) → 'неизвестный код'", fn: 'describeStatus', input: [42], expected: 'неизвестный код' },
    { name: "Не число: describeStatus('200') → 'неизвестный код'", fn: 'describeStatus', input: ['200'], expected: 'неизвестный код' },
  ],
};
