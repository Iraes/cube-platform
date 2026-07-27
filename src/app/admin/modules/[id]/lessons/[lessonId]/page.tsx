import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { deleteLessonAction } from "@/lib/actions/admin";
import { getModuleById } from "@/lib/content";

export default async function AdminLessonEditor({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const module = await getModuleById(id);
  const lesson = module?.lessons.find((item) => item.id === lessonId);

  if (!module || !lesson) notFound();

  return (
    <main>
      <div className="mb-4 flex items-center gap-2">
        <Link
          href={`/admin/modules/${module.id}`}
          className="text-[13px] text-muted transition-colors hover:text-accent"
        >
          ← {module.title}
        </Link>
        <Link
          href={`/modules/${module.slug}/lessons/${lesson.slug}`}
          className="ml-auto text-[12.5px] text-muted transition-colors hover:text-accent"
        >
          посмотреть страницу →
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-text">{lesson.title}</h1>

      <LessonEditor lesson={lesson} moduleId={module.id} />

      <section className="mt-10 rounded-lg border border-err/35 bg-err-soft p-4">
        <h2 className="mb-1 text-[13.5px] font-semibold text-err">Удалить урок</h2>
        <p className="mb-3 text-[12.5px] text-muted">
          Вместе с уроком пропадут отметки «прочитано» у всех учеников.
        </p>
        <form action={deleteLessonAction}>
          <input type="hidden" name="id" value={lesson.id} />
          <input type="hidden" name="moduleId" value={module.id} />
          <button
            type="submit"
            className="h-8 rounded-md border border-err/50 px-3 text-[13px] text-err transition-colors hover:bg-err/10"
          >
            Удалить урок
          </button>
        </form>
      </section>
    </main>
  );
}
