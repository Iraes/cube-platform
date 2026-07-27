import { notFound } from "next/navigation";
import { TaskWorkspace } from "@/components/TaskWorkspace";
import { getModuleForTask, getNextStep } from "@/lib/content";
import { getUserProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { getTask } from "@/lib/tasks";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getTask(slug);
  return { title: task ? `${task.title} — Fabel` : "Задача не найдена — Fabel" };
}

export default async function TaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const task = getTask(slug);

  if (!task) notFound();

  const module = getModuleForTask(slug);
  const progress = await getUserProgress(user.id);

  return (
    <TaskWorkspace
      task={task}
      solved={progress.solvedTasks.includes(slug)}
      moduleSlug={module?.slug}
      moduleTitle={module?.title}
      nextStep={module ? getNextStep(module, slug) : undefined}
    />
  );
}
