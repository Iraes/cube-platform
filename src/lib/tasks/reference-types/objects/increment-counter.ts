import type { AlgorithmTask } from '@/lib/runner/types';
export const incrementCounter: AlgorithmTask = {
  kind: 'algorithm', slug: 'increment-counter', title: 'Счётчик в объекте', language: 'javascript',
  description: `Ступенька к \`Letters Count\`. Реализуйте \`increment(counter, key)\`: увеличьте на единицу значение по ключу \`key\` и верните этот же объект.

Главная тонкость — первый раз. Если ключа в объекте ещё нет, \`counter[key]\` вернёт \`undefined\`, а \`undefined + 1\` даст \`NaN\`. Значит, первое появление ключа нужно обработать отдельно и записать \`1\`.

Обращаться к свойству по переменной можно только через квадратные скобки: \`counter[key]\`. Запись \`counter.key\` искала бы свойство с именем «key».

Это ровно то, что происходит внутри подсчёта букв — только там ключи берутся из строки в цикле.`,
  starterCode: `function increment(counter, key) {

}
`,
  tests: [
    { name: "Новый ключ: increment({}, 'a') → { a: 1 }", fn: 'increment', input: [{}, 'a'], expected: { a: 1 } },
    { name: "Существующий ключ: increment({ a: 1 }, 'a') → { a: 2 }", fn: 'increment', input: [{ a: 1 }, 'a'], expected: { a: 2 } },
    { name: "Соседние ключи не трогаются", fn: 'increment', input: [{ a: 3 }, 'b'], expected: { a: 3, b: 1 } },
    { name: "Ключом может быть пробел", fn: 'increment', input: [{}, ' '], expected: { ' ': 1 } },
  ],
};
