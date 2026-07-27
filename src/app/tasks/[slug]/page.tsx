import { notFound } from "next/navigation";
import { TaskWorkspace } from "@/components/TaskWorkspace";
import { getModuleForTask, getNextStep } from "@/lib/content";
import { getTask, getTaskSlugs } from "@/lib/tasks";

export function generateStaticParams() {
  return getTaskSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getTask(slug);
  return { title: task ? `${task.title} — Fabel` : "Задача не найдена — Fabel" };
}

export default async function TaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getTask(slug);

  if (!task) notFound();

  const module = getModuleForTask(slug);

  return (
    <TaskWorkspace
      task={task}
      moduleSlug={module?.slug}
      moduleTitle={module?.title}
      nextStep={module ? getNextStep(module, slug) : undefined}
    />
  );
}
