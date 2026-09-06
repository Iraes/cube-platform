import type { DomTask } from '@/lib/runner/types';

export const domFindElements: DomTask = {
  kind: 'dom',
  slug: 'dom-find-elements',
  title: 'Поиск элементов',
  language: 'javascript',
  description: `Первое знакомство с деревом документа. Справа — карточка товара, ничего нажимать не нужно: задача только про поиск.

Реализуйте \`describePage()\` — она возвращает объект с тремя полями:

- \`title\` — текст заголовка \`#title\`;
- \`tagCount\` — сколько на странице элементов с классом \`tag\`;
- \`firstTag\` — текст первого такого элемента.

\`querySelector\` возвращает **первый** подходящий элемент или \`null\`, если совпадений нет. \`querySelectorAll\` возвращает все — но не массив, а \`NodeList\`. У него есть \`length\` и \`forEach\`, а вот \`map\` и \`filter\` уже нет: если они нужны, превратите его в массив через \`Array.from(...)\`.

Текст элемента читается через \`textContent\`. У заголовка вокруг текста есть пробелы и перенос строки — уберите их методом \`trim()\`.`,
  starterCode: `function describePage() {

}
`,
  html: `<div class="card">
  <h2 id="title">
    Ноутбук Cube Pro
  </h2>
  <p class="card__price">89 990 ₽</p>
  <ul class="card__tags">
    <li class="tag">16 ГБ</li>
    <li class="tag">SSD 512 ГБ</li>
    <li class="tag">14 дюймов</li>
  </ul>
</div>`,
  css: `.card { max-width: 360px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 14px; box-shadow: 0 2px 10px rgba(40,50,60,.08); }
#title { margin: 0 0 8px; font-size: 20px; color: #2b3540; }
.card__price { margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #35495e; }
.card__tags { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0; padding: 0; }
.tag { padding: 4px 10px; border-radius: 999px; background: #eef1f4; font-size: 13px; color: #5c6670; }`,
  checks: [
    {
      name: 'Заголовок прочитан и очищен от пробелов',
      body: `const result = describePage();
      assertEqual(result.title, 'Ноутбук Cube Pro', 'поле title — не забудьте trim()');`,
    },
    {
      name: 'Посчитаны все элементы с классом tag',
      body: `assertEqual(describePage().tagCount, 3, 'поле tagCount');`,
    },
    {
      name: 'Взят текст первого тега',
      body: `assertEqual(describePage().firstTag, '16 ГБ', 'поле firstTag');`,
    },
    {
      name: 'Считается именно класс tag, а не все элементы списка',
      body: `const extra = document.createElement('li');
      extra.textContent = 'без класса';
      find('.card__tags').appendChild(extra);
      assertEqual(describePage().tagCount, 3, 'поле tagCount после добавления элемента без класса tag');`,
    },
  ],
};
