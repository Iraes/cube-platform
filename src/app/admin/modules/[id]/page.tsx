import Link from "next/link";
import { notFound } from "next/navigation";
import { ModuleSettingsForm } from "@/components/admin/ModuleSettingsForm";
import {
  attachTaskAction,
  createLessonAction,
  deleteModuleAction,
  detachTaskAction,
  moveLessonAction,
  moveTaskAction,
  setLessonDemoAction,
  setModuleDemoOnlyAction,
  setTaskDemoAction,
} from "@/lib/actions/admin";
import { getModuleById } from "@/lib/content";
import { getTask, tasks } from "@/lib/tasks";

const arrowClass =
  "text-[11px] leading-none text-faint transition-colors hover:text-accent disabled:opacity-30";

/** Переключатель «показывать в демо-доступе» */
function demoClass(active: boolean) {
  return `shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium transition-colors ${
    active
      ? "bg-ok-soft text-ok hover:opacity-80"
      : "border border-border text-faint hover:border-accent hover:text-accent"
  }`;
}

export default async function AdminModuleEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const module = await getModuleById(id);

  if (!module) notFound();

  const attached = new Set(module.taskSlugs);
  const available = tasks.filter((task) => !attached.has(task.slug));

  return (
    <main>
      <Link
        href="/admin/modules"
        className="mb-4 inline-block text-[13px] text-muted transition-colors hover:text-accent"
      >
        ← Все модули
      </Link>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-text">{module.title}</h1>

      <ModuleSettingsForm module={module} />

      {/* ---------- Витрина ---------- */}
      <section
        className={`mt-6 rounded-lg border p-4 ${
          module.isDemoOnly ? "border-ok/40 bg-ok-soft" : "border-border bg-surface"
        }`}
      >
        <h2 className="mb-1 text-[13.5px] font-semibold text-text">Только в демо-доступе</h2>
        <p className="mb-3 max-w-2xl text-[12.5px] leading-relaxed text-muted">
          {module.isDemoOnly
            ? "Модуля нет в списке на платформе — ни у учеников, ни у вас. Всё его содержимое открыто без входа, отметки «в демо» у отдельных уроков и задач сейчас не действуют."
            : "Убрать модуль из списка на платформе и целиком открыть его в демо-доступе. Пригодится для витринных материалов, которые не входят в программу."}
        </p>
        <form action={setModuleDemoOnlyAction}>
          <input type="hidden" name="id" value={module.id} />
          <input type="hidden" name="isDemoOnly" value={module.isDemoOnly ? "0" : "1"} />
          <button
            type="submit"
            className="h-8 rounded-md border border-border-strong px-3 text-[13px] font-medium text-text transition-colors hover:bg-hover"
          >
            {module.isDemoOnly ? "Вернуть на платформу" : "Сделать витриной"}
          </button>
        </form>
      </section>

      {/* ---------- Уроки ---------- */}
      <section className="mt-8">
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-faint">
          Уроки
        </h2>

        {module.lessons.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-[13px] text-faint">
            Уроков пока нет — добавьте первый.
          </p>
        ) : (
          <ul className="space-y-2">
            {module.lessons.map((lesson, index) => (
              <li
                key={lesson.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5"
              >
                <div className="flex flex-col">
                  <form action={moveLessonAction}>
                    <input type="hidden" name="id" value={lesson.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" disabled={index === 0} className={arrowClass} aria-label="Выше">
                      ▲
                    </button>
                  </form>
                  <form action={moveLessonAction}>
                    <input type="hidden" name="id" value={lesson.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === module.lessons.length - 1}
                      className={arrowClass}
                      aria-label="Ниже"
                    >
                      ▼
                    </button>
                  </form>
                </div>

                <Link
                  href={`/admin/modules/${module.id}/lessons/${lesson.id}`}
                  className="min-w-0 flex-1"
                >
                  <span className="block truncate text-[14px] text-text">{lesson.title}</span>
                  <span className="text-[12px] text-faint">
                    {lesson.blocks.length === 0
                      ? "пустой урок"
                      : `блоков: ${lesson.blocks.length}`}
                  </span>
                </Link>

                <form action={setLessonDemoAction}>
                  <input type="hidden" name="id" value={lesson.id} />
                  <input type="hidden" name="isDemo" value={lesson.isDemo ? "0" : "1"} />
                  <button
                    type="submit"
                    className={demoClass(lesson.isDemo)}
                    title={
                      lesson.isDemo
                        ? "Урок открыт без входа — нажмите, чтобы убрать из демо"
                        : "Показать урок в демо-доступе"
                    }
                  >
                    {lesson.isDemo ? "✓ в демо" : "в демо"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={createLessonAction} className="mt-3 flex flex-wrap gap-2">
          <input type="hidden" name="moduleId" value={module.id} />
          <input
            name="title"
            placeholder="Название урока"
            required
            className="h-9 min-w-56 flex-1 rounded-md border border-border bg-bg px-3 text-[13.5px] text-text outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="h-9 rounded-md border border-border-strong px-4 text-[13.5px] font-medium text-text transition-colors hover:bg-hover"
          >
            Добавить урок
          </button>
        </form>
      </section>

      {/* ---------- Задачи ---------- */}
      <section className="mt-8">
        <h2 className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-faint">
          Задачи
        </h2>
        <p className="mb-3 text-[12.5px] text-faint">
          Задачи хранятся в коде; здесь выбирается, какие из них входят в модуль и в каком порядке.
        </p>

        {module.taskSlugs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-[13px] text-faint">
            К модулю не привязано ни одной задачи.
          </p>
        ) : (
          <ul className="space-y-2">
            {module.taskSlugs.map((slug, index) => (
              <li
                key={slug}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5"
              >
                <div className="flex flex-col">
                  <form action={moveTaskAction}>
                    <input type="hidden" name="moduleId" value={module.id} />
                    <input type="hidden" name="taskSlug" value={slug} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" disabled={index === 0} className={arrowClass} aria-label="Выше">
                      ▲
                    </button>
                  </form>
                  <form action={moveTaskAction}>
                    <input type="hidden" name="moduleId" value={module.id} />
                    <input type="hidden" name="taskSlug" value={slug} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === module.taskSlugs.length - 1}
                      className={arrowClass}
                      aria-label="Ниже"
                    >
                      ▼
                    </button>
                  </form>
                </div>

                <span className="min-w-0 flex-1 truncate text-[14px] text-text">
                  {getTask(slug)?.title ?? slug}
                </span>

                <form action={setTaskDemoAction}>
                  <input type="hidden" name="moduleId" value={module.id} />
                  <input type="hidden" name="taskSlug" value={slug} />
                  <input
                    type="hidden"
                    name="isDemo"
                    value={module.demoTaskSlugs.includes(slug) ? "0" : "1"}
                  />
                  <button
                    type="submit"
                    className={demoClass(module.demoTaskSlugs.includes(slug))}
                    title={
                      module.demoTaskSlugs.includes(slug)
                        ? "Задача открыта без входа — нажмите, чтобы убрать из демо"
                        : "Показать задачу в демо-доступе"
                    }
                  >
                    {module.demoTaskSlugs.includes(slug) ? "✓ в демо" : "в демо"}
                  </button>
                </form>

                <form action={detachTaskAction}>
                  <input type="hidden" name="moduleId" value={module.id} />
                  <input type="hidden" name="taskSlug" value={slug} />
                  <button
                    type="submit"
                    className="text-[12.5px] text-muted transition-colors hover:text-err"
                  >
                    убрать
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {available.length > 0 && (
          <form action={attachTaskAction} className="mt-3 flex flex-wrap gap-2">
            <input type="hidden" name="moduleId" value={module.id} />
            <select
              name="taskSlug"
              className="h-9 min-w-56 flex-1 rounded-md border border-border bg-bg px-2 text-[13.5px] text-text outline-none focus:border-accent"
            >
              {available.map((task) => (
                <option key={task.slug} value={task.slug}>
                  {task.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 rounded-md border border-border-strong px-4 text-[13.5px] font-medium text-text transition-colors hover:bg-hover"
            >
              Добавить задачу
            </button>
          </form>
        )}
      </section>

      {/* ---------- Удаление ---------- */}
      <section className="mt-10 rounded-lg border border-err/35 bg-err-soft p-4">
        <h2 className="mb-1 text-[13.5px] font-semibold text-err">Удалить модуль</h2>
        <p className="mb-3 text-[12.5px] text-muted">
          Вместе с модулем удалятся его уроки и отметки «прочитано» у учеников. Решённые задачи
          останутся: они живут отдельно от модулей.
        </p>
        <form action={deleteModuleAction}>
          <input type="hidden" name="id" value={module.id} />
          <button
            type="submit"
            className="h-8 rounded-md border border-err/50 px-3 text-[13px] text-err transition-colors hover:bg-err/10"
          >
            Удалить «{module.title}»
          </button>
        </form>
      </section>
    </main>
  );
}
