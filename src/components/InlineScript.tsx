/**
 * Инлайновый скрипт, который должен выполниться до первой отрисовки.
 *
 * На сервере отдаётся как исполняемый `text/javascript`, на клиенте —
 * как `text/plain`: React предупреждает о рендере тегов <script>, а при
 * клиентской навигации скрипт всё равно не выполняется. Расхождение типа
 * гасится через suppressHydrationWarning.
 *
 * Приём описан в доке Next.js «Preventing flash before hydration».
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
