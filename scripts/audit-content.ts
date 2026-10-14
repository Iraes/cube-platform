/**
 * Сплошная проверка каталога: что задачи целы, привязаны и действительно
 * проверяют решение, а уроки не остались без практики.
 *
 * Не заменяет прогон эталонных решений — ловит другое: обрывы связей,
 * задачи, которые проходят пустой заготовкой, и уроки без закрепления.
 */
// Первым делом .env.local: без DATABASE_URL приложение поднимает пустой
// локальный PGlite, и аудит проверял бы не тот каталог, что видят ученики.
import './env';
import vm from 'node:vm';
import { getCourseBlocks, getModules } from '@/lib/content';
import { buildWorkerSource } from '@/lib/runner/workerHarness';
import { getTask, tasks } from '@/lib/tasks';
import type { AlgorithmTask } from '@/lib/runner/types';

const out = (s: string) => process.stdout.write(s + '\n');

// Аудит намеренно исполняет пустые заготовки, и часть из них роняет промис
// без обработчика. Это ожидаемо и не должно валить сам аудит.
process.on('unhandledRejection', () => {});

function toSource(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number') return Number.isNaN(value) ? 'NaN' : String(value);
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (value instanceof Date) return 'new Date(' + value.getTime() + ')';
  if (Array.isArray(value)) return '[' + value.map(toSource).join(',') + ']';
  if (typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => JSON.stringify(k) + ':' + toSource(v)).join(',') + '}';
  }
  return 'undefined';
}

/**
 * Таймеры для песочницы. Колбэк обёрнут в try/catch: аудит гоняет пустые
 * заготовки, и брошенное из таймера исключение иначе убило бы весь процесс —
 * в настоящем воркере его поймал бы сам воркер.
 */
function guarded(timer: typeof setTimeout | typeof setInterval) {
  return (fn: (...args: unknown[]) => void, ms?: number, ...args: unknown[]) =>
    (timer as any)(() => { try { fn(...args); } catch { /* ожидаемо */ } }, ms);
}

/** Прогон кода через настоящий скрипт воркера */
function runWorker(code: string, tests: unknown[]): Promise<any> {
  return new Promise((resolve) => {
    const host: any = { postMessage: (m: any) => m.type === 'done' && resolve(m) };
    const quiet = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };
    const ctx: any = vm.createContext({ hostSelf: host, hostConsole: quiet, setTimeout: guarded(setTimeout), clearTimeout, setInterval: guarded(setInterval), clearInterval });
    const timer = setTimeout(() => resolve({ results: [], error: { message: 'таймаут' } }), 5000);
    try {
      vm.runInContext(
        'var self = hostSelf; var console = hostConsole; var structuredClone = function (v) { return v; };'
          + 'var localTests = ' + toSource(tests) + ';',
        ctx,
      );
      vm.runInContext(buildWorkerSource(code), ctx);
      Promise.resolve(ctx.self.onmessage({ data: { tests: ctx.localTests, mode: 'submit' } }))
        .then(() => clearTimeout(timer))
        .catch((e: any) => { clearTimeout(timer); resolve({ results: [], error: { message: String(e) } }); });
    } catch (e) {
      clearTimeout(timer);
      resolve({ results: [], error: { message: String(e) } });
    }
  });
}

type Finding = { level: 'ошибка' | 'замечание'; where: string; what: string };

async function main() {
  const findings: Finding[] = [];
  const add = (level: Finding['level'], where: string, what: string) => findings.push({ level, where, what });

  const [blocks, modules] = await Promise.all([getCourseBlocks(), getModules()]);
  const byBlock = new Map(blocks.map((b) => [b.id, b.title]));

  /* ---------- 1. Каталог задач ---------- */
  const slugs = new Set<string>();
  for (const task of tasks) {
    if (slugs.has(task.slug)) add('ошибка', task.slug, 'слаг повторяется в каталоге');
    slugs.add(task.slug);
    const checks = task.kind === 'algorithm' ? task.tests.length
      : task.kind === 'dom' ? task.checks.length : task.questions.length;
    if (checks === 0) add('ошибка', task.slug, 'нет ни одной проверки');
    else if (checks === 1) add('замечание', task.slug, 'одна проверка на всё решение — ученик не поймёт, что именно сломалось');
  }

  /* ---------- 2. Связи с модулями и уроками ---------- */
  const attached = new Map<string, string[]>();
  const inLesson = new Map<string, string[]>();
  const quizIds = new Set<string>();

  for (const m of modules) {
    const label = (m.isDemoOnly ? 'витрина ' : '') + '«' + m.title + '»';
    if (!m.isDemoOnly && !m.blockId) add('замечание', label, 'модуль не входит ни в один блок курса');

    for (const slug of m.taskSlugs) {
      if (!getTask(slug)) { add('ошибка', label, 'привязана несуществующая задача ' + slug); continue; }
      attached.set(slug, [...(attached.get(slug) ?? []), m.title]);
    }

    for (const lesson of m.lessons) {
      const where = label + ' / «' + lesson.title + '»';
      const kinds = new Set(lesson.blocks.map((b) => b.type));
      const lessonTasks = lesson.blocks.flatMap((b) => (b.type === 'task' ? [b.slug] : []));

      for (const slug of lessonTasks) {
        if (!getTask(slug)) { add('ошибка', where, 'ссылка на несуществующую задачу ' + slug); continue; }
        inLesson.set(slug, [...(inLesson.get(slug) ?? []), lesson.title]);
        if (!m.taskSlugs.includes(slug)) add('ошибка', where, 'задача ' + slug + ' есть в уроке, но не привязана к модулю');
      }

      for (const block of lesson.blocks) {
        if (block.type === 'quiz') {
          for (const q of block.questions) {
            if (quizIds.has(q.id)) add('ошибка', where, 'повтор идентификатора вопроса ' + q.id);
            quizIds.add(q.id);
            const options = new Set(q.options.map((o) => o.id));
            if (q.correct.length === 0) add('ошибка', where, 'у вопроса ' + q.id + ' нет верного варианта');
            for (const c of q.correct) if (!options.has(c)) add('ошибка', where, 'верный вариант вне списка: ' + q.id);
          }
        }
        if ((block.type === 'video' || block.type === 'article') && !/^https?:\/\//.test(block.url)) {
          add('ошибка', where, 'пустой или неверный адрес в блоке ' + block.type);
        }
      }

      if (!m.isDemoOnly && lesson.blocks.length === 0) add('ошибка', where, 'урок пуст');
      if (!m.isDemoOnly && lessonTasks.length === 0 && !kinds.has('quiz') && !lesson.title.startsWith('Запись на ревью')) {
        add('замечание', where, 'нет ни задачи, ни теста — урок ничем не закрепляется');
      }
    }
  }

  for (const task of tasks) {
    if (!attached.has(task.slug)) add('замечание', task.slug, 'не привязана ни к одному модулю — ученику недоступна');
    else if (!inLesson.has(task.slug)) add('замечание', task.slug, 'привязана к модулю, но не встречается ни в одном уроке');
    if ((attached.get(task.slug) ?? []).length > 1) {
      add('ошибка', task.slug, 'привязана к нескольким модулям: ' + attached.get(task.slug)!.join(', '));
    }
  }

  /* ---------- 3. Задача должна проверять решение ---------- */
  const algorithmTasks = tasks.filter((t): t is AlgorithmTask => t.kind === 'algorithm');
  for (const task of algorithmTasks) {
    const res = await runWorker(task.starterCode, task.tests);
    const passed = res.results.filter((r: any) => r.passed).length;
    if (passed === task.tests.length && passed > 0) {
      add('ошибка', task.slug, 'пустая заготовка проходит ВСЕ ' + passed + ' проверок — задачу можно сдать, ничего не написав');
    } else if (passed > 0) {
      // Проверка, ожидающая undefined, проходит сама собой: одна такая — норма,
      // но если их большинство, задача почти ничего не требует
      add('замечание', task.slug, 'пустая заготовка проходит ' + passed + ' из ' + task.tests.length + ' — эти проверки ждут undefined и выполняются сами');
    }
  }

  /* ---------- отчёт ---------- */
  out('Блоков: ' + blocks.length + ', модулей: ' + modules.length +
      ', уроков: ' + modules.reduce((s, m) => s + m.lessons.length, 0) +
      ', задач в каталоге: ' + tasks.length);
  out('');
  for (const m of modules) {
    if (m.isDemoOnly) continue;
    out('  ' + (m.blockId ? byBlock.get(m.blockId) : 'без блока') + ' / ' + m.title +
        '  — уроков ' + m.lessons.length + ', задач ' + m.taskSlugs.length);
  }

  const errors = findings.filter((f) => f.level === 'ошибка');
  const notes = findings.filter((f) => f.level === 'замечание');

  out('\n=== ОШИБКИ: ' + errors.length + ' ===');
  for (const f of errors) out('  ' + f.where + ' — ' + f.what);
  out('\n=== ЗАМЕЧАНИЯ: ' + notes.length + ' ===');
  for (const f of notes) out('  ' + f.where + ' — ' + f.what);

  if (errors.length) process.exit(1);
}

main();
