import type { AlgorithmTask } from '@/lib/runner/types';

export const storageCounter: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'storage-counter',
  title: 'Счётчик визитов в хранилище',
  language: 'javascript',
  description: `Веб-хранилище умеет держать только строки. Поэтому объект перед записью превращают в строку через \`JSON.stringify\`, а при чтении разбирают обратно через \`JSON.parse\`.

Реализуйте \`countVisit(storage, page)\`: увеличьте на единицу счётчик визитов страницы \`page\` и верните получившийся объект со всеми счётчиками.

\`storage\` устроен как \`localStorage\`: у него есть \`getItem(key)\` и \`setItem(key, value)\`. Всё лежит под ключом \`'visits'\`.

Три случая, которые нужно развести:

- ключа ещё нет — \`getItem\` вернёт \`null\`, начинаем с пустого объекта;
- строка есть, но повреждена — \`JSON.parse\` выбросит \`SyntaxError\`. Не дайте ей выбраться наружу: перехватите и начните с пустого объекта, иначе одна испорченная запись сломает страницу навсегда;
- страницу видим впервые — счётчика нет, ставим 1.

Записывать обратно нужно **весь** объект, а не только изменившееся поле: иначе счётчики остальных страниц потеряются.

Настоящий \`localStorage\` в песочнице задач недоступен — код выполняется в изолированном origin. Поэтому хранилище передаётся аргументом; в браузере вместо него будет \`localStorage\`, а код останется тем же.`,
  starterCode: `function countVisit(storage, page) {

}

function checkVisits(initial, pages) {
  const box = { value: initial };
  const storage = {
    getItem: (key) => (key === 'visits' ? box.value : null),
    setItem: (key, value) => { if (key === 'visits') box.value = value; },
  };
  let last = null;
  for (const page of pages) last = countVisit(storage, page);
  return { returned: last, stored: box.value };
}
`,
  tests: [
    {
      name: 'Пустое хранилище: первый визит даёт единицу',
      fn: 'checkVisits',
      input: [null, ['/']],
      expected: { returned: { '/': 1 }, stored: '{"/":1}' },
    },
    {
      name: 'Повторные визиты накапливаются',
      fn: 'checkVisits',
      input: [null, ['/', '/', '/']],
      expected: { returned: { '/': 3 }, stored: '{"/":3}' },
    },
    {
      name: 'Счётчики других страниц сохраняются',
      fn: 'checkVisits',
      input: ['{"/":5}', ['/about']],
      expected: { returned: { '/': 5, '/about': 1 }, stored: '{"/":5,"/about":1}' },
    },
    {
      name: 'Повреждённая запись не роняет функцию, счёт начинается заново',
      fn: 'checkVisits',
      input: ['{это не json', ['/']],
      expected: { returned: { '/': 1 }, stored: '{"/":1}' },
    },
    {
      name: 'Существующий счётчик увеличивается, а не сбрасывается',
      fn: 'checkVisits',
      input: ['{"/":2,"/faq":7}', ['/faq']],
      expected: { returned: { '/': 2, '/faq': 8 }, stored: '{"/":2,"/faq":8}' },
    },
  ],
};
