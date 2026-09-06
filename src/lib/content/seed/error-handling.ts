import type { LessonBlock, SeedModule } from '@/lib/content/types';

function quickQuiz(id: string, text: string, options: string[], correct: number[], explanation: string): LessonBlock {
  return {
    type: 'quiz', title: 'Проверьте понимание',
    questions: [{
      id, text,
      options: options.map((option, index) => ({ id: `${id}-${index}`, text: option })),
      correct: correct.map((index) => `${id}-${index}`),
      explanation,
    }],
  };
}

export const errorHandling: SeedModule = {
  slug: 'error-handling',
  title: 'Обработка ошибок',
  description: 'try…catch, границы обработки, JSON, собственные классы ошибок и повторные попытки.',
  lessons: [
    {
      slug: 'try-catch', title: 'try…catch и finally', summary: 'Как перехватывать ожидаемые сбои и сохранять ход программы',
      blocks: [
        { type: 'text', markdown: `Исключение прерывает обычный ход выполнения и поднимается вверх по стеку вызовов, пока не встретит подходящий \`try…catch\`.

\`try\` содержит операцию, которая может завершиться ошибкой. В \`catch (error)\` доступен объект ошибки: обычно у него есть \`name\`, \`message\` и \`stack\`. Блок \`finally\` выполняется после \`try\` и \`catch\` независимо от результата — например, для освобождения ресурса.

Перехватывайте ошибку там, где умеете осмысленно восстановиться. Если обработать её нельзя, пробросьте дальше через \`throw error\`. Пустой \`catch\` опасен: программа продолжит работу с неверными данными, а причина исчезнет.` },
        { type: 'video', url: 'https://share.kata.academy/fe/video/trycatchfinally.mp4', title: 'try, catch и finally' },
        { type: 'article', url: 'https://learn.javascript.ru/try-catch', title: 'Обработка ошибок, try…catch', source: 'learn.javascript.ru' },
        quickQuiz('try-catch-flow', 'Какие утверждения верны?', ['catch выполняется только при ошибке в try', 'finally выполняется независимо от результата', 'catch обязан скрыть любую ошибку', 'Необработанная ошибка поднимается по стеку вызовов'], [0, 1, 3], 'catch нужен для осмысленной обработки, finally — для обязательного завершения, а необработанная ошибка продолжает подниматься.'),
        { type: 'task', slug: 'to-positive-number', optional: true, note: 'Разминка: бросьте ошибку нужного типа.' },
        { type: 'task', slug: 'array-to-csv', note: 'Проверьте типы значений и сообщите о недопустимых данных.' },
      ],
    },
    {
      slug: 'data-boundaries', title: 'Ошибки на границе данных', summary: 'Безопасный разбор JSON и восстановление после повреждённого ввода',
      blocks: [
        { type: 'text', markdown: `Внешние данные нельзя считать корректными заранее. \`JSON.parse\` выбрасывает \`SyntaxError\`, если строка повреждена, поэтому разбор — естественная граница для узкого \`try…catch\`.

После успешного разбора код должен сохранить весь объект, а не только изменяемое поле. При записи в веб-хранилище объект снова превращают в строку через \`JSON.stringify\`.

Хорошая структура функции разделяет три шага: прочитать и разобрать, изменить данные, записать результат. В \`catch\` остаётся только известный сценарий восстановления.` },
        { type: 'article', url: 'https://learn.javascript.ru/localstorage', title: 'LocalStorage и sessionStorage', source: 'learn.javascript.ru' },
        quickQuiz('json-boundary', 'Где лучше всего перехватывать ошибку повреждённого JSON?', ['Вокруг JSON.parse', 'Вокруг всей программы', 'Внутри JSON.stringify', 'Ошибку нужно всегда игнорировать'], [0], 'Узкий try вокруг операции разбора точно показывает ожидаемую границу сбоя и не скрывает посторонние ошибки.'),
        { type: 'task', slug: 'safe-parse', optional: true, note: 'Разминка: разбор JSON в try…catch.' },
        { type: 'task', slug: 'increment-stored-counter', note: 'Восстановите объект счётчиков после ошибки разбора.' },
      ],
    },
    {
      slug: 'custom-errors', title: 'Собственные ошибки и повторные попытки', summary: 'Наследование от Error, повтор временных операций и сохранение контекста',
      blocks: [
        { type: 'text', markdown: `Собственный класс ошибки помогает вызывающему коду различать причины через \`instanceof\`, не анализируя текст сообщения.

\`class TemporaryError extends Error\` описывает временный сбой, после которого операцию можно повторить. \`NotFoundError\` сообщает о постоянной причине и должна сразу подняться выше. Лимит попыток защищает программу от бесконечного цикла.

Когда одна функция применяет callback ко многим значениям, иногда полезно собрать ошибки и продолжить обработку. Обёртка ошибки при этом должна хранить исходный аргумент и стек причины — иначе отладочная информация потеряется.` },
        { type: 'article', url: 'https://learn.javascript.ru/custom-errors', title: 'Пользовательские ошибки и наследование от Error', source: 'learn.javascript.ru' },
        quickQuiz('custom-error-kind', 'Почему код проверяет ошибку через instanceof?', ['Чтобы различить тип причины независимо от текста', 'Чтобы автоматически исправить ошибку', 'Чтобы удалить стек вызовов', 'Потому что message всегда пустой'], [0], 'Тип ошибки — устойчивый контракт; текст сообщения может меняться и предназначен прежде всего для человека.'),
        { type: 'task', slug: 'validation-error', optional: true, note: 'Разминка: собственный класс ошибки.' },
        { type: 'task', slug: 'repeatable-data', note: 'Повторяйте только временные ошибки и соблюдайте лимит.' },
        { type: 'task', slug: 'apply-functions', note: 'Соберите успешные результаты и ошибки, сохранив их контекст.' },
      ],
    },
  ],
  taskSlugs: ['to-positive-number', 'array-to-csv', 'safe-parse', 'increment-stored-counter', 'validation-error', 'repeatable-data', 'apply-functions'],
};
