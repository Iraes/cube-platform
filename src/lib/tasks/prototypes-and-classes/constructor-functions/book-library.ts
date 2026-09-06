import type { AlgorithmTask } from '@/lib/runner/types';

export const bookLibrary: AlgorithmTask = {
  kind: 'algorithm', slug: 'book-library', title: 'Книга в библиотеке', language: 'javascript',
  description: `Создайте функцию-конструктор \`Book(name, author, year, reader = null)\`. Методы разместите в \`Book.prototype\`, а не внутри конструктора:

- \`isAvailable()\` — свободна ли книга;
- \`takeBook(readerName)\` — выдаёт свободную книгу и возвращает \`true\`; если книга уже у кого-то, возвращает \`false\` и читателя не меняет;
- \`returnBook()\` — регистрирует возврат и возвращает \`true\`; для свободной книги — \`false\`;
- \`changeBookName(name)\` и \`changeAuthorName(name)\` — меняют данные и возвращают \`true\`; если новое значение совпадает с текущим, ничего не меняют и возвращают \`false\`;
- \`getCurrentReader()\` — читатель или \`null\`.

В экземпляре хранятся только данные. Метод, записанный в конструкторе, копировался бы в каждую книгу; метод в прототипе существует в одном экземпляре, а объекты находят его по цепочке — это проверяет отдельный тест.

Служебные функции не изменяйте.`,
  starterCode: `function Book(name, author, year, reader = null) {

}

// Добавьте методы в Book.prototype

const METHODS = ['isAvailable', 'takeBook', 'returnBook', 'changeBookName', 'changeAuthorName', 'getCurrentReader'];

function makeBook() {
  return new Book('JavaScript', 'Флэнаган', 2020);
}

function checkCreation() {
  const book = makeBook();
  return {
    name: book.name,
    author: book.author,
    year: book.year,
    reader: book.getCurrentReader(),
    available: book.isAvailable(),
  };
}

function checkMethodsInPrototype() {
  const book = makeBook();
  return {
    onPrototype: METHODS.every((method) => typeof Book.prototype[method] === 'function'),
    ownMethods: METHODS.filter((method) => Object.hasOwn(book, method)),
  };
}

function checkTakeBook() {
  const book = makeBook();
  const first = book.takeBook('Анна');
  const second = book.takeBook('Иван');
  return { first, second, reader: book.getCurrentReader(), available: book.isAvailable() };
}

function checkReturnBook() {
  const book = makeBook();
  book.takeBook('Анна');
  const returned = book.returnBook();
  const again = book.returnBook();
  return { returned, again, reader: book.getCurrentReader(), available: book.isAvailable() };
}

function checkRename() {
  const book = makeBook();
  const changed = book.changeBookName('JavaScript. Подробное руководство');
  const same = book.changeBookName('JavaScript. Подробное руководство');
  return { changed, same, name: book.name };
}

function checkAuthorRename() {
  const book = makeBook();
  const changed = book.changeAuthorName('Дэвид Флэнаган');
  const same = book.changeAuthorName('Дэвид Флэнаган');
  return { changed, same, author: book.author };
}
`,
  tests: [
    {
      name: 'Конструктор сохраняет данные, новая книга свободна',
      fn: 'checkCreation',
      input: [],
      expected: { name: 'JavaScript', author: 'Флэнаган', year: 2020, reader: null, available: true },
    },
    {
      name: 'Методы лежат в прототипе, а не в экземпляре',
      fn: 'checkMethodsInPrototype',
      input: [],
      expected: { onPrototype: true, ownMethods: [] },
    },
    {
      name: 'Выдача: свободную выдаём, занятую — нет',
      fn: 'checkTakeBook',
      input: [],
      expected: { first: true, second: false, reader: 'Анна', available: false },
    },
    {
      name: 'Возврат: занятую возвращаем, свободную — нет',
      fn: 'checkReturnBook',
      input: [],
      expected: { returned: true, again: false, reader: null, available: true },
    },
    {
      name: 'Переименование: то же название второй раз не проходит',
      fn: 'checkRename',
      input: [],
      expected: { changed: true, same: false, name: 'JavaScript. Подробное руководство' },
    },
    {
      name: 'Смена автора работает по тому же правилу',
      fn: 'checkAuthorRename',
      input: [],
      expected: { changed: true, same: false, author: 'Дэвид Флэнаган' },
    },
  ],
};
