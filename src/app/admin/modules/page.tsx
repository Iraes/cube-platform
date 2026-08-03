import Link from "next/link";
import { ModuleCreateForm } from "@/components/admin/ModuleCreateForm";
import { CourseBlockCreateForm } from "@/components/admin/CourseBlockCreateForm";
import { deleteCourseBlockAction, moveCourseBlockAction, moveModuleAction, setModuleBlockAction } from "@/lib/actions/admin";
import { getCourseBlocks, getModules } from "@/lib/content";
import { withPlural } from "@/lib/plural";

export default async function AdminModules() {
  const [modules, blocks] = await Promise.all([getModules(), getCourseBlocks()]);

  return (
    <main>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-text">Блоки и модули</h1>

      <CourseBlockCreateForm />

      {blocks.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-faint">Блоки курса</h2>
          <ul className="space-y-2">
            {blocks.map((block, index) => (
              <li key={block.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                <div className="flex flex-col">
                  {(["up", "down"] as const).map((direction) => (
                    <form action={moveCourseBlockAction} key={direction}>
                      <input type="hidden" name="id" value={block.id} />
                      <input type="hidden" name="direction" value={direction} />
                      <button type="submit" disabled={direction === "up" ? index === 0 : index === blocks.length - 1} className="text-[11px] leading-none text-faint hover:text-accent disabled:opacity-30">{direction === "up" ? "▲" : "▼"}</button>
                    </form>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[14.5px] font-medium text-text">{block.title}</span>
                  <span className="ml-2 text-[12px] text-faint">{modules.filter((module) => module.blockId === block.id).length} мод.</span>
                </div>
                <form action={deleteCourseBlockAction}>
                  <input type="hidden" name="id" value={block.id} />
                  <button type="submit" className="text-[12.5px] text-muted hover:text-err">удалить</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mb-3 mt-8 text-[12px] font-semibold uppercase tracking-wider text-faint">Модули</h2>

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

              <form action={setModuleBlockAction} className="flex shrink-0 items-center gap-2">
                <input type="hidden" name="moduleId" value={module.id} />
                <select name="blockId" defaultValue={module.blockId ?? ""} className="h-8 max-w-52 rounded-md border border-border bg-bg px-2 text-[12.5px] text-text">
                  <option value="">Без блока</option>
                  {blocks.map((block) => <option key={block.id} value={block.id}>{block.title}</option>)}
                </select>
                <button type="submit" className="h-8 rounded-md border border-border px-2.5 text-[12px] text-muted hover:text-accent">Сохранить</button>
              </form>

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
