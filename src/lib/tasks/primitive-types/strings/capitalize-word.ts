import type { AlgorithmTask } from '@/lib/runner/types';
export const capitalizeWord: AlgorithmTask = {
  kind: 'algorithm', slug: 'capitalize-word', title: 'Слово с большой буквы', language: 'javascript',
  description: `Ступенька к задаче \`Capitalize\`. Здесь всего одно слово: реализуйте \`capitalizeWord(word)\` — первая буква заглавная, остальные строчные.

Строку нельзя изменить по месту, \`word[0] = 'А'\` ничего не сделает. Соберите новую строку из двух кусков: первый символ и всё остальное. Пригодятся \`toUpperCase()\`, \`toLowerCase()\` и \`slice(1)\`.

Разберётесь здесь — задача про целую фразу сведётся к тому же самому для каждого слова.`,
  starterCode: `function capitalizeWord(word) {

}
`,
  tests: [
    { name: "capitalizeWord('мир') → 'Мир'", fn: 'capitalizeWord', input: ['мир'], expected: 'Мир' },
    { name: "Лишние заглавные убираются: capitalizeWord('ПРИВЕТ') → 'Привет'", fn: 'capitalizeWord', input: ['ПРИВЕТ'], expected: 'Привет' },
    { name: "Разнобой: capitalizeWord('пРиВеТ') → 'Привет'", fn: 'capitalizeWord', input: ['пРиВеТ'], expected: 'Привет' },
    { name: "Одна буква: capitalizeWord('a') → 'A'", fn: 'capitalizeWord', input: ['a'], expected: 'A' },
    { name: "Пустая строка: capitalizeWord('') → ''", fn: 'capitalizeWord', input: [''], expected: '' },
  ],
};
