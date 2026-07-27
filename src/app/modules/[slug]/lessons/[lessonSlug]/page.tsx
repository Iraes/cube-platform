import { notFound } from "next/navigation";
import { LessonView } from "@/components/LessonView";
import { getLesson, getModule, getNextStep, lessonId } from "@/lib/content";
import { getUserProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const lesson = getLesson(slug, lessonSlug);
  return { title: lesson ? `${lesson.title} — Fabel` : "Урок не найден — Fabel" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const user = await requireUser();
  const { slug, lessonSlug } = await params;
  const module = getModule(slug);
  const lesson = getLesson(slug, lessonSlug);

  if (!module || !lesson) notFound();

  const id = lessonId(module.slug, lesson.slug);
  const index = module.lessons.findIndex((item) => item.slug === lesson.slug);
  const progress = await getUserProgress(user.id);

  return (
    <LessonView
      moduleSlug={module.slug}
      moduleTitle={module.title}
      lesson={lesson}
      lessonId={id}
      read={progress.readLessons.includes(id)}
      nextStep={getNextStep(module, id)}
      position={{ index: index + 1, total: module.lessons.length }}
    />
  );
}
