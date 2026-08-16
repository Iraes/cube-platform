import type { AlgorithmTask } from '@/lib/runner/types';

export const prototypeDecorator: AlgorithmTask = {
  kind: 'algorithm', slug: 'prototype-decorator', title: 'Декоратор в прототипе', language: 'javascript',
  description: `Метод \`add\` класса \`Addition\` менять нельзя. Замените его через \`Addition.prototype\` декоратором: при каждом вызове он должен выводить в консоль \`called\`, сохранять контекст и аргументы и возвращать исходный результат. Пишите код только в отмеченной зоне.`,
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

function checkAdditionDecorator(value, numbers) {
  return new Addition(value).add(...numbers);
}
`,
  tests: [
    { name: 'Сохраняет результат исходного метода', fn: 'checkAdditionDecorator', input: [5, [3, 5, 6]], expected: 19 },
    { name: 'Работает с другим экземпляром и набором аргументов', fn: 'checkAdditionDecorator', input: [10, [-2, 4]], expected: 12 },
  ],
};
