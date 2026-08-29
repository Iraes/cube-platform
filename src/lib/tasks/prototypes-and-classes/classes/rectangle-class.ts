import type { AlgorithmTask } from '@/lib/runner/types';
export const rectangleClass: AlgorithmTask = {
  kind: 'algorithm', slug: 'rectangle-class', title: 'Класс Rectangle', language: 'javascript',
  description: `Ступенька к «Личному счёту» и «Неизменяемому калькулятору». Простой класс, но с двумя приёмами, которые понадобятся дальше.

Создайте класс \`Rectangle\`:

- конструктор принимает \`width\` и \`height\` и сохраняет их;
- **геттер** \`area\` возвращает площадь. Геттер объявляется как \`get area() { ... }\` и читается без скобок: \`rect.area\`, а не \`rect.area()\`;
- метод \`scale(factor)\` возвращает **новый** \`Rectangle\` со сторонами, умноженными на \`factor\`. Исходный прямоугольник меняться не должен.

Второй пункт — про неизменяемость. Соблазн написать \`this.width *= factor\` и вернуть \`this\` велик, но тогда старый объект испортится. Создавайте новый через \`new Rectangle(...)\`.

Именно это проверяет поле \`sameInstance\`: оно должно быть \`false\`. И на этом же принципе построен «Неизменяемый калькулятор» с цепочками вызовов.

Служебную функцию не изменяйте.`,
  starterCode: `class Rectangle {

}

function checkRectangle(width, height, factor) {
  const rect = new Rectangle(width, height);
  const scaled = rect.scale(factor);
  return {
    area: rect.area,
    scaledArea: scaled.area,
    areaAfterScale: rect.area,
    sameInstance: scaled === rect,
  };
}
`,
  tests: [
    { name: 'Rectangle(2, 3): area 6, scale(2) даёт 24, исходный не изменился', fn: 'checkRectangle', input: [2, 3, 2], expected: { area: 6, scaledArea: 24, areaAfterScale: 6, sameInstance: false } },
    { name: 'Множитель 1 даёт равный, но другой объект', fn: 'checkRectangle', input: [4, 5, 1], expected: { area: 20, scaledArea: 20, areaAfterScale: 20, sameInstance: false } },
    { name: 'Дробный множитель', fn: 'checkRectangle', input: [10, 10, 0.5], expected: { area: 100, scaledArea: 25, areaAfterScale: 100, sameInstance: false } },
  ],
};
