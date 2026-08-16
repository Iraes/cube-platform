import type { AlgorithmTask } from '@/lib/runner/types';

export const uniqueSet: AlgorithmTask = {
  kind: 'algorithm', slug: 'unique-set', title: 'Уникальные значения', language: 'javascript',
  description: `Реализуйте \`unique(values)\` с помощью \`Set\`. Верните новый массив без повторов, сохранив порядок первого появления элементов. Исходный массив не изменяйте.`,
  starterCode: `function unique(values) {

}
`,
  tests: [
    { name: 'Удаляет повторы и сохраняет порядок', fn: 'unique', input: [[1, 2, 3, 3, 4, 4]], expected: [1, 2, 3, 4] },
    { name: 'Работает со строками', fn: 'unique', input: [['js', 'go', 'js', 'vue']], expected: ['js', 'go', 'vue'] },
    { name: 'Пустой массив остаётся пустым', fn: 'unique', input: [[]], expected: [] },
  ],
};
