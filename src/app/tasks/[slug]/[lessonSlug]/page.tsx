import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findLesson, getModuleBySlug } from "@/lib/content";
import { getLessonTaskSlugs, isLessonUnlocked } from "@/lib/learningAccess";
import { getUserProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";
import { getTask } from "@/lib/tasks";

type Params = Promise<{ slug: string; lessonSlug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug, lessonSlug } = await params;
  const module = await getModuleBySlug(slug);
  const lesson = module ? findLesson(module, lessonSlug) : undefined;
  return { title: lesson ? `Задачи: ${lesson.title} — Cube` : "Урок не найден — Cube" };
}

export default async function LessonTasksPage({ params }: { params: Params }) {
  const user = await requireUser();
  const { slug, lessonSlug } = await params;
  const module = await getModuleBySlug(slug);
  const lesson = module ? findLesson(module, lessonSlug) : undefined;
  if (!module || !lesson) notFound();

  const progress = await getUserProgress(user.id);
  if (!isLessonUnlocked(module, lesson.id, progress)) redirect(`/modules/${module.slug}`);

  const tasks = getLessonTaskSlugs(lesson).flatMap((taskSlug) => {
    const task = getTask(taskSlug);
    return task ? [task] : [];
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link className="text-sm text-[var(--c-muted)] hover:text-[var(--c-text)]" href={`/modules/${module.slug}/lessons/${lesson.slug}`}>← {lesson.title}</Link>
      <h1 className="mt-6 text-3xl font-semibold">Задачи урока</h1>
      <p className="mt-2 text-[var(--c-muted)]">{module.title} · {lesson.title}</p>
      <div className="mt-8 grid gap-3">
        {tasks.map((task, index) => {
          const solved = progress.solvedTasks.includes(task.slug);
          return (
            <Link key={task.slug} href={`/tasks/${module.slug}/${lesson.slug}/${task.slug}`} className="flex items-center justify-between rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] px-5 py-4 transition hover:border-[var(--c-faint)]">
              <span>{index + 1}. {task.title}</span>
              <span className="text-sm text-[var(--c-muted)]">{solved ? "Решена" : "Не решена"}</span>
            </Link>
          );
        })}
        {tasks.length === 0 && <p className="text-[var(--c-muted)]">У этого урока пока нет задач.</p>}
      </div>
    </main>
  );
}
