import type { DomTask } from '@/lib/runner/types';

export const domSetAttributes: DomTask = {
  kind: 'dom',
  slug: 'dom-set-attributes',
  title: 'Атрибуты и свойства',
  language: 'javascript',
  description: `Реализуйте \`setupLink(url, text)\`: настройте ссылку \`#link\` так, чтобы она вела на \`url\`, показывала \`text\` и открывалась в новой вкладке.

Что нужно сделать:

- записать адрес в \`href\`;
- поставить \`target="_blank"\`;
- добавить \`rel="noreferrer noopener"\` — без этого открытая страница получает доступ к \`window.opener\` и может подменить вашу вкладку;
- заменить текст ссылки.

**Атрибут и свойство — не одно и то же.** Атрибут написан в HTML и всегда строка; свойство живёт в DOM-объекте и может быть другого типа. У \`href\` они отличаются заметно: атрибут хранит то, что записали, а свойство \`elem.href\` возвращает **абсолютный** адрес. Поэтому проверка читает атрибут через \`getAttribute('href')\`, а не свойство.

Работать можно и через \`setAttribute(имя, значение)\`, и через свойства вроде \`elem.target\`. Для \`rel\` и \`href\` в этой задаче используйте \`setAttribute\`.`,
  starterCode: `function setupLink(url, text) {

}
`,
  html: `<div class="panel">
  <p class="panel__hint">Ссылка на документацию:</p>
  <a id="link" class="panel__link" href="#">ссылка ещё не настроена</a>
</div>`,
  css: `.panel { max-width: 380px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 14px; box-shadow: 0 2px 10px rgba(40,50,60,.08); }
.panel__hint { margin: 0 0 10px; color: #7a838c; font-size: 13px; }
.panel__link { color: #35495e; font-size: 16px; font-weight: 500; }`,
  checks: [
    {
      name: 'Адрес записан в атрибут href',
      body: `setupLink('https://learn.javascript.ru/dom-attributes-and-properties', 'Атрибуты и свойства');
      assertEqual(
        find('#link').getAttribute('href'),
        'https://learn.javascript.ru/dom-attributes-and-properties',
        'атрибут href'
      );`,
    },
    {
      name: 'Текст ссылки заменён',
      body: `assertEqual(find('#link').textContent.trim(), 'Атрибуты и свойства', 'текст ссылки');`,
    },
    {
      name: 'Ссылка открывается в новой вкладке и не отдаёт window.opener',
      body: `const link = find('#link');
      assertEqual(link.getAttribute('target'), '_blank', 'атрибут target');
      const rel = (link.getAttribute('rel') || '').split(' ').filter(Boolean).sort();
      assertEqual(rel, ['noopener', 'noreferrer'], 'атрибут rel');`,
    },
    {
      name: 'Повторный вызов настраивает ссылку заново',
      body: `setupLink('https://developer.mozilla.org/ru/', 'MDN');
      assertEqual(find('#link').getAttribute('href'), 'https://developer.mozilla.org/ru/', 'атрибут href после повторного вызова');
      assertEqual(find('#link').textContent.trim(), 'MDN', 'текст после повторного вызова');`,
    },
  ],
};
