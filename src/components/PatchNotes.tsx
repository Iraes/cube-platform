"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  CHANGELOG,
  CHANGELOG_SEEN_KEY,
  CHANGELOG_VERSION,
  CODEMIRROR_KEYMAP_URL,
  EDITOR_SHORTCUTS,
} from "@/lib/changelog";

/** Что считается фокусируемым внутри панели — для циклического Tab */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Хранилище отметки читаем сами, подписки на изменения нет: ключ пишем только мы */
const NO_SUBSCRIBE = () => () => {};
const CLIENT_SNAPSHOT = () => true;
const SERVER_SNAPSHOT = () => false;
const SERVER_SEEN = () => CHANGELOG_VERSION;

function readSeenVersion(): string | null {
  try {
    return window.localStorage.getItem(CHANGELOG_SEEN_KEY);
  } catch {
    // хранилище недоступно — считаем, что патч не виден: лучше показать
    return null;
  }
}

/**
 * Монтирование на клиенте.
 *
 * На сервере и при гидратации — `false`, после неё React сам перерисует
 * компонент с `true` (useSyncExternalStore сверяет снимок хранилища после
 * монтирования). Поэтому модалка не попадает в серверный HTML, разметка
 * сервера и клиента совпадает, а `setState` в эффекте не нужен.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(NO_SUBSCRIBE, CLIENT_SNAPSHOT, SERVER_SNAPSHOT);
}

function NoteIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.6 2.4h5.8l3 3v8.2H3.6z" />
      <path d="M9.3 2.4v3h3" />
      <path d="M5.7 8.3h4.6M5.7 10.7h3.1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8" />
    </svg>
  );
}

/**
 * Окно «Что нового»: кнопка в шапке и модалка через портал.
 *
 * Открывается само один раз за версию патча: отметка `cube:changelog-seen`
 * сравнивается с версией. Закрытие (крестик, «Понятно», Esc, клик по подложке)
 * записывает отметку — до следующего патча окно не всплывает; вручную оно
 * открывается кнопкой в любой момент и доступно всем ролям.
 */
export function PatchNotes() {
  const isClient = useIsClient();
  const seenVersion = useSyncExternalStore(NO_SUBSCRIBE, readSeenVersion, SERVER_SEEN);
  const [opened, setOpened] = useState(false);
  const [closedHere, setClosedHere] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const scrollLockRef = useRef<string | null>(null);
  const entry = CHANGELOG[0];

  // Автопоказ в рамках вкладки не повторяем: `closedHere` переживает закрытие,
  // даже если записать отметку в хранилище не удалось.
  const open = opened || (isClient && !closedHere && seenVersion !== CHANGELOG_VERSION);

  const close = useCallback(() => {
    setOpened(false);
    setClosedHere(true);
    try {
      window.localStorage.setItem(CHANGELOG_SEEN_KEY, CHANGELOG_VERSION);
    } catch {
      // хранилище недоступно: окно покажется в следующий заход
    }
  }, []);

  // Фокус, блокировка прокрутки, Esc и циклический Tab
  useEffect(() => {
    if (!open) return;

    const active = document.activeElement;
    // Фокус возвращаем только туда, куда его увёл пользователь, открыв окно.
    // При автопоказе активен body — тогда возвращать некуда и не нужно:
    // окно открылось само, значит и переносить фокус оно не должно.
    restoreFocusRef.current =
      active instanceof HTMLElement && active !== document.body ? active : null;

    scrollLockRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;

      if (!panel.contains(current)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      // Прежнее значение, а не пустая строка: страницу мог блокировать кто-то ещё
      document.body.style.overflow = scrollLockRef.current ?? "";

      const target = restoreFocusRef.current;
      if (target && target.isConnected) target.focus();
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpened(true)}
        aria-label="Что нового"
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border px-2 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text sm:px-3"
      >
        <NoteIcon />
        {/* На узком экране кнопка сжимается до иконки, но не исчезает */}
        <span className="hidden sm:inline">Что нового</span>
      </button>

      {isClient &&
        open &&
        createPortal(
          <div
            role="presentation"
            onClick={close}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="patch-notes-title"
              onClick={(event) => event.stopPropagation()}
              className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-surface p-4 shadow-xl sm:my-6 sm:max-h-[calc(100vh-3rem)] sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 id="patch-notes-title" className="text-[16px] font-semibold text-text">
                    Что нового
                  </h2>
                  <p className="mt-1 text-[12.5px] text-muted">
                    Версия {entry.version} · {entry.dateLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Закрыть"
                  className="-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-text"
                >
                  <CloseIcon />
                </button>
              </div>

              {entry.sections.map((section) => (
                <section key={section.title} className="mt-4">
                  <h3 className="text-[13px] font-semibold text-text">{section.title}</h3>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] text-muted">
                    {section.items.map((item) => (
                      <li key={item} className="break-words">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <section className="mt-4">
                <h3 className="text-[13px] font-semibold text-text">Горячие клавиши редактора</h3>
                <table className="mt-1.5 w-full table-fixed text-left text-[12.5px] text-muted">
                  <thead>
                    <tr className="text-faint">
                      <th className="w-[34%] pb-1 font-normal">Клавиши</th>
                      <th className="pb-1 font-normal">Что делает</th>
                      <th className="w-[28%] pb-1 font-normal">Источник</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EDITOR_SHORTCUTS.map((row) => (
                      <tr key={row.keys} className="align-top border-t border-border">
                        <td className="py-1 pr-2 font-mono break-words text-text">{row.keys}</td>
                        <td className="py-1 pr-2 break-words">{row.action}</td>
                        <td className="py-1 break-words text-faint">{row.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <a
                  href={CODEMIRROR_KEYMAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[12.5px] text-accent underline underline-offset-2 hover:text-accent-strong"
                >
                  Все комбинации — в справке CodeMirror
                </a>
              </section>

              <div className="mt-5 flex justify-end">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  className="h-9 rounded-md bg-accent px-4 text-[13.5px] font-semibold text-accent-fg transition-colors hover:bg-accent-strong"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
