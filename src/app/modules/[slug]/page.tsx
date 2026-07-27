import { notFound } from "next/navigation";
import { ModuleView } from "@/components/ModuleView";
import { getModule, getSteps, modules } from "@/lib/content";

export function generateStaticParams() {
  return modules.map((module) => ({ slug: module.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const module = getModule(slug);
  return { title: module ? `${module.title} — Fabel` : "Модуль не найден — Fabel" };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const module = getModule(slug);

  if (!module) notFound();

  return <ModuleView module={module} steps={getSteps(module)} />;
}
