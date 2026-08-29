"use client";

import { useEffect } from "react";

/**
 * Отмечает, что ученик открыл платформу.
 *
 * Живёт в общей разметке и потому монтируется один раз за загрузку страницы.
 * Клиентские переходы компонент не пересоздают, поэтому отдельно ловим
 * возвращение на вкладку: вкладку часто держат открытой целый день,
 * и без этого «последний заход» замер бы на утреннем времени.
 *
 * Отправка намеренно молчаливая: не удалось — не беда, отметка присутствия
 * не то, ради чего стоит показывать ученику ошибку.
 */
export function PresencePing() {
  useEffect(() => {
    let stopped = false;

    const ping = () => {
      if (stopped || document.visibilityState !== "visible") return;
      void fetch("/api/presence", { method: "POST", keepalive: true }).catch(() => {});
    };

    ping();
    document.addEventListener("visibilitychange", ping);

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", ping);
    };
  }, []);

  return null;
}
