import { TaskPageContent } from "@/app/tasks/TaskPageContent";
import { getTask } from "@/lib/tasks";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getTask(slug);
  return { title: task ? `${task.title} — Cube` : "Задача не найдена — Cube" };
}

export default async function LegacyTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const from = Array.isArray(query.from) ? query.from[0] : query.from;
  return <TaskPageContent taskSlug={slug} lessonSlug={from} />;
}
