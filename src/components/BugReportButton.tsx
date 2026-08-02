"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  contextKind: "lesson" | "task" | "other";
  contextId?: string;
  /** Название урока или задачи — показывается в модалке и уходит вместе с сообщением */
  contextTitle: string;
  className?: string;
};

const PLACEHOLDER = `Если ты нашёл баг, впиши сюда:

1. Что пошло не так
2. Твой код`;

function BugIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <ellipse cx="8" cy="9" rx="3.4" ry="4" />
      <path d="M8 5.2V4a2 2 0 0 1 4 0" />
      <path d="M4.6 7 2.3 5.9M4.6 9.2H2M4.6 11.4l-2.2 1.3" />
      <path d="M11.4 7l2.3-1.1M11.4 9.2H14M11.4 11.4l2.2 1.3" />
    </svg>
  );
}

export function BugReportButton({ contextKind, contextId, contextTitle, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;

    areaRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    setState("idle");
    setMessage("");
  };

  const send = async () => {
    if (message.trim().length < 5) {
      setState("error");
      return;
    }

    setState("sending");
    try {
      const response = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, contextKind, contextId, contextTitle }),
      });
      setState(response.ok ? "sent" : "error");
      if (response.ok) setTimeout(close, 1400);
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Сообщить о баге"
        className={`flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12.5px] text-muted transition-colors hover:border-err hover:text-err ${className}`}
      >
        <BugIcon />
        <span>Баг</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={close}
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Сообщить о баге"
          >
            <div className="mb-1 flex items-center gap-2 text-err">
              <BugIcon />
              <h2 className="text-[15px] font-semibold">Сообщить о баге</h2>
            </div>
            <p className="mb-4 text-[13px] text-muted">{contextTitle}</p>

            <textarea
              ref={areaRef}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (state === "error") setState("idle");
              }}
              rows={8}
              placeholder={PLACEHOLDER}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-[13px] leading-relaxed text-text outline-none placeholder:text-faint focus:border-accent"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={send}
                disabled={state === "sending" || state === "sent"}
                className="h-9 rounded-md bg-accent px-4 text-[13.5px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong disabled:opacity-60"
              >
                {state === "sending" ? "Отправляем…" : state === "sent" ? "Отправлено" : "Отправить"}
              </button>
              <button
                type="button"
                onClick={close}
                className="h-9 rounded-md border border-border px-4 text-[13.5px] text-muted transition-colors hover:bg-hover hover:text-text"
              >
                Отмена
              </button>

              {state === "sent" && <span className="text-[13px] text-ok">Спасибо, записали</span>}
              {state === "error" && (
                <span className="text-[13px] text-err">
                  {message.trim().length < 5
                    ? "Напишите пару слов о проблеме"
                    : "Не удалось отправить — попробуйте ещё раз"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
