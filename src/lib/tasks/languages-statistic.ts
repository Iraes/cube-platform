import type { AlgorithmTask } from '@/lib/runner/types';

export const languagesStatistic: AlgorithmTask = {
  kind: 'algorithm', slug: 'languages-statistic', title: 'Статистика языков', language: 'javascript',
  description: `Реализуйте \`getLanguagesStatistic(reviews)\`. Учтите только отзывы за 2019 год и верните объект, где ключ — язык программирования, а значение — количество отзывов об этом языке.`,
  starterCode: `function getLanguagesStatistic(reviews) {

}
`,
  tests: [
    { name: 'Считает только отзывы 2019 года', fn: 'getLanguagesStatistic', input: [[{ language: 'C', year: 2019 }, { language: 'JavaScript', year: 2019 }, { language: 'JavaScript', year: 2019 }, { language: 'Ruby', year: 2014 }]], expected: { C: 1, JavaScript: 2 } },
    { name: 'Пустой список даёт пустую статистику', fn: 'getLanguagesStatistic', input: [[]], expected: {} },
  ],
};
