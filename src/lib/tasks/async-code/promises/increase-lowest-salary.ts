import type { AlgorithmTask } from '@/lib/runner/types';

export const increaseLowestSalary: AlgorithmTask = {
  kind: 'algorithm', slug: 'increase-lowest-salary', title: 'Повышение минимальной зарплаты', language: 'javascript',
  description: `Реализуйте \`increaseSalary(api)\` с помощью цепочки промисов.

Получите сотрудников через \`api.getEmployees()\`, найдите сотрудника с минимальной зарплатой, увеличьте её на 20% через \`api.setEmployeeSalary(id, salary)\` и отправьте уведомление \`Hello, <имя>! Congratulations, your new salary is <зарплата>!\`.

Верните промис с \`true\` при успехе. При любой ошибке вызовите \`api.notifyAdmin(error)\`, не уведомляйте сотрудника и разрешите итоговый промис значением \`false\`.`,
  starterCode: `function increaseSalary(api) {

}

async function checkIncreaseSalary(employees, failingId) {
  const state = { employees: employees.map((item) => ({ ...item })), notices: [], adminErrors: [] };
  const api = {
    getEmployees: () => Promise.resolve(state.employees.map((item) => ({ ...item }))),
    setEmployeeSalary: (id, salary) => {
      if (id === failingId) return Promise.reject(new Error('raise failed'));
      const employee = state.employees.find((item) => item.id === id);
      employee.salary = salary;
      return Promise.resolve({ ...employee });
    },
    notifyEmployee: (id, text) => { state.notices.push({ id, text }); return Promise.resolve(); },
    notifyAdmin: (error) => { state.adminErrors.push(error.message); return Promise.resolve(); },
  };
  const result = await increaseSalary(api);
  return { result, employees: state.employees, notices: state.notices, adminErrors: state.adminErrors };
}
`,
  tests: [
    { name: 'Повышает минимальную зарплату и уведомляет сотрудника', fn: 'checkIncreaseSalary', input: [[{ id: 1, name: 'Анна', salary: 100 }, { id: 2, name: 'Борис', salary: 200 }], null], expected: { result: true, employees: [{ id: 1, name: 'Анна', salary: 120 }, { id: 2, name: 'Борис', salary: 200 }], notices: [{ id: 1, text: 'Hello, Анна! Congratulations, your new salary is 120!' }], adminErrors: [] } },
    { name: 'Сообщает администратору об ошибке', fn: 'checkIncreaseSalary', input: [[{ id: 1, name: 'Анна', salary: 100 }, { id: 2, name: 'Борис', salary: 200 }], 1], expected: { result: false, employees: [{ id: 1, name: 'Анна', salary: 100 }, { id: 2, name: 'Борис', salary: 200 }], notices: [], adminErrors: ['raise failed'] } },
  ],
};
