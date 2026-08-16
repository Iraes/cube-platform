import { TaskPageContent } from "@/app/tasks/TaskPageContent";
import { getTask } from "@/lib/tasks";

type Params = Promise<{ slug: string; lessonSlug: string; taskSlug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { taskSlug } = await params;
  const task = getTask(taskSlug);
  return { title: task ? `${task.title} — Cube` : "Задача не найдена — Cube" };
}

export default async function LessonTaskPage({ params }: { params: Params }) {
  const { slug, lessonSlug, taskSlug } = await params;
  return <TaskPageContent moduleSlug={slug} lessonSlug={lessonSlug} taskSlug={taskSlug} />;
}
