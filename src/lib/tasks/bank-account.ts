import type { AlgorithmTask } from '@/lib/runner/types';

export const bankAccount: AlgorithmTask = {
  kind: 'algorithm', slug: 'bank-account', title: 'Личный счёт', language: 'javascript',
  description: `Создайте классы \`Person\` и \`Account\`.

\`Person(firstName, lastName, birthDate)\` хранит имя, фамилию и дату рождения, предоставляет геттер \`fullName\` и метод \`getAge()\`, возвращающий число полных лет.

\`Account(person, amount)\` хранит владельца и баланс. Методы \`addMoney\` и \`withdrawMoney\` меняют баланс и добавляют в историю объект \`{ timestamp, target, amount, description }\`. Методы \`getAmount()\` и \`getAccountHistory()\` возвращают состояние счёта. Статический \`Account.transfer(from, to, amount)\` переводит деньги между счетами и отражает обе операции в истории. Отрицательный баланс допустим.

Служебную функцию проверки не изменяйте.`,
  starterCode: `class Person {

}

class Account {

}

function checkAccounts() {
  const alex = new Person('Alexey', 'Petrov', '1994-05-22');
  const helen = new Person('Helen', 'Smith', '1990-06-06');
  const alexAccount = new Account(alex, 1000);
  const helenAccount = new Account(helen, 400);
  alexAccount.addMoney(1000, 'Зарплата');
  alexAccount.withdrawMoney(200, 'Налоги');
  Account.transfer(alexAccount, helenAccount, 100);
  return {
    fullName: alex.fullName,
    alexAmount: alexAccount.getAmount(),
    helenAmount: helenAccount.getAmount(),
    alexTargets: alexAccount.getAccountHistory().map((item) => item.target),
    helenTargets: helenAccount.getAccountHistory().map((item) => item.target),
    validHistory: alexAccount.getAccountHistory().every((item) =>
      typeof item.timestamp === 'number' && typeof item.amount === 'number' && typeof item.description === 'string'
    ),
  };
}
`,
  tests: [
    { name: 'Работает с балансом, историей и переводом', fn: 'checkAccounts', input: [], expected: { fullName: 'Alexey Petrov', alexAmount: 1700, helenAmount: 500, alexTargets: ['in', 'out', 'out'], helenTargets: ['in'], validHistory: true } },
  ],
};
