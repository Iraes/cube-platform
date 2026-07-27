import { notFound } from "next/navigation";
import { ModuleView } from "@/components/ModuleView";
import { getModuleBySlug, getSteps } from "@/lib/content";
import { getUserProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const module = await getModuleBySlug(slug);
  return { title: module ? `${module.title} — Cube` : "Модуль не найден — Cube" };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  const module = await getModuleBySlug(slug);

  if (!module) notFound();

  return (
    <ModuleView
      module={module}
      steps={getSteps(module)}
      progress={await getUserProgress(user.id)}
    />
  );
}
