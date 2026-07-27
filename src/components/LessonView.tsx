"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Markdown } from "@/components/Markdown";
import { VideoEmbed } from "@/components/VideoEmbed";
import type { Lesson, Step } from "@/lib/content/types";
import { getReadLessons, markLessonRead, subscribeToProgress } from "@/lib/progress";

type Props = {
  moduleSlug: string;
  moduleTitle: string;
  lesson: Lesson;
  lessonId: string;
  /** Следующий шаг модуля: урок или первая задача */
  nextStep?: Step;
  position: { index: number; total: number };
};

export function LessonView({
  moduleSlug,
  moduleTitle,
  lesson,
  lessonId,
  nextStep,
  position,
}: Props) {
  const router = useRouter();
  const [read, setRead] = useState(false);

  useEffect(() => {
    const sync = () => setRead(getReadLessons().has(lessonId));
    sync();
    return subscribeToProgress(sync);
  }, [lessonId]);

  const goNext = () => {
    markLessonRead(lessonId);
    router.push(nextStep ? nextStep.href : `/modules/${moduleSlug}`);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-[13px]">
        <Link href={`/modules/${moduleSlug}`} className="text-muted transition-colors hover:text-accent">
          ← {moduleTitle}
        </Link>
        <span className="text-faint">·</span>
        <span className="text-faint">
          урок {position.index} из {position.total}
        </span>
        {read && (
          <span className="ml-auto rounded-full bg-ok-soft px-2.5 py-0.5 text-[11.5px] font-medium text-ok">
            ✓ прочитано
          </span>
        )}
      </div>

      <h1 className="mb-1.5 text-2xl font-semibold tracking-tight text-text">{lesson.title}</h1>
      <p className="mb-8 text-[14px] text-muted">{lesson.summary}</p>

      <div className="space-y-7">
        {lesson.blocks.map((block, index) => {
          if (block.type === "text") {
            return (
              <div key={index} className="prose-lesson text-muted">
                <Markdown text={block.markdown} />
              </div>
            );
          }

          if (block.type === "video") {
            return (
              <VideoEmbed key={index} url={block.url} title={block.title} note={block.note} />
            );
          }

          return (
            <a
              key={index}
              href={block.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent hover:bg-surface-2"
            >
              <span aria-hidden="true" className="mt-0.5 text-accent">
                ↗
              </span>
              <span className="min-w-0">
                <span className="block text-[14.5px] font-medium text-text">{block.title}</span>
                {block.note && <span className="mt-0.5 block text-[13px] text-muted">{block.note}</span>}
                <span className="mt-1 block truncate text-[12px] text-faint">
                  {block.source ?? block.url}
                </span>
              </span>
            </a>
          );
        })}
      </div>

      <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={goNext}
          className="h-9 rounded-md bg-accent px-5 text-[14px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong"
        >
          {nextStep
            ? nextStep.kind === "task"
              ? "Прочитано, перейти к задачам →"
              : "Прочитано, следующий урок →"
            : "Прочитано, к модулю →"}
        </button>

        {nextStep && <span className="text-[13px] text-faint">Дальше: {nextStep.title}</span>}
      </div>
    </main>
  );
}
