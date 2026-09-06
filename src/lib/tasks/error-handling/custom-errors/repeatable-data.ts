import type { AlgorithmTask } from '@/lib/runner/types';

export const repeatableData: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'repeatable-data',
  title: 'Повторяемый запрос данных',
  language: 'javascript',
  description: `Реализуйте \`getRepeatableData(getData, key, maxRequestsNumber)\`.

Функция вызывает \`getData(key)\` и действует в зависимости от результата:

- при успехе сразу возвращает полученное значение;
- \`NotFoundError\` и любую неизвестную ошибку пробрасывает без изменений;
- после \`TemporaryError\` повторяет вызов;
- если временная ошибка произошла на последней разрешённой попытке, выбрасывает \`AttemptsLimitExceeded\`;
- если \`maxRequestsNumber\` не передан, число попыток не ограничено.

\`maxRequestsNumber\` — это максимальное общее число вызовов \`getData\`. Не перехватывайте ошибку шире, чем нужно: успешный результат и невременные ошибки должны сохранить исходный смысл.

Классы ошибок и проверочную функцию изменять не нужно.`,
  starterCode: `class AttemptsLimitExceeded extends Error {
  constructor() {
    super('Лимит попыток исчерпан');
    this.name = 'AttemptsLimitExceeded';
  }
}

class NotFoundError extends Error {
  constructor() {
    super('Данные не найдены');
    this.name = 'NotFoundError';
  }
}

class TemporaryError extends Error {
  constructor() {
    super('Временная ошибка');
    this.name = 'TemporaryError';
  }
}

function getRepeatableData(getData, key, maxRequestsNumber) {

}

function checkRepeatableData(outcomes, key, maxRequestsNumber) {
  let calls = 0;
  function getData(requestKey) {
    const outcome = outcomes[Math.min(calls, outcomes.length - 1)];
    calls += 1;
    if (outcome === 'temporary') throw new TemporaryError();
    if (outcome === 'not-found') throw new NotFoundError();
    return outcome === 'key' ? requestKey : outcome;
  }

  try {
    const value = maxRequestsNumber === null
      ? getRepeatableData(getData, key)
      : getRepeatableData(getData, key, maxRequestsNumber);
    return { value, calls, error: null };
  } catch (error) {
    return { value: null, calls, error: error.name };
  }
}
`,
  tests: [
    { name: 'Возвращает результат успешного вызова', fn: 'checkRepeatableData', input: [['key'], 'profile', 3], expected: { value: 'profile', calls: 1, error: null } },
    { name: 'Пробрасывает NotFoundError', fn: 'checkRepeatableData', input: [['not-found'], 'profile', 3], expected: { value: null, calls: 1, error: 'NotFoundError' } },
    { name: 'Останавливается после исчерпания трёх попыток', fn: 'checkRepeatableData', input: [['temporary'], 'profile', 3], expected: { value: null, calls: 3, error: 'AttemptsLimitExceeded' } },
    { name: 'Возвращает данные после временных ошибок', fn: 'checkRepeatableData', input: [['temporary', 'temporary', 'key'], 'profile', 5], expected: { value: 'profile', calls: 3, error: null } },
    { name: 'Работает без ограничения числа попыток', fn: 'checkRepeatableData', input: [['temporary', 'temporary', 'temporary', 'готово'], 'profile', null], expected: { value: 'готово', calls: 4, error: null } },
  ],
};
