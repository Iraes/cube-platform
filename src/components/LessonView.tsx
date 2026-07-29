"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DemoNotice } from "@/components/DemoNotice";
import { Markdown } from "@/components/Markdown";
import { VideoEmbed } from "@/components/VideoEmbed";
import type { Lesson, Step } from "@/lib/content/types";
import { postLessonRead } from "@/lib/progressClient";

type Props = {
  moduleSlug: string;
  moduleTitle: string;
  lesson: Lesson;
  lessonId: string;
  read: boolean;
  /** Следующий шаг модуля: урок или первая задача */
  nextStep?: Step;
  position: { index: number; total: number };
  /** Демо-доступ: страница открыта без входа, прогресс не сохраняется */
  isDemo?: boolean;
};

export function LessonView({
  moduleSlug,
  moduleTitle,
  lesson,
  lessonId,
  read,
  nextStep,
  position,
  isDemo = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const fallbackHref = isDemo ? "/demo" : `/modules/${moduleSlug}`;

  const goNext = () => {
    setFailed(false);

    // В демо сохранять нечего: аккаунта нет, просто ведём дальше
    if (isDemo) {
      router.push(nextStep ? nextStep.href : fallbackHref);
      return;
    }

    startTransition(async () => {
      const saved = await postLessonRead(lessonId);
      if (!saved) {
        setFailed(true);
        return;
      }
      router.push(nextStep ? nextStep.href : fallbackHref);
      router.refresh();
    });
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-[13px]">
        <Link href={fallbackHref} className="text-muted transition-colors hover:text-accent">
          ← {isDemo ? "Демо-доступ" : moduleTitle}
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
      <p className="mb-6 text-[14px] text-muted">{lesson.summary}</p>

      {isDemo && <DemoNotice />}

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
            return <VideoEmbed key={index} url={block.url} title={block.title} note={block.note} />;
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

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={goNext}
          disabled={pending}
          className="h-9 rounded-md bg-accent px-5 text-[14px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending
            ? "Сохраняем…"
            : isDemo
              ? nextStep
                ? "Дальше →"
                : "Вернуться к демо →"
              : nextStep
                ? nextStep.kind === "task"
                  ? "Прочитано, перейти к задачам →"
                  : "Прочитано, следующий урок →"
                : "Прочитано, к модулю →"}
        </button>

        {nextStep && !pending && <span className="text-[13px] text-faint">Дальше: {nextStep.title}</span>}

        {failed && (
          <span className="text-[13px] text-err">
            Не удалось сохранить прогресс — проверьте соединение и попробуйте ещё раз
          </span>
        )}
      </div>
    </main>
  );
}
