import { ModulesList, type ModuleCard } from "@/components/ModulesList";
import { getCourseBlocks, getModules, getSteps } from "@/lib/content";
import { getUserProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function Home() {
  const user = await requireUser();
  const [modules, blocks, progress] = await Promise.all([getModules(), getCourseBlocks(), getUserProgress(user.id)]);

  // Витринные модули на платформу не выводим — они живут только в демо
  const cards: ModuleCard[] = modules
    .filter((module) => !module.isDemoOnly)
    .map((module) => ({
      slug: module.slug,
      title: module.title,
      description: module.description,
      lessonCount: module.lessons.length,
      taskCount: module.taskSlugs.length,
      steps: getSteps(module),
      blockId: module.blockId,
    }));

  const ungrouped = cards.filter((module) => !module.blockId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-text">Программа обучения</h1>
      <p className="mb-8 max-w-xl text-[14px] leading-relaxed text-muted">
        Каждый модуль — это теория и практика подряд: сначала видео и статьи, затем задачи по
        пройденному. Код выполняется прямо в браузере.
      </p>

      {cards.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface p-6 text-[13.5px] text-faint">
          Модулей пока нет. Их добавляет владелец платформы в разделе управления.
        </p>
      ) : <div className="space-y-10">
        {blocks.map((block) => {
          const own = cards.filter((module) => module.blockId === block.id);
          if (own.length === 0) return null;
          return (
            <section key={block.id}>
              <div className="mb-4 border-l-2 border-accent pl-4">
                <h2 className="text-[18px] font-semibold text-text">{block.title}</h2>
                {block.description && <p className="mt-1 text-[13.5px] text-muted">{block.description}</p>}
              </div>
              <ModulesList modules={own} progress={progress} />
            </section>
          );
        })}
        {ungrouped.length > 0 && (
          <section>
            {blocks.length > 0 && <h2 className="mb-4 text-[15px] font-semibold text-muted">Другие модули</h2>}
            <ModulesList modules={ungrouped} progress={progress} />
          </section>
        )}
      </div>}
    </main>
  );
}
