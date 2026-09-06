import type { DomTask } from '@/lib/runner/types';

export const domDelegateClicks: DomTask = {
  kind: 'dom',
  slug: 'dom-delegate-clicks',
  title: 'Делегирование событий',
  language: 'javascript',
  description: `Список товаров, у каждого кнопка «Удалить». Вешать обработчик на каждую кнопку — плохая идея: элементы появляются и исчезают, и на новые кнопки обработчик не попадёт.

Делегирование решает это иначе: **один** обработчик на общего предка. Событие всплывает от кнопки вверх, предок его ловит и по \`event.target\` понимает, кого нажали.

Реализуйте \`setupList()\`: повесьте один обработчик клика на \`#goods\` так, чтобы клик по кнопке с классом \`remove\` удалял её строку \`li\`.

Пригодятся:

- \`event.target\` — элемент, по которому кликнули на самом деле;
- \`target.closest('li')\` — ближайший предок нужного вида, считая сам элемент;
- \`element.remove()\` — удалить элемент из документа.

Клик мимо кнопки — по названию товара или по пустому месту списка — не должен удалять ничего. Проверьте это условием, иначе \`closest\` найдёт строку и при клике по тексту.

Последняя проверка добавляет новый товар уже после вызова \`setupList\` и жмёт удаление у него: с делегированием это работает само, и в этом весь смысл приёма.`,
  starterCode: `function setupList() {

}
`,
  html: `<div class="goods">
  <h3 class="goods__title">Корзина</h3>
  <ul id="goods" class="goods__list">
    <li class="goods__item"><span>Кофе</span><button class="remove" type="button">Удалить</button></li>
    <li class="goods__item"><span>Молоко</span><button class="remove" type="button">Удалить</button></li>
    <li class="goods__item"><span>Печенье</span><button class="remove" type="button">Удалить</button></li>
  </ul>
</div>`,
  css: `.goods { max-width: 360px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 14px; box-shadow: 0 2px 10px rgba(40,50,60,.08); }
.goods__title { margin: 0 0 14px; color: #2b3540; }
.goods__list { list-style: none; margin: 0; padding: 0; }
.goods__item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #edf0f2; color: #3c4650; }
.goods__item:last-child { border-bottom: none; }
.remove { border: none; border-radius: 6px; background: #f0d7d4; color: #bb4a3f; padding: 6px 12px; font-size: 13px; cursor: pointer; }
.remove:hover { background: #e8c4bf; }`,
  checks: [
    {
      name: 'Клик по кнопке удаляет её строку',
      body: `setupList();
      click(findAll('#goods .remove')[1]);
      const names = findAll('#goods li span').map((el) => el.textContent);
      assertEqual(names, ['Кофе', 'Печенье'], 'оставшиеся товары');`,
    },
    {
      name: 'Клик по названию товара ничего не удаляет',
      body: `click(find('#goods li span'));
      assertEqual(findAll('#goods li').length, 2, 'количество строк после клика мимо кнопки');`,
    },
    {
      name: 'Обработчик один, а не по одному на кнопку',
      body: `const list = find('#goods');
      const clone = list.cloneNode(true);
      list.replaceWith(clone);
      assertEqual(findAll('#goods li').length, 2, 'подмена списка не должна ломать проверку');
      // после подмены обработчик снят вместе со старым узлом — восстанавливаем
      setupList();
      click(find('#goods .remove'));
      assertEqual(findAll('#goods li').length, 1, 'количество строк после удаления');`,
    },
    {
      name: 'Работает и для товаров, добавленных после установки обработчика',
      body: `const item = document.createElement('li');
      item.className = 'goods__item';
      item.innerHTML = '<span>Чай</span><button class="remove" type="button">Удалить</button>';
      find('#goods').append(item);
      assertEqual(findAll('#goods li').length, 2, 'товар добавлен');
      click(findAll('#goods .remove')[1]);
      const names = findAll('#goods li span').map((el) => el.textContent);
      assertEqual(names.length, 1, 'новый товар тоже должен удаляться — в этом смысл делегирования');`,
    },
  ],
};
