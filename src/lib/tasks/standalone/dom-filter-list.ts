import type { DomTask } from '@/lib/runner/types';

export const domFilterList: DomTask = {
  kind: 'dom',
  slug: 'dom-filter-list',
  title: 'Живой поиск по списку',
  language: 'javascript',
  description: `Страница команды: список сотрудников и поле поиска. Нужен «живой» фильтр — список сужается прямо во время набора текста.

Пригодится:

- событие \`input\` — срабатывает при каждом изменении поля;
- \`document.querySelectorAll('#user-list li')\` — все элементы списка, их можно перебрать циклом \`for...of\`;
- \`el.textContent.toLowerCase()\` — текст без учёта регистра;
- \`el.classList.toggle('hidden', условие)\` — добавляет класс, когда условие истинно, и убирает, когда ложно.

В стилях страницы есть служебный класс \`hidden\` — элемент с ним не отображается.

**Задание**

При вводе в поле \`#search\` скрывайте сотрудников, чьё имя **не содержит** введённый текст: добавляйте им класс \`hidden\`, а подходящим — убирайте. Регистр значения не имеет: «ЛИ» и «ли» должны находить одно и то же. Пустой запрос показывает всех.`,
  starterCode: `const search = document.querySelector('#search');
const items = document.querySelectorAll('#user-list li');

search.addEventListener('input', () => {
  const query = search.value.toLowerCase();
  // пройдите по items и переключите каждому класс hidden
});
`,
  html: `<div class="team">
  <h3 class="team__title">Команда</h3>
  <input id="search" class="team__input" type="text" placeholder="Поиск по имени…">
  <ul id="user-list" class="team__list">
    <li class="team__item">Анна Смирнова</li>
    <li class="team__item">Борис Ковалёв</li>
    <li class="team__item">Вероника Ли</li>
    <li class="team__item">Дмитрий Орлов</li>
    <li class="team__item">Светлана Гусева</li>
  </ul>
</div>`,
  css: `.team { max-width: 380px; margin: 0 auto; padding: 26px; background: #fff; border-radius: 14px; box-shadow: 0 2px 10px rgba(40,50,60,.08); }
.team__title { margin: 0 0 14px; color: #2b3540; }
.team__input { width: 100%; padding: 10px 12px; border: 1px solid #c9d0d7; border-radius: 8px; font-size: 15px; }
.team__input:focus { outline: none; border-color: #35495e; }
.team__list { list-style: none; margin: 14px 0 0; padding: 0; }
.team__item { padding: 10px 12px; border-bottom: 1px solid #edf0f2; color: #3c4650; }
.team__item:last-child { border-bottom: none; }
.hidden { display: none !important; }`,
  checks: [
    {
      name: 'Запрос «ан» оставляет Анну Смирнову и Светлану Гусеву',
      body: `typeInto('#search', 'ан');
      const visible = findAll('#user-list li')
        .filter((li) => !li.classList.contains('hidden'))
        .map((li) => li.textContent.trim());
      assertEqual(visible, ['Анна Смирнова', 'Светлана Гусева'], 'видимые сотрудники');`,
    },
    {
      name: 'Регистр не важен: «ЛИ» находит Веронику Ли',
      body: `typeInto('#search', 'ЛИ');
      const visible = findAll('#user-list li')
        .filter((li) => !li.classList.contains('hidden'))
        .map((li) => li.textContent.trim());
      assertEqual(visible, ['Вероника Ли'], 'видимые сотрудники — приведите к нижнему регистру и запрос, и имя');`,
    },
    {
      name: 'Ничего не найдено: список пуст',
      body: `typeInto('#search', 'щщщ');
      const visible = findAll('#user-list li').filter((li) => !li.classList.contains('hidden'));
      assertEqual(visible.length, 0, 'количество видимых сотрудников');`,
    },
    {
      name: 'Пустой запрос снова показывает всех',
      body: `typeInto('#search', '');
      const visible = findAll('#user-list li').filter((li) => !li.classList.contains('hidden'));
      assertEqual(visible.length, 5, 'количество видимых сотрудников — класс hidden нужно не только добавлять, но и убирать');`,
    },
  ],
};
