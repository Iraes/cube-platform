import type { AlgorithmTask } from '@/lib/runner/types';

export const promiseAllTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'promise-all', title: 'Своя Promise.all', language: 'javascript',
  description: `Реализуйте \`promiseAll(promises)\` без стандартного \`Promise.all\`. Результаты должны сохранить исходный порядок, даже если промисы завершаются иначе. Пустой массив даёт разрешённый промис с \`[]\`; первый отказ отклоняет итоговый промис.`,
  starterCode: `function promiseAll(promises) {

}

async function checkPromiseAll(entries) {
  const promises = entries.map((entry) => new Promise((resolve, reject) => {
    setTimeout(() => entry.reject ? reject(entry.value) : resolve(entry.value), entry.delay);
  }));
  try { return { status: 'fulfilled', value: await promiseAll(promises) }; }
  catch (error) { return { status: 'rejected', value: error }; }
}
`,
  tests: [
    { name: 'Сохраняет порядок результатов', fn: 'checkPromiseAll', input: [[{ delay: 12, value: 1 }, { delay: 2, value: 2 }, { delay: 6, value: 3 }]], expected: { status: 'fulfilled', value: [1, 2, 3] } },
    { name: 'Разрешает пустой массив', fn: 'checkPromiseAll', input: [[]], expected: { status: 'fulfilled', value: [] } },
    { name: 'Пробрасывает отказ', fn: 'checkPromiseAll', input: [[{ delay: 1, value: 'нет', reject: true }, { delay: 5, value: 'да' }]], expected: { status: 'rejected', value: 'нет' } },
  ],
};
