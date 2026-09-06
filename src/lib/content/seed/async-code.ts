import type { LessonBlock, SeedModule } from '@/lib/content/types';

function quiz(id: string, text: string, options: string[], correct: number[], explanation: string): LessonBlock {
  return { type: 'quiz', title: 'Проверьте понимание', questions: [{ id, text, options: options.map((value, index) => ({ id: `${id}-${index}`, text: value })), correct: correct.map((index) => `${id}-${index}`), explanation }] };
}

export const asyncCode: SeedModule = {
  slug: 'async-code',
  title: 'Работа с асинхронным кодом',
  description: 'Callback-функции, промисы, async/await, событийный цикл, throttle и debounce.',
  lessons: [
    {
      slug: 'callbacks', title: 'Асинхронность и callback-функции', summary: 'Получение результата после завершения операции',
      blocks: [
        { type: 'text', markdown: `JavaScript выполняет синхронный код последовательно, но таймеры, сеть и ввод-вывод завершаются позже. Callback — функция, которую операция вызывает с готовым результатом.

При нескольких запросах нельзя полагаться на порядок их завершения. Нужно явно отслеживать, какие результаты уже получены, сохранять исходный порядок и вызывать финальный callback ровно один раз. Вложенные callback быстро усложняют обработку ошибок — эту проблему решают промисы.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239216', title: 'Асинхронность и Event Loop' },
        { type: 'article', url: 'https://learn.javascript.ru/callbacks', title: 'Колбэки', source: 'learn.javascript.ru' },
        quiz('callbacks-order', 'Что определяет порядок элементов результата при параллельных callback-запросах?', ['Порядок завершения запросов', 'Порядок исходных идентификаторов', 'Случайный выбор движка', 'Размер ответа'], [1], 'Ответы могут прийти в любом порядке, поэтому позицию результата связывают с исходным идентификатором.'),
        { type: 'task', slug: 'read-one-file', optional: true, note: 'Разминка: один асинхронный вызов вместо двух.' },
        { type: 'task', slug: 'sum-file-sizes', note: 'Дождитесь двух независимых callback-ответов.' },
        { type: 'task', slug: 'get-users-info', note: 'Сохраните порядок пользователей при разном времени ответа.' },
      ],
    },
    {
      slug: 'promises', title: 'Промисы и их композиция', summary: 'Состояния промиса, цепочки, ошибки, race и all',
      blocks: [
        { type: 'text', markdown: `Промис представляет будущий результат и бывает в состояниях pending, fulfilled или rejected. Обработчик \`.then\` возвращает новый промис, поэтому шаги соединяются в цепочку. Ошибка или отклонение проходят по цепочке до ближайшего \`.catch\`.

Комбинаторы решают типовые задачи: \`Promise.race\` принимает исход первого завершившегося промиса, а \`Promise.all\` ждёт все результаты, сохраняя исходный порядок, и отклоняется при первой ошибке.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239217', title: 'Promise: что это и как работает' },
        { type: 'article', url: 'https://learn.javascript.ru/promise-basics', title: 'Промисы', source: 'learn.javascript.ru' },
        { type: 'article', url: 'https://learn.javascript.ru/promise-chaining', title: 'Цепочка промисов', source: 'learn.javascript.ru' },
        quiz('promise-chain', 'Что возвращает вызов then?', ['Новый промис', 'Только исходный промис', 'Всегда undefined', 'Массив callback-функций'], [0], 'Новый промис позволяет продолжать цепочку и передавать результат следующему шагу.'),
        { type: 'task', slug: 'make-promise', optional: true, note: 'Разминка: создать промис вручную.' },
        { type: 'task', slug: 'increase-lowest-salary', note: 'Постройте цепочку действий и единый путь обработки ошибки.' },
        { type: 'task', slug: 'promise-race', note: 'Реализуйте принятие первого результата.' },
        { type: 'task', slug: 'promise-all', note: 'Соберите все результаты в исходном порядке.' },
      ],
    },
    {
      slug: 'async-await', title: 'Async и await', summary: 'Последовательная запись асинхронного кода',
      blocks: [
        { type: 'text', markdown: `Функция с \`async\` всегда возвращает промис. \`await\` приостанавливает только эту функцию до завершения промиса и позволяет использовать обычный \`try…catch\`.

\`await\` внутри \`for…of\` делает операции последовательными. Это важно, когда следующий шаг зависит от предыдущего. Для независимых операций последовательное ожидание медленнее — там лучше сначала создать промисы и затем объединить их.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239220', title: 'Async, await и работа с сервером' },
        { type: 'article', url: 'https://learn.javascript.ru/async-await', title: 'Async/await', source: 'learn.javascript.ru' },
        quiz('await-sequence', 'Когда цикл с await оправдан?', ['Когда следующий вызов зависит от предыдущего', 'Для любых независимых запросов', 'Только для синхронных функций', 'Чтобы функция перестала возвращать промис'], [0], 'Зависимые операции требуют порядка; независимые обычно выгоднее запускать параллельно.'),
        { type: 'task', slug: 'sum-async', optional: true, note: 'Разминка: два await подряд.' },
        { type: 'task', slug: 'increase-all-salaries', note: 'Обработайте каждого сотрудника и сохраните итог успешных операций.' },
        { type: 'task', slug: 'promises-in-series', note: 'Передавайте результат каждой функции следующей.' },
      ],
    },
    {
      slug: 'event-loop', title: 'Event Loop, throttle и debounce', summary: 'Очереди задач и управление частыми событиями',
      blocks: [
        { type: 'text', markdown: `Event Loop запускает готовые задачи, когда стек вызовов свободен. После текущего синхронного кода движок сначала опустошает очередь микрозадач (например, обработчики промисов), затем берёт следующую макрозадачу (таймер, событие).

Частые события прокрутки или ввода ограничивают декораторы. \`throttle\` разрешает вызов не чаще интервала, а \`debounce\` ждёт паузу и выполняет только последний вызов серии. Оба обязаны сохранять аргументы и контекст \`this\`.` },
        { type: 'video', url: 'https://vk.com/video-227259800_456239173', title: 'Event Loop в JavaScript — часть 1' },
        { type: 'video', url: 'https://vk.com/video-227259800_456239174', title: 'Event Loop в JavaScript — часть 2' },
        { type: 'article', url: 'https://learn.javascript.ru/event-loop', title: 'Событийный цикл: микрозадачи и макрозадачи', source: 'learn.javascript.ru' },
        quiz('throttle-debounce', 'Какой декоратор запускает только последний вызов после паузы?', ['throttle', 'debounce', 'Promise.all', 'setInterval'], [1], 'debounce переносит запуск после каждой новой попытки; throttle допускает периодические вызовы.'),
        { type: 'task', slug: 'execution-order', optional: true, note: 'Разминка: что за чем выполняется.' },
        { type: 'task', slug: 'throttle', note: 'Ограничьте частоту, сохранив this и аргументы.' },
        { type: 'task', slug: 'debounce', note: 'Соберите серию попыток в один последний вызов.' },
      ],
    },
    {
      slug: 'review-booking', title: 'Запись на ревью: ошибки и асинхронность', summary: 'Финальный урок блока и подготовка к ревью',
      blocks: [
        { type: 'text', markdown: `Вы завершили блок **«Обработка ошибок и асинхронность»**. Перед ревью проверьте, можете ли вы объяснить и показать кодом:

- распространение исключений и границы \`try…catch\`;
- собственные классы ошибок;
- callback и сохранение порядка результатов;
- состояния и цепочки промисов;
- поведение \`Promise.all\` и \`Promise.race\`;
- последовательное и параллельное ожидание;
- очереди Event Loop;
- различие throttle и debounce.

Когда сможете разобрать эти темы без подсказки, согласуйте с преподавателем слот ревью.` },
        quiz('async-review', 'Что выполняется раньше после завершения текущего синхронного кода?', ['Готовая микрозадача промиса', 'Таймер из очереди макрозадач', 'Любая задача случайно', 'Новый синхронный скрипт'], [0], 'Перед следующей макрозадачей Event Loop опустошает очередь микрозадач.'),
      ],
    },
  ],
  taskSlugs: ['read-one-file', 'sum-file-sizes', 'get-users-info', 'make-promise', 'increase-lowest-salary', 'promise-race', 'promise-all', 'sum-async', 'increase-all-salaries', 'promises-in-series', 'execution-order', 'throttle', 'debounce'],
};
