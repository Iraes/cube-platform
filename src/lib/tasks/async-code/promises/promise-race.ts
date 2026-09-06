import type { AlgorithmTask } from '@/lib/runner/types';

export const promiseRaceTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'promise-race', title: 'Своя Promise.race', language: 'javascript',
  description: `Реализуйте \`promiseRace(promises)\` без вызова стандартного \`Promise.race\`. Верните новый промис, который принимает значение или причину отказа первого завершившегося промиса.`,
  starterCode: `function promiseRace(promises) {

}

async function checkPromiseRace(entries) {
  const promises = entries.map((entry) => new Promise((resolve, reject) => {
    setTimeout(() => entry.reject ? reject(entry.value) : resolve(entry.value), entry.delay);
  }));
  try { return { status: 'fulfilled', value: await promiseRace(promises) }; }
  catch (error) { return { status: 'rejected', value: error }; }
}
`,
  tests: [
    { name: 'Возвращает значение первого завершившегося промиса', fn: 'checkPromiseRace', input: [[{ delay: 12, value: 'медленно' }, { delay: 2, value: 'быстро' }]], expected: { status: 'fulfilled', value: 'быстро' } },
    { name: 'Пробрасывает первый отказ', fn: 'checkPromiseRace', input: [[{ delay: 10, value: 'успех' }, { delay: 1, value: 'ошибка', reject: true }]], expected: { status: 'rejected', value: 'ошибка' } },
  ],
};
