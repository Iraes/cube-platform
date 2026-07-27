import { PasswordResetForm, UserCreateForm } from "@/components/admin/UserForms";
import { deleteUserAction, setRoleAction } from "@/lib/actions/admin";
import { listUsers } from "@/lib/db/users";
import { requireAdmin } from "@/lib/session";

const ROLE_LABELS: Record<string, string> = {
  student: "Ученик",
  teacher: "Преподаватель",
  admin: "Администратор",
};

export default async function AdminUsers() {
  const admin = await requireAdmin();
  const users = await listUsers();

  return (
    <main>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-text">Пользователи</h1>

      <UserCreateForm />

      <ul className="mt-6 space-y-2">
        {users.map((user) => {
          const isSelf = user.id === admin.id;

          return (
            <li key={user.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-[14.5px] font-medium text-text">
                  {user.name || user.email}
                </span>
                {user.name && <span className="text-[12.5px] text-faint">{user.email}</span>}
                {isSelf && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent-strong">
                    это вы
                  </span>
                )}

                <form action={setRoleAction} className="ml-auto flex items-center gap-2">
                  <input type="hidden" name="id" value={user.id} />
                  <select
                    name="role"
                    defaultValue={user.role}
                    disabled={isSelf}
                    className="h-8 rounded-md border border-border bg-bg px-2 text-[13px] text-text outline-none focus:border-accent disabled:opacity-50"
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={isSelf}
                    className="h-8 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text disabled:opacity-40"
                  >
                    Применить
                  </button>
                </form>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <PasswordResetForm userId={user.id} />

                {!isSelf && (
                  <form action={deleteUserAction} className="ml-auto">
                    <input type="hidden" name="id" value={user.id} />
                    <button
                      type="submit"
                      className="h-8 rounded-md border border-err/40 px-3 text-[13px] text-err transition-colors hover:bg-err/10"
                    >
                      Удалить вместе с прогрессом
                    </button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-[12.5px] text-faint">
        Себе роль сменить и себя удалить нельзя — иначе можно остаться без единого администратора.
      </p>
    </main>
  );
}
