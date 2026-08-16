import type { QuizTask } from '@/lib/runner/types';

export const dataTypesQuiz: QuizTask = {
  kind: 'quiz',
  slug: 'data-types-quiz',
  title: 'Тест: типы данных',
  description: `Проверим, что осталось в голове после теории. Где-то верный ответ один, где-то несколько — об этом написано под вопросом.

Отвечать можно сколько угодно раз: тест засчитается, когда все ответы будут верными.`,
  questions: [
    {
      id: 'primitives',
      text: 'Какие из перечисленных типов относятся к примитивным?',
      options: [
        { id: 'string', text: 'string' },
        { id: 'number', text: 'number' },
        { id: 'object', text: 'object' },
        { id: 'boolean', text: 'boolean' },
        { id: 'array', text: 'array' },
      ],
      correct: ['string', 'number', 'boolean'],
      explanation:
        'Примитивов семь: string, number, boolean, null, undefined, symbol и bigint. Объекты и массивы к ним не относятся — массив вообще не отдельный тип, а разновидность объекта.',
    },
    {
      id: 'typeof-null',
      text: 'Что вернёт typeof null?',
      options: [
        { id: 'null', text: "'null'" },
        { id: 'object', text: "'object'" },
        { id: 'undefined', text: "'undefined'" },
        { id: 'error', text: 'Выбросит ошибку' },
      ],
      correct: ['object'],
      explanation:
        "typeof null === 'object' — это известная ошибка в языке, которую оставили ради совместимости. Проверять на null нужно строгим сравнением: value === null.",
    },
    {
      id: 'undefined-vs-null',
      text: 'Какие утверждения про null и undefined верны?',
      options: [
        { id: 'auto', text: 'undefined появляется само: у необъявленного значения или у функции без return' },
        { id: 'manual', text: 'null обычно ставит программист, чтобы сказать «пусто»' },
        { id: 'strict-equal', text: 'null === undefined' },
        { id: 'loose-equal', text: 'null == undefined' },
      ],
      correct: ['auto', 'manual', 'loose-equal'],
      explanation:
        'При строгом сравнении null === undefined ложно: типы разные. А нестрогое null == undefined истинно — это особый случай в правилах приведения.',
    },
    {
      id: 'number-check',
      text: 'Что вернёт typeof NaN?',
      options: [
        { id: 'nan', text: "'NaN'" },
        { id: 'number', text: "'number'" },
        { id: 'undefined', text: "'undefined'" },
        { id: 'object', text: "'object'" },
      ],
      correct: ['number'],
      explanation:
        'NaN означает «не число», но по типу это именно number. Проверять на него нужно через Number.isNaN(value): сравнение NaN === NaN всегда ложно.',
    },
  ],
};
