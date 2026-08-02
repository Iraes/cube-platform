import Link from "next/link";
import { ModuleCreateForm } from "@/components/admin/ModuleCreateForm";
import { moveModuleAction } from "@/lib/actions/admin";
import { getModules } from "@/lib/content";
import { withPlural } from "@/lib/plural";

export default async function AdminModules() {
  const modules = await getModules();

  return (
    <main>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-text">Модули</h1>

      <ModuleCreateForm />

      {modules.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-5 text-[13.5px] text-faint">
          Пока ни одного модуля.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {modules.map((module, index) => (
            <li
              key={module.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
            >
              <div className="flex flex-col">
                <form action={moveModuleAction}>
                  <input type="hidden" name="id" value={module.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="text-[11px] leading-none text-faint transition-colors hover:text-accent disabled:opacity-30"
                    aria-label="Выше"
                  >
                    ▲
                  </button>
                </form>
                <form action={moveModuleAction}>
                  <input type="hidden" name="id" value={module.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === modules.length - 1}
                    className="text-[11px] leading-none text-faint transition-colors hover:text-accent disabled:opacity-30"
                    aria-label="Ниже"
                  >
                    ▼
                  </button>
                </form>
              </div>

              <Link href={`/admin/modules/${module.id}`} className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[14.5px] font-medium text-text">
                    {module.title}
                  </span>
                  {module.isDemoOnly && (
                    <span className="shrink-0 rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-medium text-ok">
                      только в демо
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[12px] text-faint">
                  {withPlural(module.lessons.length, ["урок", "урока", "уроков"])} ·{" "}
                  {withPlural(module.taskSlugs.length, ["задача", "задачи", "задач"])} ·{" "}
                  <code className="font-mono">/{module.slug}</code>
                </span>
              </Link>

              <Link
                href={`/modules/${module.slug}`}
                className="shrink-0 text-[12.5px] text-muted transition-colors hover:text-accent"
              >
                посмотреть →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
