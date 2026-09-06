import type { DomTask } from '@/lib/runner/types';

export const domRenderList: DomTask = {
  kind: 'dom',
  slug: 'dom-render-list',
  title: 'Отрисовать список из массива',
  language: 'javascript',
  description: `Ключевой приём всей работы с DOM: данные отдельно, разметка отдельно.

Реализуйте \`renderTodos(items)\` — она принимает массив строк и выводит их в список \`#todo-list\`. Каждый элемент — это \`<li>\` с классом \`todo\` и текстом задачи.

Функция должна **перерисовывать список целиком**: сначала очистить, потом заполнить. Тогда её можно звать при каждом изменении данных и не думать, что именно поменялось. Очистить проще всего через \`list.innerHTML = ''\`.

Создать элемент — \`document.createElement('li')\`, вставить — \`list.append(элемент)\`.

Текст записывайте через \`textContent\`, а не \`innerHTML\`. Последняя проверка объясняет почему: если задача называется \`<b>срочно</b>\`, то \`innerHTML\` превратит её в разметку, и в списке окажется жирное слово вместо честного текста. С данными от пользователя так подставляют и чужой код.`,
  starterCode: `function renderTodos(items) {

}
`,
  html: `<div class="board">
  <h3 class="board__title">Дела на сегодня</h3>
  <ul id="todo-list" class="board__list"></ul>
</div>`,
  css: `.board { max-width: 360px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 14px; box-shadow: 0 2px 10px rgba(40,50,60,.08); }
.board__title { margin: 0 0 14px; color: #2b3540; }
.board__list { list-style: none; margin: 0; padding: 0; }
.todo { padding: 10px 12px; border-bottom: 1px solid #edf0f2; color: #3c4650; }
.todo:last-child { border-bottom: none; }`,
  checks: [
    {
      name: 'Каждая строка стала элементом списка с классом todo',
      body: `renderTodos(['Купить хлеб', 'Позвонить маме']);
      const items = findAll('#todo-list li');
      assertEqual(items.length, 2, 'количество элементов списка');
      assertEqual(items.map((li) => li.textContent), ['Купить хлеб', 'Позвонить маме'], 'тексты элементов');
      assert(items.every((li) => li.classList.contains('todo')), 'каждому элементу нужен класс todo');`,
    },
    {
      name: 'Повторный вызов перерисовывает список, а не дописывает',
      body: `renderTodos(['Только одно дело']);
      const items = findAll('#todo-list li');
      assertEqual(items.length, 1, 'количество элементов после повторной отрисовки — список нужно очищать');
      assertEqual(items[0].textContent, 'Только одно дело', 'текст единственного элемента');`,
    },
    {
      name: 'Пустой массив очищает список',
      body: `renderTodos([]);
      assertEqual(findAll('#todo-list li').length, 0, 'количество элементов для пустого массива');`,
    },
    {
      name: 'Текст вставляется как текст, а не как разметка',
      body: `renderTodos(['<b>срочно</b>']);
      const item = find('#todo-list li');
      assertEqual(item.textContent, '<b>срочно</b>', 'текст элемента');
      assertEqual(item.querySelectorAll('b').length, 0, 'разметки внутри быть не должно — используйте textContent');`,
    },
  ],
};
