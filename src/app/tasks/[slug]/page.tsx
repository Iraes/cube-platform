import { notFound, redirect } from "next/navigation";
import { TaskWorkspace } from "@/components/TaskWorkspace";
import { getModuleForTask, getNextStep } from "@/lib/content";
import { EMPTY_PROGRESS, getUserProgress } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { getTask } from "@/lib/tasks";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getTask(slug);
  return { title: task ? `${task.title} — Cube` : "Задача не найдена — Cube" };
}

export default async function TaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getTask(slug);

  if (!task) notFound();

  const [user, module] = await Promise.all([getSessionUser(), getModuleForTask(slug)]);

  // Без входа пускаем только на задачи, отмеченные в админке как демо
  const isDemoTask = module?.demoTaskSlugs.includes(slug) ?? false;
  if (!user && !isDemoTask) redirect("/login");

  const progress = user ? await getUserProgress(user.id) : EMPTY_PROGRESS;
  const nextStep = module ? getNextStep(module, slug) : undefined;
  const nextAllowed =
    user ||
    (nextStep?.kind === "task"
      ? (module?.demoTaskSlugs.includes(nextStep.id) ?? false)
      : (module?.lessons.some((item) => item.id === nextStep?.id && item.isDemo) ?? false));

  return (
    <TaskWorkspace
      task={task}
      solved={progress.solvedTasks.includes(slug)}
      moduleSlug={module?.slug}
      moduleTitle={module?.title}
      nextStep={nextAllowed ? nextStep : undefined}
      isDemo={!user}
    />
  );
}
