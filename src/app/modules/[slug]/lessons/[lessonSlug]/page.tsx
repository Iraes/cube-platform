import { notFound, redirect } from "next/navigation";
import { LessonView } from "@/components/LessonView";
import { findLesson, getModuleBySlug, getNextStep } from "@/lib/content";
import { EMPTY_PROGRESS, getUserProgress } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { toPublicBlocks } from "@/lib/quiz";
import { getTask } from "@/lib/tasks";
import { getRequiredTaskSlugs, isLessonUnlocked } from "@/lib/learningAccess";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const module = await getModuleBySlug(slug);
  const lesson = module && findLesson(module, lessonSlug);
  return { title: lesson ? `${lesson.title} — Cube` : "Урок не найден — Cube" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const [user, module] = await Promise.all([getSessionUser(), getModuleBySlug(slug)]);
  const lesson = module && findLesson(module, lessonSlug);

  if (!module || !lesson) notFound();

  // Без входа пускаем только на уроки, отмеченные в админке как демо
  if (!user && !lesson.isDemo) redirect("/login");

  const progress = user ? await getUserProgress(user.id) : EMPTY_PROGRESS;
  if (user && !isLessonUnlocked(module, lesson.id, progress)) {
    redirect(`/modules/${module.slug}`);
  }

  const index = module.lessons.findIndex((item) => item.slug === lesson.slug);
  const requiredTaskSlugs = getRequiredTaskSlugs(lesson);
  const solvedTasks = new Set(progress.solvedTasks);
  const remainingTaskSlugs = requiredTaskSlugs.filter((taskSlug) => !solvedTasks.has(taskSlug));

  // В демо следующий шаг тоже должен быть демо, иначе упрёмся в форму входа
  const nextStep = getNextStep(module, lesson.id);
  const nextAllowed =
    user ||
    (nextStep?.kind === "lesson"
      ? module.lessons.some((item) => item.id === nextStep.id && item.isDemo)
      : nextStep
        ? module.demoTaskSlugs.includes(nextStep.id)
        : false);

  // Названия задач для блоков-переходов внутри урока
  const taskTitles: Record<string, string> = {};
  for (const block of lesson.blocks) {
    if (block.type !== "task") continue;
    const task = getTask(block.slug);
    if (task) taskTitles[block.slug] = task.title;
  }

  return (
    <LessonView
      moduleSlug={module.slug}
      moduleTitle={module.title}
      lessonSlug={lesson.slug}
      lessonTitle={lesson.title}
      lessonSummary={lesson.summary}
      lessonId={lesson.id}
      read={progress.readLessons.includes(lesson.id)}
      nextStep={nextAllowed ? nextStep : undefined}
      position={{ index: index + 1, total: module.lessons.length }}
      isDemo={!user}
      taskTitles={taskTitles}
      remainingTaskTitles={remainingTaskSlugs.map((taskSlug) => taskTitles[taskSlug] ?? taskSlug)}
      blocks={toPublicBlocks(lesson.blocks)}
    />
  );
}
