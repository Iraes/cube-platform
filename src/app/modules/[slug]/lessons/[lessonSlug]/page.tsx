import { notFound } from "next/navigation";
import { LessonView } from "@/components/LessonView";
import { findLesson, getModuleBySlug, getNextStep } from "@/lib/content";
import { getUserProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const module = await getModuleBySlug(slug);
  const lesson = module ? findLesson(module, lessonSlug) : undefined;
  return { title: lesson ? `${lesson.title} — Cube` : "Урок не найден — Cube" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const user = await requireUser();
  const { slug, lessonSlug } = await params;
  const module = await getModuleBySlug(slug);
  const lesson = module ? findLesson(module, lessonSlug) : undefined;

  if (!module || !lesson) notFound();

  const index = module.lessons.findIndex((item) => item.id === lesson.id);
  const progress = await getUserProgress(user.id);

  return (
    <LessonView
      moduleSlug={module.slug}
      moduleTitle={module.title}
      lesson={lesson}
      lessonId={lesson.id}
      read={progress.readLessons.includes(lesson.id)}
      nextStep={getNextStep(module, lesson.id)}
      position={{ index: index + 1, total: module.lessons.length }}
    />
  );
}
