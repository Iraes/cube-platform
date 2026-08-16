"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BugReportButton } from "@/components/BugReportButton";
import { DemoNotice } from "@/components/DemoNotice";
import { LessonQuiz } from "@/components/LessonQuiz";
import { Markdown } from "@/components/Markdown";
import { VideoEmbed } from "@/components/VideoEmbed";
import type { Step } from "@/lib/content/types";
import type { PublicLessonBlock } from "@/lib/quiz";
import { postLessonRead } from "@/lib/progressClient";

/**
 * Урок приходит разобранным на части, а не одним объектом: целиком он тянет
 * за собой верные ответы встроенных тестов, а всё, что попадает в пропсы
 * клиентского компонента, видно в исходниках страницы.
 */
type Props = {
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonSummary: string;
  lessonId: string;
  read: boolean;
  /** Следующий шаг модуля: урок или первая задача */
  nextStep?: Step;
  position: { index: number; total: number };
  /** Демо-доступ: страница открыта без входа, прогресс не сохраняется */
  isDemo?: boolean;
  /** Названия задач для блоков-переходов: slug → заголовок */
  taskTitles?: Record<string, string>;
  /** Нерешённые задачи этого урока — пока список не пуст, завершить урок нельзя. */
  remainingTaskTitles?: string[];
  /** Блоки без верных ответов — их вырезает сервер */
  blocks: PublicLessonBlock[];
};

export function LessonView({
  moduleSlug,
  moduleTitle,
  lessonSlug,
  lessonTitle,
  lessonSummary,
  lessonId,
  read,
  nextStep,
  position,
  isDemo = false,
  taskTitles = {},
  remainingTaskTitles = [],
  blocks,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const fallbackHref = isDemo ? "/demo" : `/modules/${moduleSlug}`;
  const canComplete = isDemo || remainingTaskTitles.length === 0;

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
          <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[11.5px] font-medium text-ok">
            ✓ прочитано
          </span>
        )}

        <BugReportButton
          contextKind="lesson"
          contextId={lessonId}
          contextTitle={lessonTitle}
          className="ml-auto"
        />
      </div>

      <h1 className="mb-1.5 text-2xl font-semibold tracking-tight text-text">{lessonTitle}</h1>
      <p className="mb-6 text-[14px] text-muted">{lessonSummary}</p>

      {isDemo && <DemoNotice />}

      <div className="space-y-7">
        {blocks.map((block, index) => {
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

          if (block.type === "quiz") {
            return (
              <LessonQuiz
                key={index}
                lessonId={lessonId}
                blockIndex={index}
                title={block.title}
                questions={block.questions}
              />
            );
          }

          // Переход из теории сразу к практике
          if (block.type === "task") {
            const title = taskTitles[block.slug];
            if (!title) return null;

            return (
              <div
                key={index}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-accent/40 bg-accent-soft p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-medium text-text">{title}</p>
                  {block.note && <p className="mt-0.5 text-[13px] text-muted">{block.note}</p>}
                </div>
                <Link
                  // from — чтобы со страницы задачи можно было вернуться
                  // в этот урок, а «дальше» вело к следующему уроку
                  href={`/tasks/${moduleSlug}/${lessonSlug}/${block.slug}`}
                  prefetch={false}
                  className="h-9 shrink-0 rounded-md bg-accent px-4 text-[13.5px] font-semibold leading-9 text-accent-fg transition-colors hover:bg-accent-strong"
                >
                  Решать задачу →
                </Link>
              </div>
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

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={goNext}
          disabled={pending || !canComplete}
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

        {!canComplete && (
          <p className="basis-full text-[13px] leading-relaxed text-muted">
            Чтобы отметить урок прочитанным, решите {remainingTaskTitles.length === 1 ? "задачу" : "все задачи"}: {remainingTaskTitles.join(", ")}.
          </p>
        )}

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
