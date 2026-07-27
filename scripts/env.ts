import { existsSync } from "node:fs";

/**
 * Скрипты запускаются вне Next.js, поэтому .env.local нужно прочитать вручную.
 * process.loadEnvFile входит в стандартную библиотеку Node — зависимостей не требуется.
 */
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
    break;
  }
}
