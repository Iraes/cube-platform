"use client";

import { useActionState } from "react";
import { createCourseBlockAction, type ActionState } from "@/lib/actions/admin";

const INITIAL: ActionState = {};

export function CourseBlockCreateForm() {
  const [state, formAction, pending] = useActionState(createCourseBlockAction, INITIAL);
  return (
    <form action={formAction} className="rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-1 text-[14px] font-semibold text-text">Новый блок курса</h2>
      <p className="mb-3 text-[12.5px] text-muted">Блок объединяет несколько модулей в один этап обучения.</p>
      <div className="flex flex-wrap gap-2">
        <input name="title" required placeholder="Например «JS Core · Основные концепции»" className="h-9 min-w-64 flex-1 rounded-md border border-border bg-bg px-3 text-[13.5px] text-text outline-none focus:border-accent" />
        <button type="submit" disabled={pending} className="h-9 rounded-md bg-accent px-4 text-[13.5px] font-semibold text-accent-fg hover:bg-accent-strong disabled:opacity-60">
          {pending ? "Создаём…" : "Создать блок"}
        </button>
      </div>
      {state.ok && <p className="mt-2 text-[13px] text-ok">{state.ok}</p>}
      {state.error && <p className="mt-2 text-[13px] text-err">{state.error}</p>}
    </form>
  );
}
