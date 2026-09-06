import type { AlgorithmTask } from '@/lib/runner/types';

export const getUsersInfo: AlgorithmTask = {
  kind: 'algorithm', slug: 'get-users-info', title: 'Данные пользователей по callback', language: 'javascript',
  description: `Реализуйте \`getUsersInfo(db, onLoad)\`. Метод \`db.getUsersIds(callback)\` возвращает идентификаторы, а \`db.getUserInfo(id, callback)\` — данные одного пользователя.

Передайте в \`onLoad\` массив пользователей **в том же порядке**, в котором пришли идентификаторы. Запросы отдельных пользователей могут завершаться в другом порядке. Для пустого списка вызовите \`onLoad([])\`.`,
  starterCode: `function getUsersInfo(db, onLoad) {

}

function checkUsersInfo(ids, records) {
  return new Promise((resolve) => {
    const db = {
      getUsersIds(callback) { setTimeout(() => callback(ids.slice()), 1); },
      getUserInfo(id, callback) {
        const record = records[id];
        setTimeout(() => callback(record.user), record.delay);
      },
    };
    getUsersInfo(db, resolve);
  });
}
`,
  tests: [
    { name: 'Сохраняет порядок идентификаторов', fn: 'checkUsersInfo', input: [['u1', 'u2', 'u3'], { u1: { user: { name: 'Анна' }, delay: 10 }, u2: { user: { name: 'Борис' }, delay: 1 }, u3: { user: { name: 'Вера' }, delay: 5 } }], expected: [{ name: 'Анна' }, { name: 'Борис' }, { name: 'Вера' }] },
    { name: 'Возвращает пустой массив', fn: 'checkUsersInfo', input: [[], {}], expected: [] },
  ],
};
