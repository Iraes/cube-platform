import type { AlgorithmTask } from '@/lib/runner/types';

export const prototypeDecorator: AlgorithmTask = {
  kind: 'algorithm', slug: 'prototype-decorator', title: 'Декоратор в прототипе', language: 'javascript',
  description: `Метод \`add\` класса \`Addition\` менять нельзя — считайте, что класс пришёл из чужой библиотеки. Задача: добавить к нему поведение снаружи, не трогая исходный код.

Замените метод через \`Addition.prototype\`: сохраните ссылку на исходный, положите на его место свою функцию, а внутри неё выведите в консоль \`called\` и верните результат исходного метода.

Три вещи, на которых эта задача обычно и ломается:

- **Контекст.** Вызывать исходный метод нужно через \`apply(this, аргументы)\` или \`call\`. Простой вызов \`original(...)\` потеряет \`this\`, и \`this.value\` станет недоступен.
- **Аргументы.** Их произвольное количество — соберите через \`...numbers\` и передайте дальше целиком.
- **Стрелочная функция не подойдёт.** У неё нет своего \`this\`, а он здесь и нужен.

Пишите код только в отмеченной зоне. Служебные функции не изменяйте.`,
  starterCode: `class Addition {
  constructor(value) {
    this.value = value;
  }

  add(...numbers) {
    return this.value + numbers.reduce((sum, number) => sum + number, 0);
  }
}

// --- ваш код начинается здесь ---


// --- ваш код заканчивается здесь ---

/** Ловит вывод в консоль, чтобы проверка увидела работу декоратора */
function captureLog(action) {
  const messages = [];
  const original = console.log;
  console.log = function (...args) { messages.push(args.join(' ')); };
  try {
    return { result: action(), messages };
  } finally {
    console.log = original;
  }
}

function checkAdditionDecorator(value, numbers) {
  return captureLog(() => new Addition(value).add(...numbers));
}

function checkTwoCalls() {
  const captured = captureLog(() => {
    const first = new Addition(1).add(2);
    const second = new Addition(10).add(5, 5);
    return [first, second];
  });
  return { results: captured.result, logCount: captured.messages.length };
}
`,
  tests: [
    {
      name: 'Декоратор выводит called и сохраняет результат',
      fn: 'checkAdditionDecorator',
      input: [5, [3, 5, 6]],
      expected: { result: 19, messages: ['called'] },
    },
    {
      name: 'Контекст не потерян: this.value берётся у нужного экземпляра',
      fn: 'checkAdditionDecorator',
      input: [10, [-2, 4]],
      expected: { result: 12, messages: ['called'] },
    },
    {
      name: 'Аргументы передаются полностью, сколько бы их ни было',
      fn: 'checkAdditionDecorator',
      input: [0, [1, 2, 3, 4, 5]],
      expected: { result: 15, messages: ['called'] },
    },
    {
      name: 'Вызов без аргументов тоже проходит через декоратор',
      fn: 'checkAdditionDecorator',
      input: [7, []],
      expected: { result: 7, messages: ['called'] },
    },
    {
      name: 'На каждый вызов ровно одна запись в консоли',
      fn: 'checkTwoCalls',
      input: [],
      expected: { results: [3, 20], logCount: 2 },
    },
  ],
};
