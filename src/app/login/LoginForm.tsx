"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const INITIAL: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[13px] text-muted">
          Логин
        </label>
        <input
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          autoFocus
          required
          className="h-10 w-full rounded-md border border-border bg-bg px-3 text-[14px] text-text outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[13px] text-muted">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 w-full rounded-md border border-border bg-bg px-3 text-[14px] text-text outline-none transition-colors focus:border-accent"
        />
      </div>

      {state.error && (
        <p className="rounded-md bg-err-soft px-3 py-2 text-[13px] text-err">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-md bg-accent text-[14px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
