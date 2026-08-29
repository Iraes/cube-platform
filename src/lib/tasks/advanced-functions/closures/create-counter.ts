import type { AlgorithmTask } from '@/lib/runner/types';
export const createCounter: AlgorithmTask = {
  kind: 'algorithm', slug: 'create-counter', title: 'Счётчик на замыкании', language: 'javascript',
  description: `Ступенька к \`Once\`. Классическая задача на замыкание.

Реализуйте \`createCounter()\`: она возвращает функцию, которая при каждом вызове выдаёт число на единицу больше предыдущего, начиная с единицы.

\`\`\`js
const next = createCounter();
next(); // 1
next(); // 2
\`\`\`

Переменную со счётчиком объявите **внутри** \`createCounter\`, до \`return\`. Возвращённая функция продолжает видеть эту переменную и после того, как \`createCounter\` завершилась — это и называется замыканием. Снаружи до переменной не добраться никак.

Деталь, которую ловит последняя проверка: каждый вызов \`createCounter()\` создаёт **свою** переменную, и два счётчика не должны мешать друг другу. Объявите переменную снаружи — они станут общими, и проверка это поймает.

В \`Once\` будет то же самое, только в замыкании хранится не число, а флаг «уже вызывали».`,
  starterCode: `function createCounter() {

}

function checkCounter(times) {
  const next = createCounter();
  const results = [];
  for (let i = 0; i < times; i += 1) results.push(next());
  return results;
}

function checkIndependent() {
  const first = createCounter();
  const second = createCounter();
  return [first(), first(), second()];
}
`,
  tests: [
    { name: 'Три вызова подряд → [1, 2, 3]', fn: 'checkCounter', input: [3], expected: [1, 2, 3] },
    { name: 'Первый вызов возвращает 1', fn: 'checkCounter', input: [1], expected: [1] },
    { name: 'Счётчики независимы друг от друга → [1, 2, 1]', fn: 'checkIndependent', input: [], expected: [1, 2, 1] },
  ],
};
