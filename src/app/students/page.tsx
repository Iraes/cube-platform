import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { getModules } from "@/lib/content";
import { formatActivity } from "@/lib/datetime";
import { getStudentSummaries } from "@/lib/progress";
import { requireTeacher } from "@/lib/session";
import { withPlural } from "@/lib/plural";

const ROLE_LABELS: Record<string, string> = {
  student: "Ученик",
  teacher: "Преподаватель",
  admin: "Администратор",
};

export default async function StudentsPage() {
  await requireTeacher();

  const [summaries, modules] = await Promise.all([getStudentSummaries(), getModules()]);

  // Витринные модули в программу не входят — их содержимое открыто всем
  // без входа, и требовать его прохождения от ученика нечестно
  const program = modules.filter((module) => !module.isDemoOnly);
  const programTasks = new Set(program.flatMap((module) => module.taskSlugs));
  const programLessons = new Set(program.flatMap((module) => module.lessons.map((l) => l.id)));

  // Ученики выше: преподавателю обычно нужны они, а не коллеги
  const order: Record<string, number> = { student: 0, teacher: 1, admin: 2 };
  const people = [...summaries].sort(
    (a, b) => (order[a.role] ?? 3) - (order[b.role] ?? 3) || a.email.localeCompare(b.email),
  );

  return (
    <main>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-text">Ученики</h1>
      <p className="mb-8 max-w-2xl text-[13.5px] leading-relaxed text-muted">
        Прогресс считается по программе: {withPlural(programLessons.size, ["урок", "урока", "уроков"])}{" "}
        и {withPlural(programTasks.size, ["задача", "задачи", "задач"])} из{" "}
        {withPlural(program.length, ["модуля", "модулей", "модулей"])}. Витринные модули, открытые
        в демо, в счёт не идут.
      </p>

      {people.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-[13.5px] text-faint">
          Пользователей пока нет.
        </p>
      ) : (
        <ul className="space-y-2">
          {people.map((person) => {
            const solved = person.solvedTasks.filter((slug) => programTasks.has(slug)).length;
            const read = person.readLessons.filter((id) => programLessons.has(id)).length;

            return (
            <li key={person.id}>
              <Link
                href={`/students/${person.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent hover:bg-hover"
              >
                <div className="min-w-48 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14.5px] font-medium text-text">
                      {person.name || person.email}
                    </span>
                    {person.role !== "student" && (
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] text-faint">
                        {ROLE_LABELS[person.role] ?? person.role}
                      </span>
                    )}
                  </div>
                  {person.name && (
                    <span className="mt-0.5 block truncate text-[12px] text-faint">
                      {person.email}
                    </span>
                  )}
                </div>

                <div className="w-40 shrink-0">
                  <span className="mb-1 block text-[11px] uppercase tracking-wider text-faint">
                    Задачи
                  </span>
                  <ProgressBar done={solved} total={programTasks.size} />
                </div>

                <div className="w-40 shrink-0">
                  <span className="mb-1 block text-[11px] uppercase tracking-wider text-faint">
                    Уроки
                  </span>
                  <ProgressBar done={read} total={programLessons.size} />
                </div>

                <span className="w-36 shrink-0 text-right text-[12.5px] text-muted">
                  {formatActivity(person.lastActivity)}
                </span>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
