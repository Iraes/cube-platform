import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DEFAULT_THEME, THEMES, THEME_STORAGE_KEY } from "@/lib/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fabel — практикум по программированию",
  description: "Учебные материалы и задачи с запуском кода прямо в браузере",
};

/**
 * Тема применяется до первой отрисовки, иначе при загрузке мигает.
 * Скрипт синхронный и намеренно инлайновый; список тем подставляется
 * из общего источника, чтобы не разъезжался.
 */
const themeBootstrap = `(function(){try{var allowed=${JSON.stringify(
  THEMES.map((theme) => theme.id),
)};var saved=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});document.documentElement.dataset.theme=allowed.indexOf(saved)!==-1?saved:${JSON.stringify(
  DEFAULT_THEME,
)};}catch(e){document.documentElement.dataset.theme=${JSON.stringify(DEFAULT_THEME)};}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
