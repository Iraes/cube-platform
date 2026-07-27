"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  isThemeId,
  type ThemeId,
} from "@/lib/themes";

export function ThemeSelect() {
  // Тему уже проставил инлайновый скрипт в <head>; здесь только синхронизируем select
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    if (isThemeId(applied)) setTheme(applied);
  }, []);

  const change = (next: string) => {
    if (!isThemeId(next)) return;
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // приватный режим — тема просто не запомнится
    }
  };

  const dark = THEMES.filter((item) => item.group === "dark");
  const light = THEMES.filter((item) => item.group === "light");

  return (
    <label className="flex items-center gap-2">
      <span className="text-[12.5px] text-muted">Тема</span>
      <select
        value={theme}
        onChange={(event) => change(event.target.value)}
        className="h-8 cursor-pointer rounded-md border border-border bg-surface-2 px-2 text-[13px] text-text outline-none transition-colors hover:border-border-strong focus-visible:border-accent"
      >
        <optgroup label="Тёмные">
          {dark.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Светлые">
          {light.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
