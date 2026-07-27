"use client";

import { useActionState, useState } from "react";
import { saveLessonAction, type ActionState } from "@/lib/actions/admin";
import type { Lesson, LessonBlock, LessonBlockType } from "@/lib/content/types";

const INITIAL: ActionState = {};

const inputClass =
  "h-9 w-full rounded-md border border-border bg-bg px-3 text-[13.5px] text-text outline-none focus:border-accent";
const areaClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-[13.5px] leading-relaxed text-text outline-none focus:border-accent";

const BLOCK_LABELS: Record<LessonBlockType, string> = {
  text: "Текст",
  video: "Видео",
  article: "Статья",
};

function emptyBlock(type: LessonBlockType): LessonBlock {
  if (type === "text") return { type: "text", markdown: "" };
  if (type === "video") return { type: "video", url: "", title: "" };
  return { type: "article", url: "", title: "", source: "" };
}

export function LessonEditor({ lesson, moduleId }: { lesson: Lesson; moduleId: string }) {
  const [state, formAction, pending] = useActionState(saveLessonAction, INITIAL);
  const [blocks, setBlocks] = useState<LessonBlock[]>(lesson.blocks);

  const update = (index: number, patch: Partial<LessonBlock>) => {
    setBlocks((prev) =>
      prev.map((block, i) => (i === index ? ({ ...block, ...patch } as LessonBlock) : block)),
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (index: number) => setBlocks((prev) => prev.filter((_, i) => i !== index));
  const add = (type: LessonBlockType) => setBlocks((prev) => [...prev, emptyBlock(type)]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={lesson.id} />
      <input type="hidden" name="moduleId" value={moduleId} />
      {/* Блоки уезжают на сервер одним JSON: так порядок и типы не разъезжаются */}
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />

      <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <label className="block">
          <span className="mb-1 block text-[12.5px] text-muted">Название урока</span>
          <input name="title" defaultValue={lesson.title} required className={inputClass} />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12.5px] text-muted">
            Краткое описание — строка под заголовком
          </span>
          <input name="summary" defaultValue={lesson.summary} className={inputClass} />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12.5px] text-muted">Адрес страницы</span>
          <input
            name="slug"
            defaultValue={lesson.slug}
            className={`${inputClass} font-mono text-[13px]`}
          />
        </label>
      </div>

      <h2 className="mt-8 mb-3 text-[12px] font-semibold uppercase tracking-wider text-faint">
        Содержимое урока
      </h2>

      {blocks.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-4 text-[13px] text-faint">
          Урок пустой. Добавьте текст, видео или ссылку на статью.
        </p>
      )}

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div key={index} className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11.5px] font-medium text-accent-strong">
                {BLOCK_LABELS[block.type]}
              </span>

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded px-1.5 py-0.5 text-[12px] text-faint transition-colors hover:text-accent disabled:opacity-30"
                  aria-label="Выше"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="rounded px-1.5 py-0.5 text-[12px] text-faint transition-colors hover:text-accent disabled:opacity-30"
                  aria-label="Ниже"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded px-2 py-0.5 text-[12.5px] text-muted transition-colors hover:text-err"
                >
                  удалить
                </button>
              </div>
            </div>

            {block.type === "text" && (
              <textarea
                value={block.markdown}
                onChange={(event) => update(index, { markdown: event.target.value })}
                rows={8}
                placeholder="Текст урока. Поддерживаются абзацы, списки, `код` и ```блоки кода```"
                className={`${areaClass} font-mono text-[13px]`}
              />
            )}

            {block.type === "video" && (
              <div className="space-y-2">
                <input
                  value={block.url}
                  onChange={(event) => update(index, { url: event.target.value })}
                  placeholder="Ссылка на видео: YouTube, Vimeo, RuTube, VK или файл .mp4"
                  className={inputClass}
                />
                <input
                  value={block.title ?? ""}
                  onChange={(event) => update(index, { title: event.target.value })}
                  placeholder="Подпись над плеером (необязательно)"
                  className={inputClass}
                />
                <input
                  value={block.note ?? ""}
                  onChange={(event) => update(index, { note: event.target.value })}
                  placeholder="Пояснение под плеером (необязательно)"
                  className={inputClass}
                />
              </div>
            )}

            {block.type === "article" && (
              <div className="space-y-2">
                <input
                  value={block.url}
                  onChange={(event) => update(index, { url: event.target.value })}
                  placeholder="Ссылка на статью"
                  className={inputClass}
                />
                <input
                  value={block.title}
                  onChange={(event) => update(index, { title: event.target.value })}
                  placeholder="Название статьи"
                  className={inputClass}
                />
                <input
                  value={block.source ?? ""}
                  onChange={(event) => update(index, { source: event.target.value })}
                  placeholder="Источник, например learn.javascript.ru (необязательно)"
                  className={inputClass}
                />
                <input
                  value={block.note ?? ""}
                  onChange={(event) => update(index, { note: event.target.value })}
                  placeholder="Зачем читать (необязательно)"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as LessonBlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => add(type)}
            className="h-8 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text"
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-md bg-accent px-5 text-[13.5px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Сохраняем…" : "Сохранить урок"}
        </button>
        {state.ok && <span className="text-[13px] text-ok">{state.ok}</span>}
        {state.error && <span className="text-[13px] text-err">{state.error}</span>}
      </div>
    </form>
  );
}
