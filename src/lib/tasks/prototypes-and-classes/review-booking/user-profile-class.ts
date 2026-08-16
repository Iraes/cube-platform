import type { AlgorithmTask } from '@/lib/runner/types';

export const userProfileClass: AlgorithmTask = {
  kind: 'algorithm', slug: 'user-profile-class', title: 'Профиль пользователя', language: 'javascript',
  description: `Создайте класс \`UserProfile\`.

- Конструктор принимает \`firstName\`, \`lastName\` и необязательный массив \`roles\`.
- Геттер \`fullName\` возвращает имя и фамилию через пробел.
- Метод \`addRole(role)\` добавляет только отсутствующую роль и возвращает \`this\` для цепочки вызовов.
- Метод \`hasRole(role)\` возвращает логическое значение.
- Статический метод \`fromObject(data)\` создаёт экземпляр из обычного объекта.

Служебную функцию проверки не изменяйте.`,
  starterCode: `class UserProfile {

}

function checkUserProfile(data) {
  const user = UserProfile.fromObject(data);
  const chained = user.addRole('student').addRole('student').addRole('mentor');
  return {
    instance: user instanceof UserProfile,
    fullName: user.fullName,
    roles: user.roles,
    hasStudent: user.hasRole('student'),
    hasAdmin: user.hasRole('admin'),
    fluent: chained === user,
  };
}
`,
  tests: [
    { name: 'Создаёт профиль, поддерживает роли и цепочку вызовов', fn: 'checkUserProfile', input: [{ firstName: 'Анна', lastName: 'Смирнова', roles: ['reader'] }], expected: { instance: true, fullName: 'Анна Смирнова', roles: ['reader', 'student', 'mentor'], hasStudent: true, hasAdmin: false, fluent: true } },
  ],
};
