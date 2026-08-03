import type { AlgorithmTask } from '@/lib/runner/types';
const year = new Date().getFullYear();
export const createUsernames: AlgorithmTask = {
  kind: 'algorithm', slug: 'create-usernames', title: 'Create Usernames', language: 'javascript',
  description: `Реализуйте \`createUsernames(users)\`. Добавьте каждому пользователю поле \`username\`, составленное из:

1. \`firstName\` в нижнем регистре;
2. первой буквы \`lastName\` в нижнем регистре;
3. года рождения: текущий год минус возраст.

Функция должна правильно работать и в будущем году. Порядок пользователей сохраняется.`,
  starterCode: `function createUsernames(users) {

}
`,
  tests: [
    { name: 'Создаёт username из имени, фамилии и года рождения', fn: 'createUsernames', input: [[{ firstName: 'Emily', lastName: 'N.', age: 30 }, { firstName: 'Nor', lastName: 'E.', age: 20 }]], expected: [{ firstName: 'Emily', lastName: 'N.', age: 30, username: `emilyn${year - 30}` }, { firstName: 'Nor', lastName: 'E.', age: 20, username: `nore${year - 20}` }] },
    { name: 'Пустой массив остаётся пустым', fn: 'createUsernames', input: [[]], expected: [] },
  ],
};
