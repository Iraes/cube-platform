import type { AlgorithmTask } from '@/lib/runner/types';

export const bookLibrary: AlgorithmTask = {
  kind: 'algorithm', slug: 'book-library', title: 'Книга в библиотеке', language: 'javascript',
  description: `Создайте функцию-конструктор \`Book(name, author, year, reader = null)\`. Методы разместите в \`Book.prototype\`:

- \`isAvailable()\` сообщает, свободна ли книга;
- \`takeBook(readerName)\` выдаёт свободную книгу и возвращает результат операции;
- \`returnBook()\` регистрирует возврат;
- \`changeBookName(name)\` и \`changeAuthorName(name)\` изменяют данные, возвращая \`false\`, если значение не изменилось;
- \`getCurrentReader()\` возвращает читателя или \`null\`.

В экземпляре должны храниться только данные — методы должны наследоваться из прототипа. Служебную функцию проверки не изменяйте.`,
  starterCode: `function Book(name, author, year, reader = null) {

}

// Добавьте методы в Book.prototype

function checkBook(name, author, year) {
  const book = new Book(name, author, year);
  const prototypeMethods = ['isAvailable', 'takeBook', 'returnBook', 'changeBookName', 'changeAuthorName', 'getCurrentReader'];
  const startsAvailable = book.isAvailable();
  const taken = book.takeBook('Анна');
  const secondTake = book.takeBook('Иван');
  const reader = book.getCurrentReader();
  const returned = book.returnBook();
  const secondReturn = book.returnBook();
  const renamed = book.changeBookName(name + ' — новое издание');
  const sameName = book.changeBookName(name + ' — новое издание');
  const authorChanged = book.changeAuthorName(author + ' II');
  return {
    startsAvailable, taken, secondTake, reader, returned, secondReturn,
    renamed, sameName, authorChanged,
    name: book.name, author: book.author, year: book.year, readerAfterReturn: book.reader,
    methodsOnPrototype: prototypeMethods.every((method) => typeof Book.prototype[method] === 'function'),
    noOwnMethods: prototypeMethods.every((method) => !Object.hasOwn(book, method)),
  };
}
`,
  tests: [
    { name: 'Создаёт книгу и выполняет все операции', fn: 'checkBook', input: ['JavaScript', 'Автор', 2020], expected: { startsAvailable: true, taken: true, secondTake: false, reader: 'Анна', returned: true, secondReturn: false, renamed: true, sameName: false, authorChanged: true, name: 'JavaScript — новое издание', author: 'Автор II', year: 2020, readerAfterReturn: null, methodsOnPrototype: true, noOwnMethods: true } },
  ],
};
