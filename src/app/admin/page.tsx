import Link from "next/link";
import { getModules } from "@/lib/content";
import { listUsers } from "@/lib/db/users";
import { tasks } from "@/lib/tasks";
import { withPlural } from "@/lib/plural";

export default async function AdminHome() {
  const [modules, users] = await Promise.all([getModules(), listUsers()]);
  const lessonCount = modules.reduce((sum, module) => sum + module.lessons.length, 0);

  const cards = [
    {
      href: "/admin/modules",
      title: "Модули и уроки",
      value: `${withPlural(modules.length, ["модуль", "модуля", "модулей"])}, ${withPlural(lessonCount, ["урок", "урока", "уроков"])}`,
      hint: "Создать раздел, добавить видео и статьи, собрать порядок прохождения",
    },
    {
      href: "/admin/users",
      title: "Пользователи",
      value: withPlural(users.length, ["учётная запись", "учётные записи", "учётных записей"]),
      hint: "Завести ученика, сменить пароль или роль",
    },
  ];

  return (
    <main>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-text">Управление</h1>
      <p className="mb-8 max-w-2xl text-[14px] leading-relaxed text-muted">
        Здесь заводят учеников и собирают учебные материалы. Задачи пока живут в коде — в модуль
        они добавляются из готового списка.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent hover:bg-surface-2"
          >
            <h2 className="text-[15.5px] font-semibold text-text">{card.title}</h2>
            <p className="mt-1 text-[13px] text-accent-strong">{card.value}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{card.hint}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-[12.5px] text-faint">
        Задач в каталоге: {tasks.length}. Новые добавляются файлами в{" "}
        <code className="rounded bg-hover px-1.5 py-0.5 font-mono">src/lib/tasks</code>.
      </p>
    </main>
  );
}
