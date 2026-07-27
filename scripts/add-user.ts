import "./env";
import { createUser, deleteUser, getUserByEmail, listUsers, setUserPassword } from "@/lib/db/users";

/**
 * Заведение учётных записей владельцем: регистрации на сайте нет.
 *
 *   npm run user:add -- --email ivan@example.com --password "секрет" --name Иван
 *   npm run user:add -- --email ivan@example.com --password "новый" --reset
 *   npm run user:delete -- --email ivan@example.com
 *   npm run user:list
 */
function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.list) {
    const users = await listUsers();
    if (users.length === 0) {
      console.log("Пользователей пока нет");
      return;
    }
    for (const user of users) {
      console.log(`${user.email}\t${user.role}\t${user.name ?? "—"}`);
    }
    return;
  }

  const email = typeof args.email === "string" ? args.email : "";
  const password = typeof args.password === "string" ? args.password : "";

  if (args.delete) {
    if (!email) {
      console.error("Укажите логин: npm run user:delete -- --email ivan@example.com");
      process.exit(1);
    }
    const removed = await deleteUser(email);
    console.log(
      removed
        ? `Пользователь ${email} удалён вместе со своим прогрессом`
        : `Пользователь ${email} не найден`,
    );
    return;
  }

  const name = typeof args.name === "string" ? args.name : undefined;
  const role = args.role === "teacher" ? "teacher" : "student";

  if (!email || !password) {
    console.error(
      'Укажите логин и пароль:\n  npm run user:add -- --email ivan@example.com --password "секрет" --name Иван',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Пароль должен быть не короче 8 символов");
    process.exit(1);
  }

  const existing = await getUserByEmail(email);

  if (existing) {
    if (!args.reset) {
      console.error(
        `Пользователь ${email} уже есть. Чтобы сменить пароль, добавьте флаг --reset`,
      );
      process.exit(1);
    }
    await setUserPassword(email, password);
    console.log(`Пароль для ${email} обновлён`);
    return;
  }

  const user = await createUser({ email, password, name, role });
  console.log(`Создан пользователь ${user.email} (${user.role})`);
  console.log("Передайте ему логин и пароль — на сайте регистрации нет.");
}

main().catch((error) => {
  console.error("Не удалось выполнить команду:", error);
  process.exit(1);
});
