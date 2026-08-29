import type { AlgorithmTask } from '@/lib/runner/types';
export const thisBox: AlgorithmTask = {
  kind: 'algorithm', slug: 'this-box', title: 'Метод и this', language: 'javascript',
  description: `Ступенька к \`Object Calculator\`. Разбираемся, что такое \`this\` внутри метода.

Реализуйте \`createBox(value)\`: она возвращает объект со свойством \`value\` и двумя методами:

- \`add(amount)\` прибавляет число к \`value\` — обращайтесь к нему через \`this.value\`;
- \`double()\` возвращает удвоенное \`value\`, ничего не меняя.

Внутри метода \`this\` — это объект, у которого метод вызвали. Поэтому \`this.value += amount\` меняет свойство самого объекта, а не какую-то отдельную переменную.

Одна ловушка: методы записывайте обычным синтаксисом — \`add(amount) { ... }\`. У стрелочной функции своего \`this\` нет, и в методе объекта она получит не то, что нужно.

Служебную функцию не изменяйте.`,
  starterCode: `function createBox(value) {

}

function checkBox(value, amount) {
  const box = createBox(value);
  box.add(amount);
  return { value: box.value, doubled: box.double() };
}
`,
  tests: [
    { name: 'createBox(10), add(5) → value 15, double() 30', fn: 'checkBox', input: [10, 5], expected: { value: 15, doubled: 30 } },
    { name: 'Прибавление нуля ничего не меняет', fn: 'checkBox', input: [7, 0], expected: { value: 7, doubled: 14 } },
    { name: 'Отрицательное слагаемое', fn: 'checkBox', input: [3, -8], expected: { value: -5, doubled: -10 } },
  ],
};
