import type { AlgorithmTask } from '@/lib/runner/types';

export const eventEmitterTask: AlgorithmTask = {
  kind: 'algorithm', slug: 'event-emitter', title: 'Транслятор событий', language: 'javascript',
  description: `Создайте класс \`EventEmitter\`:

- \`on(event, callback)\` подписывает обработчик;
- \`off(event, callback)\` удаляет конкретный обработчик;
- \`once(event, callback)\` подписывает обработчик только на один вызов;
- \`emit(event, ...args)\` вызывает обработчики с переданными аргументами.

Создайте наследника \`BroadcastEventEmitter\`: вызов \`emit('*', ...args)\` должен запустить обработчики всех событий. Обычные события продолжают работать как у родителя.`,
  starterCode: `class EventEmitter {

}

class BroadcastEventEmitter extends EventEmitter {

}

function checkEventEmitter() {
  const emitter = new EventEmitter();
  const calls = [];
  const regular = (value) => calls.push('regular:' + value);
  const removed = (value) => calls.push('removed:' + value);
  emitter.on('change', regular);
  emitter.on('change', removed);
  emitter.once('change', (value) => calls.push('once:' + value));
  emitter.emit('change', 1);
  emitter.off('change', removed);
  emitter.emit('change', 2);

  const broadcast = new BroadcastEventEmitter();
  const broadcastCalls = [];
  broadcast.on('first', (value) => broadcastCalls.push('first:' + value));
  broadcast.on('second', (value) => broadcastCalls.push('second:' + value));
  broadcast.emit('*', 3);
  return { calls, broadcastCalls };
}
`,
  tests: [
    { name: 'Поддерживает on, off, once, emit и широковещательный вызов', fn: 'checkEventEmitter', input: [], expected: { calls: ['regular:1', 'removed:1', 'once:1', 'regular:2'], broadcastCalls: ['first:3', 'second:3'] } },
  ],
};
