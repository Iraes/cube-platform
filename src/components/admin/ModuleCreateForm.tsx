"use client";

import { useActionState } from "react";
import { createModuleAction, type ActionState } from "@/lib/actions/admin";

const INITIAL: ActionState = {};

export function ModuleCreateForm() {
  const [state, formAction, pending] = useActionState(createModuleAction, INITIAL);

  return (
    <form action={formAction} className="rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-3 text-[14px] font-semibold text-text">Новый модуль</h2>

      <div className="flex flex-wrap gap-2">
        <input
          name="title"
          placeholder="Название, например «Асинхронный JavaScript»"
          required
          className="h-9 min-w-64 flex-1 rounded-md border border-border bg-bg px-3 text-[13.5px] text-text outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-md bg-accent px-4 text-[13.5px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Создаём…" : "Создать"}
        </button>
      </div>

      {state.error && <p className="mt-2 text-[13px] text-err">{state.error}</p>}
    </form>
  );
}
