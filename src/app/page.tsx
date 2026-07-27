import { ModulesList, type ModuleCard } from "@/components/ModulesList";
import { getSteps, modules } from "@/lib/content";
import { getUserProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export default async function Home() {
  const user = await requireUser();
  const progress = await getUserProgress(user.id);

  const cards: ModuleCard[] = modules.map((module) => ({
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

      <ModulesList modules={cards} progress={progress} />
    </main>
  );
}
