"use client";

import { useActionState } from "react";
import { updateModuleAction, type ActionState } from "@/lib/actions/admin";
import type { Module } from "@/lib/content/types";

const INITIAL: ActionState = {};

export function ModuleSettingsForm({ module }: { module: Module }) {
  const [state, formAction, pending] = useActionState(updateModuleAction, INITIAL);

  return (
    <form action={formAction} className="rounded-lg border border-border bg-surface p-4">
      <input type="hidden" name="id" value={module.id} />

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[12.5px] text-muted">Название</span>
          <input
            name="title"
            defaultValue={module.title}
            required
            className="h-9 w-full rounded-md border border-border bg-bg px-3 text-[13.5px] text-text outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12.5px] text-muted">Описание</span>
          <textarea
            name="description"
            defaultValue={module.description}
            rows={3}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13.5px] leading-relaxed text-text outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12.5px] text-muted">
            Адрес страницы — из него получится /modules/…
          </span>
          <input
            name="slug"
            defaultValue={module.slug}
            className="h-9 w-full rounded-md border border-border bg-bg px-3 font-mono text-[13px] text-text outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-md bg-accent px-4 text-[13.5px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
        {state.ok && <span className="text-[13px] text-ok">{state.ok}</span>}
        {state.error && <span className="text-[13px] text-err">{state.error}</span>}
      </div>
    </form>
  );
}
