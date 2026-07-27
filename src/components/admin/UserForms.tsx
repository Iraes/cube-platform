"use client";

import { useActionState } from "react";
import {
  createUserAction,
  resetPasswordAction,
  type ActionState,
} from "@/lib/actions/admin";

const INITIAL: ActionState = {};

const inputClass =
  "h-9 rounded-md border border-border bg-bg px-3 text-[13.5px] text-text outline-none focus:border-accent";

export function UserCreateForm() {
  const [state, formAction, pending] = useActionState(createUserAction, INITIAL);

  return (
    <form action={formAction} className="rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-1 text-[14px] font-semibold text-text">Новая учётная запись</h2>
      <p className="mb-3 text-[12.5px] text-faint">
        Логин и пароль придумываете вы и передаёте ученику: регистрации на сайте нет.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <input name="email" placeholder="Логин, например ivan@example.com" required className={inputClass} />
        <input name="name" placeholder="Имя (необязательно)" className={inputClass} />
        <input
          name="password"
          placeholder="Пароль, минимум 8 символов"
          minLength={8}
          required
          className={inputClass}
        />
        <select name="role" defaultValue="student" className={inputClass}>
          <option value="student">Ученик</option>
          <option value="teacher">Преподаватель</option>
          <option value="admin">Администратор</option>
        </select>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-md bg-accent px-4 text-[13.5px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Создаём…" : "Создать"}
        </button>
        {state.ok && <span className="text-[13px] text-ok">{state.ok}</span>}
        {state.error && <span className="text-[13px] text-err">{state.error}</span>}
      </div>
    </form>
  );
}

export function PasswordResetForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={userId} />
      <input
        name="password"
        type="text"
        placeholder="Новый пароль"
        minLength={8}
        required
        className={`${inputClass} h-8 w-44 text-[13px]`}
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text disabled:opacity-60"
      >
        {pending ? "…" : "Сменить"}
      </button>
      {state.ok && <span className="text-[12.5px] text-ok">{state.ok}</span>}
      {state.error && <span className="text-[12.5px] text-err">{state.error}</span>}
    </form>
  );
}
