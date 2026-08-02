import { notFound, redirect } from "next/navigation";
import { QuizWorkspace } from "@/components/QuizWorkspace";
import { TaskWorkspace } from "@/components/TaskWorkspace";
import { toPublicQuestions } from "@/lib/quiz";
import { getModuleForTask, getNextStep, getNextStepFromLesson } from "@/lib/content";
import { EMPTY_PROGRESS, getUserProgress } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { getTask } from "@/lib/tasks";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getTask(slug);
  return { title: task ? `${task.title} — Cube` : "Задача не найдена — Cube" };
}

export default async function TaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const task = getTask(slug);

  if (!task) notFound();

  const [user, module] = await Promise.all([getSessionUser(), getModuleForTask(slug)]);

  // Без входа пускаем только на задачи, отмеченные в админке как демо
  const isDemoTask = module?.demoTaskSlugs.includes(slug) ?? false;
  if (!user && !isDemoTask) redirect("/login");

  const progress = user ? await getUserProgress(user.id) : EMPTY_PROGRESS;

  // Ученик пришёл из урока: ?from=<слаг урока>. Значение из адресной строки,
  // поэтому урок ищем в модуле задачи и проверяем доступ — чужой или закрытый
  // слаг просто игнорируем и ведём себя как раньше.
  const from = Array.isArray(query.from) ? query.from[0] : query.from;
  const fromLesson = from ? module?.lessons.find((item) => item.slug === from) : undefined;
  const origin = fromLesson && (user || fromLesson.isDemo) ? fromLesson : undefined;

  const backTo =
    origin && module
      ? { href: `/modules/${module.slug}/lessons/${origin.slug}`, label: origin.title }
      : undefined;

  const nextStep = module
    ? origin
      ? getNextStepFromLesson(module, origin, slug)
      : getNextStep(module, slug)
    : undefined;

  const nextAllowed =
    user ||
    (nextStep?.kind === "task"
      ? (module?.demoTaskSlugs.includes(nextStep.id) ?? false)
      : (module?.lessons.some((item) => item.id === nextStep?.id && item.isDemo) ?? false));

  // Тест исполнять нечего: у него свой экран и серверная проверка ответов
  if (task.kind === "quiz") {
    return (
      <QuizWorkspace
        slug={task.slug}
        title={task.title}
        description={task.description}
        questions={toPublicQuestions(task)}
        solved={progress.solvedTasks.includes(slug)}
        moduleSlug={module?.slug}
        moduleTitle={module?.title}
        backTo={backTo}
        nextStep={nextAllowed ? nextStep : undefined}
        isDemo={!user}
      />
    );
  }

  return (
    <TaskWorkspace
      task={task}
      solved={progress.solvedTasks.includes(slug)}
      moduleSlug={module?.slug}
      moduleTitle={module?.title}
      backTo={backTo}
      nextStep={nextAllowed ? nextStep : undefined}
      isDemo={!user}
    />
  );
}
