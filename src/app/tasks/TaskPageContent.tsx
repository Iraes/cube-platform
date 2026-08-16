import { notFound, redirect } from "next/navigation";
import { QuizWorkspace } from "@/components/QuizWorkspace";
import { TaskWorkspace } from "@/components/TaskWorkspace";
import { findLesson, getModuleForTask, getNextStep, getNextStepFromLesson } from "@/lib/content";
import { isLessonUnlocked, isStepUnlocked, isTaskUnlocked } from "@/lib/learningAccess";
import { EMPTY_PROGRESS, getUserProgress } from "@/lib/progress";
import { toPublicQuestions } from "@/lib/quiz";
import { getSessionUser } from "@/lib/session";
import { getTask } from "@/lib/tasks";

type Props = { taskSlug: string; lessonSlug?: string; moduleSlug?: string };

export async function TaskPageContent({ taskSlug, lessonSlug, moduleSlug }: Props) {
  const task = getTask(taskSlug);
  if (!task) notFound();

  const [user, module] = await Promise.all([getSessionUser(), getModuleForTask(taskSlug)]);
  if (moduleSlug && module?.slug !== moduleSlug) notFound();

  const origin = lessonSlug && module ? findLesson(module, lessonSlug) : undefined;
  if (lessonSlug && (!origin || !origin.blocks.some((block) => block.type === "task" && block.slug === taskSlug))) notFound();

  const isDemoTask = module?.demoTaskSlugs.includes(taskSlug) ?? false;
  if (!user && !isDemoTask) redirect("/login");

  const progress = user ? await getUserProgress(user.id) : EMPTY_PROGRESS;
  if (user && module && !isTaskUnlocked(module, taskSlug, progress)) redirect(`/modules/${module.slug}`);
  if (user && module && origin && !isLessonUnlocked(module, origin.id, progress)) redirect(`/modules/${module.slug}`);

  const backTo = origin && module
    ? { href: `/modules/${module.slug}/lessons/${origin.slug}`, label: origin.title }
    : undefined;
  const nextStep = module
    ? origin ? getNextStepFromLesson(module, origin, taskSlug) : getNextStep(module, taskSlug)
    : undefined;
  const nextAllowed = user
    ? Boolean(nextStep && module && isStepUnlocked(module, nextStep, progress))
    : nextStep?.kind === "task"
      ? (module?.demoTaskSlugs.includes(nextStep.id) ?? false)
      : (module?.lessons.some((lesson) => lesson.id === nextStep?.id && lesson.isDemo) ?? false);

  if (task.kind === "quiz") {
    return <QuizWorkspace slug={task.slug} title={task.title} description={task.description} questions={toPublicQuestions(task)} solved={progress.solvedTasks.includes(taskSlug)} moduleSlug={module?.slug} moduleTitle={module?.title} backTo={backTo} nextStep={nextAllowed ? nextStep : undefined} isDemo={!user} />;
  }

  return <TaskWorkspace task={task} solved={progress.solvedTasks.includes(taskSlug)} moduleSlug={module?.slug} moduleTitle={module?.title} backTo={backTo} nextStep={nextAllowed ? nextStep : undefined} isDemo={!user} />;
}
