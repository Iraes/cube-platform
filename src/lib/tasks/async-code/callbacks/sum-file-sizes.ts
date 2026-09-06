import type { AlgorithmTask } from '@/lib/runner/types';

export const sumFileSizes: AlgorithmTask = {
  kind: 'algorithm', slug: 'sum-file-sizes', title: 'Сумма размеров файлов', language: 'javascript',
  description: `Реализуйте \`sumFileSizes(first, second, getFileSize, onDone)\`. Функция \`getFileSize(name, callback)\` асинхронно передаёт размер одного файла. Получите размеры обоих файлов и вызовите \`onDone\` ровно один раз с их суммой. Порядок завершения запросов заранее неизвестен.

Служебная функция проверки создаёт асинхронное хранилище — не изменяйте её.`,
  starterCode: `function sumFileSizes(first, second, getFileSize, onDone) {

}

function checkSumFileSizes(files, first, second) {
  return new Promise((resolve) => {
    let doneCalls = 0;
    function getFileSize(name, callback) {
      const entry = files[name];
      setTimeout(() => callback(entry.size), entry.delay);
    }
    sumFileSizes(first, second, getFileSize, (total) => {
      doneCalls += 1;
      setTimeout(() => resolve({ total, doneCalls }), 15);
    });
  });
}
`,
  tests: [
    { name: 'Суммирует размеры независимо от порядка ответов', fn: 'checkSumFileSizes', input: [{ a: { size: 120, delay: 10 }, b: { size: 80, delay: 2 } }, 'a', 'b'], expected: { total: 200, doneCalls: 1 } },
    { name: 'Работает с нулевым размером', fn: 'checkSumFileSizes', input: [{ empty: { size: 0, delay: 1 }, data: { size: 7, delay: 5 } }, 'empty', 'data'], expected: { total: 7, doneCalls: 1 } },
  ],
};
