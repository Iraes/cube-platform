import type { AlgorithmTask } from '@/lib/runner/types';
export const replaceItems: AlgorithmTask = {
  kind: 'algorithm', slug: 'replace-items', title: 'Replace Items', language: 'javascript',
  description: `Реализуйте две функции.

- \`replaceItemsClear(arr, item, replaceItem)\` возвращает новый массив с заменами и не изменяет исходный;
- \`replaceItemsMutate(arr, item, replaceItem)\` изменяет входной массив и возвращает его же.

В этой задаче проверки вызывают обе функции отдельно.`,
  starterCode: `function replaceItemsClear(arr, item, replaceItem) {

}

function replaceItemsMutate(arr, item, replaceItem) {

}
`,
  tests: [
    { name: 'Чистая функция заменяет все совпадения', fn: 'replaceItemsClear', input: [[1, 2, 3, 4, 2], 2, 'a'], expected: [1, 'a', 3, 4, 'a'] },
    { name: 'Чистая функция работает без совпадений', fn: 'replaceItemsClear', input: [[1, 2], 9, 0], expected: [1, 2] },
    { name: 'Мутирующая функция заменяет все совпадения', fn: 'replaceItemsMutate', input: [[1, 2, 3, 4, 2], 2, 'a'], expected: [1, 'a', 3, 4, 'a'] },
  ],
};
