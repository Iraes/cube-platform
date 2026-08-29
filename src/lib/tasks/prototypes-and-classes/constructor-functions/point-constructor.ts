import type { AlgorithmTask } from '@/lib/runner/types';
export const pointConstructor: AlgorithmTask = {
  kind: 'algorithm', slug: 'point-constructor', title: 'Конструктор Point', language: 'javascript',
  description: `Ступенька к «Книге в библиотеке», где методов сразу пять. Здесь один.

Создайте функцию-конструктор \`Point(x, y)\`: она сохраняет координаты в \`this.x\` и \`this.y\`. Метод \`sum()\`, возвращающий их сумму, разместите **в \`Point.prototype\`**, а не внутри конструктора.

Разница принципиальная. Записанный в конструкторе метод копируется в каждый созданный объект — тысяча точек, тысяча одинаковых функций. Метод в прототипе существует в единственном экземпляре, а объекты находят его по цепочке прототипов.

Именно это проверяет последнее поле в результате: \`hasOwnProperty('sum')\` должно быть \`false\`. Собственного свойства \`sum\` у точки нет — метод приходит из прототипа.

Служебную функцию не изменяйте.`,
  starterCode: `function Point(x, y) {

}

// Метод sum добавьте в Point.prototype

function checkPoint(x, y) {
  const point = new Point(x, y);
  return {
    x: point.x,
    y: point.y,
    sum: point.sum(),
    ownMethod: Object.prototype.hasOwnProperty.call(point, 'sum'),
  };
}
`,
  tests: [
    { name: 'Point(2, 3): координаты сохранены, sum() → 5, метод из прототипа', fn: 'checkPoint', input: [2, 3], expected: { x: 2, y: 3, sum: 5, ownMethod: false } },
    { name: 'Отрицательные координаты', fn: 'checkPoint', input: [-4, 1], expected: { x: -4, y: 1, sum: -3, ownMethod: false } },
    { name: 'Нулевая точка', fn: 'checkPoint', input: [0, 0], expected: { x: 0, y: 0, sum: 0, ownMethod: false } },
  ],
};
