import type { DomTask } from '@/lib/runner/types';

export const domToggleBox: DomTask = {
  kind: 'dom',
  slug: 'dom-toggle-box',
  title: 'Оживи кнопку',
  language: 'javascript',
  description: `Первая задача с настоящей страницей. Справа — фрагмент сайта: серый блок и кнопка. Стили уже написаны, не хватает только логики.

Нужные инструменты:

\`\`\`js
const el = document.querySelector('#id');
el.addEventListener('click', () => {
  // что делать по клику
});
el.classList.add('имя-класса');
\`\`\`

**Задание**

По клику на кнопку \`#paint-btn\` добавьте блоку \`#box\` класс \`box--active\` — в стилях он красит блок в зелёный.

Нажмите «Запустить» и кликните по кнопке в превью: код подключается к живой странице, с ней можно возиться руками. «Отправить на проверку» прогонит проверки в отдельной копии страницы.`,
  starterCode: `// 1. Найдите кнопку #paint-btn и блок #box

// 2. Повесьте на кнопку обработчик клика,
//    внутри добавьте блоку класс box--active
`,
  html: `<div class="widget">
  <div id="box" class="box"></div>
  <button id="paint-btn" class="btn">Покрасить</button>
</div>`,
  css: `.widget { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 24px; }
.box { width: 130px; height: 130px; border-radius: 14px; background: #d5d8dc; transition: background .3s; }
.box--active { background: #4caf7d; }
.btn { padding: 10px 26px; border: none; border-radius: 8px; background: #35495e; color: #fff; font-size: 15px; cursor: pointer; }
.btn:hover { background: #42586f; }`,
  checks: [
    {
      name: 'До клика у блока нет класса box--active',
      body: `assert(
        !find('#box').classList.contains('box--active'),
        'класс box--active должен появляться только после клика, а не сразу'
      );`,
    },
    {
      name: 'Клик по кнопке добавляет блоку класс box--active',
      body: `click('#paint-btn');
      assert(
        find('#box').classList.contains('box--active'),
        'клик по #paint-btn не добавил блоку класс box--active — проверьте, что обработчик повешен на кнопку'
      );`,
    },
    {
      name: 'Класс добавляется именно по клику, а не по любому событию',
      body: `const box = find('#box');
      box.classList.remove('box--active');
      find('#paint-btn').dispatchEvent(new Event('mouseover', { bubbles: true }));
      assert(
        !box.classList.contains('box--active'),
        'класс появился без клика — обработчик повешен не на то событие'
      );
      click('#paint-btn');
      assert(box.classList.contains('box--active'), 'после клика класс должен вернуться');`,
    },
  ],
};
