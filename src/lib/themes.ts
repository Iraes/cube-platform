export type ThemeId = "graphite" | "charcoal" | "contrast" | "mist" | "sepia";

export type ThemeInfo = {
  id: ThemeId;
  label: string;
  group: "dark" | "light";
};

/** Порядок влияет на порядок в выпадающем списке */
export const THEMES: ThemeInfo[] = [
  { id: "graphite", label: "Графит", group: "dark" },
  { id: "charcoal", label: "Уголь", group: "dark" },
  { id: "contrast", label: "Контраст", group: "dark" },
  { id: "mist", label: "Туман", group: "light" },
  { id: "sepia", label: "Пергамент", group: "light" },
];

export const DEFAULT_THEME: ThemeId = "graphite";

export const THEME_STORAGE_KEY = "fabel:theme";

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}
