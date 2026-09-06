import type { AlgorithmTask } from '@/lib/runner/types';

export const increaseAllSalaries: AlgorithmTask = {
  kind: 'algorithm', slug: 'increase-all-salaries', title: 'Повышение зарплат с async/await', language: 'javascript',
  description: `Реализуйте асинхронную \`increaseSalaries(api)\`.

Получите сотрудников и среднюю зарплату. Зарплату ниже средней увеличьте на 20%, остальные — на 10%, а результат округлите до целого через \`Math.round\`: без округления \`200 * 1.1\` даёт \`220.00000000000003\`, потому что дробные числа хранятся в двоичном виде. Каждый успешный результат передайте в \`notifyEmployee\`; ошибку отдельного повышения — в \`notifyAdmin\`, после чего продолжите.

В конце передайте в \`sendBudgetToAccounting\` сумму **только успешно обновлённых** зарплат и верните количество успешных повышений.`,
  starterCode: `async function increaseSalaries(api) {

}

async function checkIncreaseSalaries(employees, failingIds) {
  const state = { employees: employees.map((item) => ({ ...item })), notices: [], adminErrors: [], budget: null };
  const api = {
    getEmployees: async () => state.employees.map((item) => ({ ...item })),
    setEmployeeSalary: async (id, salary) => {
      if (failingIds.includes(id)) throw new Error('raise ' + id + ' failed');
      const employee = state.employees.find((item) => item.id === id);
      employee.salary = salary;
      return { ...employee };
    },
    notifyEmployee: async (id, text) => { state.notices.push({ id, text }); },
    notifyAdmin: async (error) => { state.adminErrors.push(error.message); },
    sendBudgetToAccounting: async (budget) => { state.budget = budget; },
  };
  const count = await increaseSalaries(api);
  return { count, employees: state.employees, notices: state.notices, adminErrors: state.adminErrors, budget: state.budget };
}
`,
  tests: [
    { name: 'Повышает зарплаты и отправляет бюджет', fn: 'checkIncreaseSalaries', input: [[{ id: 1, name: 'Анна', salary: 100 }, { id: 2, name: 'Борис', salary: 200 }], []], expected: { count: 2, employees: [{ id: 1, name: 'Анна', salary: 120 }, { id: 2, name: 'Борис', salary: 220 }], notices: [{ id: 1, text: 'Hello, Анна! Congratulations, your new salary is 120!' }, { id: 2, text: 'Hello, Борис! Congratulations, your new salary is 220!' }], adminErrors: [], budget: 340 } },
    { name: 'Продолжает работу после ошибки одного сотрудника', fn: 'checkIncreaseSalaries', input: [[{ id: 1, name: 'Анна', salary: 100 }, { id: 2, name: 'Борис', salary: 200 }], [2]], expected: { count: 1, employees: [{ id: 1, name: 'Анна', salary: 120 }, { id: 2, name: 'Борис', salary: 200 }], notices: [{ id: 1, text: 'Hello, Анна! Congratulations, your new salary is 120!' }], adminErrors: ['raise 2 failed'], budget: 120 } },
  ],
};
