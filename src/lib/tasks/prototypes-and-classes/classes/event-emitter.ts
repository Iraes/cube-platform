import type { AlgorithmTask } from '@/lib/runner/types';

export const eventEmitterTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'event-emitter', title: 'Транслятор событий', language: 'javascript',
  description: `Создайте класс \`EventEmitter\`:

- \`on(event, callback)\` подписывает обработчик; на одно событие их может быть сколько угодно, вызываются в порядке подписки;
- \`off(event, callback)\` удаляет **конкретный** обработчик, остальные остаются;
- \`once(event, callback)\` подписывает обработчик ровно на один вызов;
- \`emit(event, ...args)\` вызывает обработчики события, передавая им все аргументы. Событие без подписчиков не должно приводить к ошибке.

Затем создайте наследника \`BroadcastEventEmitter\`: у него \`emit('*', ...args)\` запускает обработчики **всех** событий. Обычные события продолжают работать как у родителя — переопределив \`emit\`, не забудьте вызвать \`super.emit(...)\` для остальных случаев.

Обработчики удобно хранить в объекте или \`Map\`, где ключ — имя события, а значение — массив функций. Для \`off\` понадобится сравнение по ссылке: удалять нужно ту же самую функцию, что подписывали.

Служебные функции не изменяйте.`,
  starterCode: `class EventEmitter {

}

class BroadcastEventEmitter extends EventEmitter {

}

function checkOnAndEmit() {
  const emitter = new EventEmitter();
  const calls = [];
  emitter.on('change', (value) => calls.push('first:' + value));
  emitter.on('change', (value) => calls.push('second:' + value));
  emitter.emit('change', 1);
  return calls;
}

function checkOff() {
  const emitter = new EventEmitter();
  const calls = [];
  const kept = (value) => calls.push('kept:' + value);
  const removed = (value) => calls.push('removed:' + value);
  emitter.on('change', kept);
  emitter.on('change', removed);
  emitter.off('change', removed);
  emitter.emit('change', 1);
  return calls;
}

function checkOnce() {
  const emitter = new EventEmitter();
  const calls = [];
  emitter.once('change', (value) => calls.push('once:' + value));
  emitter.emit('change', 1);
  emitter.emit('change', 2);
  return calls;
}

function checkSeveralArguments() {
  const emitter = new EventEmitter();
  const calls = [];
  emitter.on('sum', (a, b) => calls.push(a + b));
  emitter.emit('sum', 2, 3);
  return calls;
}

function checkUnknownEvent() {
  const emitter = new EventEmitter();
  try {
    emitter.emit('никто-не-подписан', 1);
    return 'без ошибки';
  } catch (error) {
    return 'ошибка: ' + error.message;
  }
}

function checkBroadcast() {
  const emitter = new BroadcastEventEmitter();
  const calls = [];
  emitter.on('first', (value) => calls.push('first:' + value));
  emitter.on('second', (value) => calls.push('second:' + value));
  emitter.emit('*', 3);
  return calls;
}

function checkBroadcastKeepsNormal() {
  const emitter = new BroadcastEventEmitter();
  const calls = [];
  emitter.on('first', (value) => calls.push('first:' + value));
  emitter.on('second', (value) => calls.push('second:' + value));
  emitter.emit('first', 7);
  return calls;
}
`,
  tests: [
    { name: 'Несколько обработчиков вызываются по порядку', fn: 'checkOnAndEmit', input: [], expected: ['first:1', 'second:1'] },
    { name: 'off снимает только указанный обработчик', fn: 'checkOff', input: [], expected: ['kept:1'] },
    { name: 'once срабатывает ровно один раз', fn: 'checkOnce', input: [], expected: ['once:1'] },
    { name: 'Все аргументы доходят до обработчика', fn: 'checkSeveralArguments', input: [], expected: [5] },
    { name: 'Событие без подписчиков не роняет программу', fn: 'checkUnknownEvent', input: [], expected: 'без ошибки' },
    { name: 'Наследник: emit(*) запускает обработчики всех событий', fn: 'checkBroadcast', input: [], expected: ['first:3', 'second:3'] },
    { name: 'Наследник не сломал обычные события', fn: 'checkBroadcastKeepsNormal', input: [], expected: ['first:7'] },
  ],
};
