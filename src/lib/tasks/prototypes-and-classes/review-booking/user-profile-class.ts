import type { AlgorithmTask } from '@/lib/runner/types';

export const userProfileClass: AlgorithmTask = {
  kind: 'algorithm', slug: 'user-profile-class', title: 'Профиль пользователя', language: 'javascript',
  description: `Создайте класс \`UserProfile\`.

- Конструктор принимает \`firstName\`, \`lastName\` и необязательный массив \`roles\`. Без третьего аргумента ролей нет — пустой массив.
- Геттер \`fullName\` возвращает имя и фамилию через пробел.
- \`addRole(role)\` добавляет роль, только если её ещё нет, и возвращает \`this\`. Возврат \`this\` и делает возможной цепочку \`user.addRole('a').addRole('b')\`.
- \`hasRole(role)\` возвращает \`true\` или \`false\`.
- Статический \`UserProfile.fromObject(data)\` создаёт экземпляр из обычного объекта с полями \`firstName\`, \`lastName\`, \`roles\`.

Значение по умолчанию для \`roles\` задавайте прямо в параметре. Одна ловушка: если написать общий массив снаружи класса, он окажется общим для всех профилей — роль, добавленная одному, появится у остальных. Отдельный тест это проверяет.

Служебные функции не изменяйте.`,
  starterCode: `class UserProfile {

}

function checkFromObject(data) {
  const user = UserProfile.fromObject(data);
  return { instance: user instanceof UserProfile, fullName: user.fullName, roles: user.roles };
}

function checkDefaultRoles() {
  const user = new UserProfile('Иван', 'Иванов');
  return user.roles;
}

function checkAddRole() {
  const user = new UserProfile('Анна', 'Смирнова', ['reader']);
  user.addRole('mentor');
  return user.roles;
}

function checkNoDuplicates() {
  const user = new UserProfile('Анна', 'Смирнова');
  user.addRole('student');
  user.addRole('student');
  return user.roles;
}

function checkFluent() {
  const user = new UserProfile('Анна', 'Смирнова');
  const returned = user.addRole('student').addRole('mentor');
  return { sameInstance: returned === user, roles: user.roles };
}

function checkHasRole() {
  const user = new UserProfile('Анна', 'Смирнова', ['reader']);
  return { reader: user.hasRole('reader'), admin: user.hasRole('admin') };
}

function checkProfilesIndependent() {
  const first = new UserProfile('Анна', 'Смирнова');
  const second = new UserProfile('Пётр', 'Петров');
  first.addRole('mentor');
  return { first: first.roles, second: second.roles };
}
`,
  tests: [
    {
      name: 'fromObject создаёт экземпляр класса',
      fn: 'checkFromObject',
      input: [{ firstName: 'Анна', lastName: 'Смирнова', roles: ['reader'] }],
      expected: { instance: true, fullName: 'Анна Смирнова', roles: ['reader'] },
    },
    { name: 'Без ролей список пуст', fn: 'checkDefaultRoles', input: [], expected: [] },
    { name: 'Новая роль добавляется в конец', fn: 'checkAddRole', input: [], expected: ['reader', 'mentor'] },
    { name: 'Повторная роль не дублируется', fn: 'checkNoDuplicates', input: [], expected: ['student'] },
    {
      name: 'addRole возвращает this — цепочка работает',
      fn: 'checkFluent',
      input: [],
      expected: { sameInstance: true, roles: ['student', 'mentor'] },
    },
    { name: 'hasRole отвечает по существу', fn: 'checkHasRole', input: [], expected: { reader: true, admin: false } },
    {
      name: 'Профили не делят один массив ролей',
      fn: 'checkProfilesIndependent',
      input: [],
      expected: { first: ['mentor'], second: [] },
    },
  ],
};
