import type { AlgorithmTask } from '@/lib/runner/types';

export const incrementStoredCounter: AlgorithmTask = {
  kind: 'algorithm',
  slug: 'increment-stored-counter',
  title: 'Счётчик в хранилище',
  language: 'javascript',
  description: `Реализуйте \`incrementCounter(counterName, storage)\`.

Объект \`storage\` повторяет нужную часть интерфейса \`localStorage\`: у него есть методы \`getItem(key)\` и \`setItem(key, value)\`. По ключу \`counters\` хранится JSON-строка с объектом счётчиков.

Функция должна:

1. прочитать и разобрать JSON;
2. увеличить счётчик \`counterName\` на единицу, а отсутствующий начать с единицы;
3. сохранить весь обновлённый объект, не потеряв остальные счётчики;
4. вернуть новое значение счётчика.

Если JSON повреждён и \`JSON.parse\` выбрасывает ошибку, начните с пустого объекта. Обработайте только ожидаемую границу данных: остальная логика должна выполняться после \`try…catch\`.

Служебные функции ниже имитируют \`localStorage\` в безопасной песочнице — не изменяйте их.`,
  starterCode: `function incrementCounter(counterName, storage) {

}

function createMemoryStorage(initialValue) {
  let value = initialValue;
  return {
    getItem(key) {
      return key === 'counters' ? value : null;
    },
    setItem(key, nextValue) {
      if (key === 'counters') value = String(nextValue);
    },
    dump() {
      return value;
    },
  };
}

function checkIncrementCounter(initialValue, counterNames) {
  const storage = createMemoryStorage(initialValue);
  const values = counterNames.map((name) => incrementCounter(name, storage));
  return { values, counters: JSON.parse(storage.dump()) };
}
`,
  tests: [
    { name: 'Увеличивает существующий счётчик', fn: 'checkIncrementCounter', input: ['{"bannerClick":5}', ['bannerClick']], expected: { values: [6], counters: { bannerClick: 6 } } },
    { name: 'Сохраняет остальные значения и создаёт новый счётчик', fn: 'checkIncrementCounter', input: ['{"bannerClick":6,"bannerClose":2}', ['bannerOpen']], expected: { values: [1], counters: { bannerClick: 6, bannerClose: 2, bannerOpen: 1 } } },
    { name: 'Восстанавливается после повреждённого JSON', fn: 'checkIncrementCounter', input: ['{"bannerClick":', ['bannerClick']], expected: { values: [1], counters: { bannerClick: 1 } } },
    { name: 'Последовательно сохраняет несколько изменений', fn: 'checkIncrementCounter', input: ['{}', ['click', 'click', 'close']], expected: { values: [1, 2, 1], counters: { click: 2, close: 1 } } },
  ],
};
