import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/ProgressBar";
import { getModules } from "@/lib/content";
import { formatActivity, formatDate } from "@/lib/datetime";
import { withPlural } from "@/lib/plural";
import { getStudentReport } from "@/lib/progress";
import { requireTeacher } from "@/lib/session";
import { getTask } from "@/lib/tasks";

const ROLE_LABELS: Record<string, string> = {
  student: "Ученик",
  teacher: "Преподаватель",
  admin: "Администратор",
};

/** Сколько отправок подряд без успеха — повод посмотреть, где ученик застрял */
const STUCK_ATTEMPTS = 5;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getStudentReport(id);
  return { title: report ? `${report.user.name || report.user.email} — Cube` : "Ученик не найден — Cube" };
}

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();

  const { id } = await params;
  const [report, modules] = await Promise.all([getStudentReport(id), getModules()]);

  if (!report) notFound();

  const { user, tasks, lessons } = report;

  const attemptsBySlug = new Map(tasks.map((task) => [task.taskSlug, task]));
  const readLessons = new Map(lessons.map((lesson) => [lesson.lessonId, lesson.readAt]));

  const program = modules.filter((module) => !module.isDemoOnly);
  const showcase = modules.filter((module) => module.isDemoOnly);

  const programTasks = new Set(program.flatMap((module) => module.taskSlugs));
  const programLessons = new Set(program.flatMap((module) => module.lessons.map((l) => l.id)));

  const solved = user.solvedTasks.filter((slug) => programTasks.has(slug)).length;
  const read = user.readLessons.filter((lessonId) => programLessons.has(lessonId)).length;

  // Задача сдана далеко не с первого раза или не сдана вовсе после многих попыток
  const stuck = tasks.filter((task) => !task.solved && task.attempts >= STUCK_ATTEMPTS);

  return (
    <main>
      <Link
        href="/students"
        className="mb-4 inline-block text-[13px] text-muted transition-colors hover:text-accent"
      >
        ← Все ученики
      </Link>

      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          {user.name || user.email}
        </h1>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11.5px] text-faint">
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </div>
      <p className="mb-6 text-[13px] text-muted">
        {user.name ? `${user.email} · ` : ""}на платформе с {formatDate(user.createdAt)}
      </p>

      <div className="mb-6 flex flex-wrap gap-x-8 gap-y-2 rounded-lg border border-border bg-surface px-5 py-3">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-faint">
            Последний заход
          </span>
          <span className="text-[13.5px] text-text">
            {user.lastSeen ? formatActivity(user.lastSeen) : "не заходил"}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-faint">
            Последнее действие в прогрессе
          </span>
          <span className="text-[13.5px] text-text">{formatActivity(user.lastActivity)}</span>
        </div>
      </div>

      {/* ---------- Сводка ---------- */}
      <section className="mb-8 grid gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-faint">
            Задачи программы
          </span>
          <ProgressBar done={solved} total={programTasks.size} />
          <span className="mt-1.5 block text-[12px] text-faint">
            {withPlural(user.attemptCount, ["отправка", "отправки", "отправок"])} на проверку всего
          </span>
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-faint">
            Прочитанные уроки
          </span>
          <ProgressBar done={read} total={programLessons.size} />
          <span className="mt-1.5 block text-[12px] text-faint">
            отмечает сам ученик кнопкой «Прочитано»
          </span>
        </div>
      </section>

      {/* ---------- Где буксует ---------- */}
      {stuck.length > 0 && (
        <section className="mb-8 rounded-lg border border-warn/40 bg-warn-soft p-4">
          <h2 className="mb-2 text-[13.5px] font-semibold text-text">Стоит посмотреть</h2>
          <ul className="space-y-1">
            {stuck.map((task) => (
              <li key={task.taskSlug} className="text-[13px] text-muted">
                <span className="text-text">{getTask(task.taskSlug)?.title ?? task.taskSlug}</span>
                {" — "}
                {withPlural(task.attempts, ["попытка", "попытки", "попыток"])}, задача не сдана
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Разбор по модулям ---------- */}
      {[...program, ...showcase].map((module) => (
        <section key={module.id} className="mb-6">
          <h2 className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-faint">
            {module.title}
            {module.isDemoOnly && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[10.5px] normal-case tracking-normal">
                вне программы
              </span>
            )}
          </h2>

          {module.lessons.length === 0 && module.taskSlugs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-3 text-[13px] text-faint">
              Модуль пуст.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {module.lessons.map((lesson) => {
                const readAt = readLessons.get(lesson.id);
                const isRead = readLessons.has(lesson.id);

                return (
                  <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      aria-hidden="true"
                      className={`w-4 shrink-0 text-center font-bold ${isRead ? "text-ok" : "text-faint"}`}
                    >
                      {isRead ? "✓" : "·"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-text">
                      {lesson.title}
                    </span>
                    <span className="shrink-0 text-[12px] text-faint">урок</span>
                    <span className="w-32 shrink-0 text-right text-[12px] text-muted">
                      {isRead ? formatActivity(readAt ?? null) : "не открыт"}
                    </span>
                  </li>
                );
              })}

              {module.taskSlugs.map((slug) => {
                const attempt = attemptsBySlug.get(slug);
                const title = getTask(slug)?.title ?? slug;

                return (
                  <li key={slug} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      aria-hidden="true"
                      className={`w-4 shrink-0 text-center font-bold ${
                        attempt?.solved ? "text-ok" : attempt ? "text-warn" : "text-faint"
                      }`}
                    >
                      {attempt?.solved ? "✓" : attempt ? "…" : "·"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-text">{title}</span>
                    <span className="shrink-0 text-[12px] text-faint">
                      {attempt
                        ? withPlural(attempt.attempts, ["попытка", "попытки", "попыток"])
                        : "задача"}
                    </span>
                    <span className="w-32 shrink-0 text-right text-[12px] text-muted">
                      {attempt ? formatActivity(attempt.lastAt) : "не начата"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
