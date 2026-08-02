import { ModulesList, type ModuleCard } from "@/components/ModulesList";
import { getModules, getSteps } from "@/lib/content";
import { getUserProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function Home() {
  const user = await requireUser();
  const [modules, progress] = await Promise.all([getModules(), getUserProgress(user.id)]);

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
    }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-text">Модули</h1>
      <p className="mb-8 max-w-xl text-[14px] leading-relaxed text-muted">
        Каждый модуль — это теория и практика подряд: сначала видео и статьи, затем задачи по
        пройденному. Код выполняется прямо в браузере.
      </p>

      {cards.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface p-6 text-[13.5px] text-faint">
          Модулей пока нет. Их добавляет владелец платформы в разделе управления.
        </p>
      ) : (
        <ModulesList modules={cards} progress={progress} />
      )}
    </main>
  );
}
