import type { AlgorithmTask } from '@/lib/runner/types';

export const bankAccount: AlgorithmTask = {
  kind: 'algorithm', slug: 'bank-account', title: 'Личный счёт', language: 'javascript',
  description: `Создайте классы \`Person\` и \`Account\`.

**\`Person(firstName, lastName, birthDate)\`** хранит имя, фамилию и дату рождения. Геттер \`fullName\` возвращает \`'Имя Фамилия'\`. Метод \`getAge()\` возвращает число **полных** лет: если день рождения в этом году ещё не наступил, год не засчитывается.

**\`Account(person, amount)\`** хранит владельца и баланс:

- \`addMoney(amount, description)\` пополняет счёт;
- \`withdrawMoney(amount, description)\` списывает; отрицательный баланс допустим;
- каждая операция добавляет в историю объект \`{ timestamp, target, amount, description }\`, где \`target\` — строка \`'in'\` для пополнения и \`'out'\` для списания, а \`timestamp\` — число;
- \`getAmount()\` и \`getAccountHistory()\` возвращают состояние;
- статический \`Account.transfer(from, to, amount)\` переводит деньги: у отправителя появляется запись \`'out'\`, у получателя \`'in'\`.

Статический метод объявляют через \`static\` и вызывают на самом классе, а не на экземпляре.

Служебные функции не изменяйте.`,
  starterCode: `class Person {

}

class Account {

}

function makePerson() {
  return new Person('Alexey', 'Petrov', '1994-05-22');
}

function checkFullName() {
  return makePerson().fullName;
}

function checkAge(yearsAgo, birthdayPassed) {
  const now = new Date();
  const day = now.getDate() + (birthdayPassed ? -1 : 1);
  const birth = new Date(now.getFullYear() - yearsAgo, now.getMonth(), day);
  // Дату собираем из местных частей: toISOString перевёл бы в UTC
  // и мог сдвинуть день на сутки назад
  const pad = (value) => String(value).padStart(2, '0');
  const iso = birth.getFullYear() + '-' + pad(birth.getMonth() + 1) + '-' + pad(birth.getDate());
  return new Person('Test', 'Person', iso).getAge();
}

function checkInitialAmount() {
  return new Account(makePerson(), 1000).getAmount();
}

function checkAddMoney() {
  const account = new Account(makePerson(), 1000);
  account.addMoney(500, 'Зарплата');
  const [entry] = account.getAccountHistory();
  return { amount: account.getAmount(), target: entry.target, description: entry.description, entryAmount: entry.amount };
}

function checkWithdraw() {
  const account = new Account(makePerson(), 1000);
  account.withdrawMoney(1200, 'Налоги');
  const [entry] = account.getAccountHistory();
  return { amount: account.getAmount(), target: entry.target, negativeAllowed: account.getAmount() < 0 };
}

function checkHistoryShape() {
  const account = new Account(makePerson(), 100);
  account.addMoney(50, 'Пополнение');
  return account.getAccountHistory().every((item) =>
    typeof item.timestamp === 'number' && typeof item.amount === 'number'
    && typeof item.description === 'string' && typeof item.target === 'string');
}

function checkTransfer() {
  const from = new Account(makePerson(), 1000);
  const to = new Account(new Person('Helen', 'Smith', '1990-06-06'), 400);
  Account.transfer(from, to, 100);
  return {
    fromAmount: from.getAmount(),
    toAmount: to.getAmount(),
    fromTargets: from.getAccountHistory().map((item) => item.target),
    toTargets: to.getAccountHistory().map((item) => item.target),
  };
}
`,
  tests: [
    { name: 'Геттер fullName собирает имя и фамилию', fn: 'checkFullName', input: [], expected: 'Alexey Petrov' },
    { name: 'getAge: день рождения в этом году уже прошёл', fn: 'checkAge', input: [30, true], expected: 30 },
    { name: 'getAge: день рождения ещё впереди — год не засчитан', fn: 'checkAge', input: [30, false], expected: 29 },
    { name: 'Начальный баланс сохранён', fn: 'checkInitialAmount', input: [], expected: 1000 },
    {
      name: 'Пополнение меняет баланс и пишет запись in',
      fn: 'checkAddMoney',
      input: [],
      expected: { amount: 1500, target: 'in', description: 'Зарплата', entryAmount: 500 },
    },
    {
      name: 'Списание пишет out и допускает уход в минус',
      fn: 'checkWithdraw',
      input: [],
      expected: { amount: -200, target: 'out', negativeAllowed: true },
    },
    { name: 'Каждая запись истории нужной формы', fn: 'checkHistoryShape', input: [], expected: true },
    {
      name: 'Перевод отражается на обоих счетах',
      fn: 'checkTransfer',
      input: [],
      expected: { fromAmount: 900, toAmount: 500, fromTargets: ['out'], toTargets: ['in'] },
    },
  ],
};
