import type { AlgorithmTask } from '@/lib/runner/types';

export const readOneFile: AlgorithmTask = {
  kind: 'algorithm', slug: 'read-one-file', title: 'Один вызов с колбэком', language: 'javascript',
  description: `Ступенька к «Сумме размеров файлов». Там нужно согласовать **два** асинхронных вызова; здесь — один.

Реализуйте \`readSize(name, getFileSize, onDone)\`. Функция \`getFileSize(name, callback)\` работает асинхронно: она не возвращает размер, а через какое-то время вызывает переданный ей \`callback\` с этим размером. Ваша задача — получить размер и вызвать \`onDone\` с ним.

Главное, что нужно здесь понять: **результат нельзя вернуть через \`return\`**. К моменту, когда \`readSize\` завершится, размер ещё не известен. Поэтому результат не возвращают, а передают дальше — в колбэк.

\`\`\`js
getFileSize(name, (size) => {
  // сюда попадём позже, когда размер станет известен
});
\`\`\`

Когда файлов станет два, добавится вопрос «как понять, что оба готовы» — и это будет следующая задача.`,
  starterCode: `function readSize(name, getFileSize, onDone) {

}

function checkReadSize(name, sizes, delay) {
  const calls = [];
  const getFileSize = (fileName, callback) => {
    setTimeout(() => callback(sizes[fileName]), delay);
  };
  return new Promise((resolve) => {
    readSize(name, getFileSize, (size) => {
      calls.push(size);
      resolve({ calls, first: calls[0] });
    });
    // если бы результат возвращали через return, здесь было бы уже поздно
    setTimeout(() => resolve({ calls, first: calls[0] }), delay + 30);
  });
}
`,
  tests: [
    {
      name: 'Размер уходит в onDone',
      fn: 'checkReadSize',
      input: ['a.txt', { 'a.txt': 120 }, 3],
      expected: { calls: [120], first: 120 },
    },
    {
      name: 'Работает и с другой задержкой',
      fn: 'checkReadSize',
      input: ['b.txt', { 'b.txt': 7 }, 10],
      expected: { calls: [7], first: 7 },
    },
    {
      name: 'onDone вызывается ровно один раз',
      fn: 'checkReadSize',
      input: ['c.txt', { 'c.txt': 0 }, 1],
      expected: { calls: [0], first: 0 },
    },
  ],
};
