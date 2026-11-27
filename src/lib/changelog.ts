/**
 * Данные окна «Что нового».
 *
 * Текст заметок живёт только здесь: компонент его не повторяет, поэтому
 * новый патч правится в одном месте. Модуль без JSX, без импортов из проекта
 * и без обращений к браузеру: дата лежит готовой строкой, чтобы на клиенте
 * не зависеть от пояса, `Intl` и `process.env`.
 */
export type ChangelogSection = { title: string; items: string[] };
export type ChangelogEntry = {
  version: string;
  /** Человекочитаемая дата версии — статичная строка, не вычисляется на клиенте */
  dateLabel: string;
  sections: ChangelogSection[];
};
export type EditorShortcut = { keys: string; action: string; source: string };

/**
 * Записи патчей, новые сверху: `[0]` — текущий патч.
 * Версия в формате `YYYY-MM-DD`: она же номер патча, она же ключ сравнения
 * отметки «видел». Дата для показа — `dateLabel`, отдельной строкой.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2026-11-27",
    dateLabel: "27 ноября 2026",
    sections: [
      {
        title: "Редактор кода",
        items: [
          "Tab и Shift+Tab ставят и снимают отступ — фокус остаётся в редакторе.",
          "Escape, затем Tab выпускают из редактора к следующему элементу страницы (в течение двух секунд после Escape).",
          "Ctrl+M переключает поведение Tab: отступ или переход к следующему элементу.",
          "Набранный код сохраняется в браузере: закрыли вкладку или ушли с задачи — вернувшись, вы увидите свой код.",
          "Кнопка «Что нового» в шапке открывает это окно в любой момент.",
        ],
      },
      {
        title: "Задачи и проверки",
        items: [
          "Исправлено: верное решение больше не считается непройденным, если в объекте отсутствует ключ, а ожидается undefined.",
        ],
      },
    ],
  },
];

/** Версия текущего патча — по ней сравнивается отметка «видел» */
export const CHANGELOG_VERSION: string = CHANGELOG[0].version;

/**
 * Отметка «видел патч»: ключ в том же пространстве имён, что `cube:theme`.
 * Значение — версия патча, хранится всегда в localStorage, для всех ролей.
 */
export const CHANGELOG_SEEN_KEY = "cube:changelog-seen";

/** Официальная справка CodeMirror по комбинациям клавиш */
export const CODEMIRROR_KEYMAP_URL = "https://codemirror.net/docs/ref/#commands.defaultKeymap";

/** Таблица горячих клавиш редактора: разметка и текст берут её из одного места */
export const EDITOR_SHORTCUTS: EditorShortcut[] = [
  {
    keys: "Tab",
    action: "поставить отступ на 2 пробела (выделенные строки сдвигаются целиком)",
    source: "наш keymap",
  },
  { keys: "Shift+Tab", action: "снять отступ", source: "наш keymap" },
  {
    keys: "Escape, затем Tab",
    action: "выйти из редактора к следующему элементу страницы (2 секунды после Escape)",
    source: "встроено в CodeMirror",
  },
  {
    keys: "Ctrl+M",
    action:
      "переключить поведение Tab: отступ или переход к следующему элементу (на macOS — Shift+Alt+M)",
    source: "defaultKeymap (basicSetup)",
  },
  { keys: "Ctrl+Enter", action: "запустить код", source: "наш keymap и TaskWorkspace" },
  { keys: "Ctrl+Shift+Enter", action: "отправить на проверку", source: "TaskWorkspace" },
  { keys: "Ctrl+F", action: "поиск по коду", source: "searchKeymap (basicSetup)" },
  { keys: "Ctrl+Z", action: "отменить", source: "historyKeymap (basicSetup)" },
  {
    keys: "Ctrl+Y",
    action: "вернуть (на macOS — Cmd+Shift+Z; в Linux-сборке — Ctrl+Shift+Z)",
    source: "historyKeymap (basicSetup)",
  },
  { keys: "Ctrl+/", action: "закомментировать строку", source: "defaultKeymap (basicSetup)" },
  {
    keys: "Alt+↑ / Alt+↓",
    action: "перенести строку вверх или вниз",
    source: "defaultKeymap (basicSetup)",
  },
  { keys: "Shift+Ctrl+K", action: "удалить строку", source: "defaultKeymap (basicSetup)" },
];
