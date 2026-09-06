import type { AlgorithmTask } from '@/lib/runner/types';

export const makePromise: AlgorithmTask = {
  kind: 'algorithm', slug: 'make-promise', title: 'Создать промис вручную', language: 'javascript',
  description: `Ступенька к «Своей Promise.all» и «Своей Promise.race». Чтобы написать их, нужно уметь создавать промис самому — этим и займёмся.

Реализуйте \`makePromise(value, shouldFail, delay)\`: верните промис, который через \`delay\` миллисекунд **разрешается** значением \`value\`, а если \`shouldFail\` истинно — **отклоняется** с \`new Error(value)\`.

Конструктор получает функцию с двумя аргументами:

\`\`\`js
new Promise((resolve, reject) => {
  // вызовите ровно один из них, когда результат готов
});
\`\`\`

Три правила, которые дальше понадобятся:

- промис переходит в конечное состояние **один раз**; повторные вызовы \`resolve\` и \`reject\` ничего не делают;
- вызвать их можно откуда угодно, в том числе из \`setTimeout\` — именно так и оборачивают асинхронный код в промис;
- отклонять принято объектом ошибки, а не строкой: у ошибки есть \`name\`, \`message\` и стек.

Служебную функцию не изменяйте.`,
  starterCode: `function makePromise(value, shouldFail, delay) {

}

async function checkPromise(value, shouldFail, delay) {
  const started = Date.now();
  try {
    const result = await makePromise(value, shouldFail, delay);
    return { status: 'resolved', result, waited: Date.now() - started >= delay };
  } catch (error) {
    return { status: 'rejected', message: error && error.message, isError: error instanceof Error };
  }
}
`,
  tests: [
    {
      name: 'Разрешается переданным значением',
      fn: 'checkPromise',
      input: ['готово', false, 5],
      expected: { status: 'resolved', result: 'готово', waited: true },
    },
    {
      name: 'Отклоняется объектом ошибки',
      fn: 'checkPromise',
      input: ['всё сломалось', true, 3],
      expected: { status: 'rejected', message: 'всё сломалось', isError: true },
    },
    {
      name: 'Нулевая задержка тоже работает',
      fn: 'checkPromise',
      input: [42, false, 0],
      expected: { status: 'resolved', result: 42, waited: true },
    },
  ],
};
