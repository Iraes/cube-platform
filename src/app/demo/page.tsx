import Link from "next/link";
import { redirect } from "next/navigation";
import { getDemoContent } from "@/lib/content";
import { getSessionUser } from "@/lib/session";
import { getTask } from "@/lib/tasks";

export const metadata = { title: "Демо-доступ — Cube" };

export default async function DemoPage() {
  // Вошедшему демо ни к чему — у него открыто всё
  if (await getSessionUser()) redirect("/");

  const entries = await getDemoContent();
  const total = entries.reduce(
    (sum, entry) => sum + entry.lessons.length + entry.taskSlugs.length,
    0,
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-text">Демо-доступ</h1>
      <p className="mb-8 max-w-xl text-[14px] leading-relaxed text-muted">
        Несколько материалов и задач, открытых без регистрации. Код можно писать и запускать —
        он выполняется прямо в браузере. Прогресс в демо не сохраняется: для этого нужен логин,
        его выдаёт владелец платформы.
      </p>

      {total === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface p-6 text-[13.5px] text-faint">
          Демо-материалы пока не выбраны. Владелец отмечает их в разделе управления.
        </p>
      ) : (
        <div className="space-y-8">
          {entries.map(({ module, lessons, taskSlugs }) => (
            <section key={module.id}>
              <h2 className="mb-1 text-[16.5px] font-semibold text-text">{module.title}</h2>
              <p className="mb-3 text-[13px] leading-relaxed text-muted">{module.description}</p>

              <ul className="space-y-2">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/modules/${module.slug}/lessons/${lesson.slug}`}
                      prefetch={false}
                      className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent hover:bg-surface-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-[14.5px] text-text">
                        {lesson.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-hover px-2.5 py-0.5 text-[11px] text-muted">
                        урок
                      </span>
                    </Link>
                  </li>
                ))}

                {taskSlugs.map((slug) => {
                  const task = getTask(slug);
                  if (!task) return null;

                  return (
                    <li key={slug}>
                      <Link
                        href={`/tasks/${slug}`}
                        prefetch={false}
                        className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent hover:bg-surface-2"
                      >
                        <span className="min-w-0 flex-1 truncate text-[14.5px] text-text">
                          {task.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent-strong">
                          задача
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Link
          href="/login"
          className="h-9 rounded-md bg-accent px-5 text-[13.5px] font-semibold leading-9 text-accent-fg transition-colors hover:bg-accent-strong"
        >
          Войти
        </Link>
        <span className="text-[13px] text-faint">
          Полный доступ и сохранение прогресса — по логину от владельца платформы.
        </span>
      </div>
    </main>
  );
}
