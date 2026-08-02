import { desc, eq } from "drizzle-orm";
import { resolveBugAction, deleteBugAction } from "@/lib/actions/admin";
import { getDb } from "@/lib/db";
import { bugReports, users } from "@/lib/db/schema";

const KIND_LABELS: Record<string, string> = {
  lesson: "урок",
  task: "задача",
  other: "платформа",
};

export default async function AdminBugs() {
  const db = await getDb();

  const rows = await db
    .select({
      id: bugReports.id,
      contextKind: bugReports.contextKind,
      contextTitle: bugReports.contextTitle,
      message: bugReports.message,
      resolved: bugReports.resolved,
      createdAt: bugReports.createdAt,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(bugReports)
    .leftJoin(users, eq(bugReports.userId, users.id))
    .orderBy(desc(bugReports.createdAt))
    .limit(200);

  const open = rows.filter((row) => !row.resolved);
  const done = rows.filter((row) => row.resolved);

  return (
    <main>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-text">Сообщения о багах</h1>
      <p className="mb-8 max-w-2xl text-[14px] leading-relaxed text-muted">
        Приходят с кнопки «Баг» на страницах уроков и задач. Отправить может и гость из
        демо-доступа — тогда автор не указан.
      </p>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-[13.5px] text-faint">
          Сообщений пока нет.
        </p>
      ) : (
        <div className="space-y-8">
          <BugList title={`Новые (${open.length})`} rows={open} empty="Всё разобрано." />
          {done.length > 0 && <BugList title={`Разобранные (${done.length})`} rows={done} />}
        </div>
      )}
    </main>
  );
}

type BugRow = {
  id: string;
  contextKind: string;
  contextTitle: string;
  message: string;
  resolved: boolean;
  createdAt: Date;
  authorName: string | null;
  authorEmail: string | null;
};

function BugList({ title, rows, empty }: { title: string; rows: BugRow[]; empty?: string }) {
  return (
    <section>
      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-faint">
        {title}
      </h2>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-[13px] text-faint">
          {empty}
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`rounded-lg border p-4 ${
                row.resolved ? "border-border bg-surface opacity-70" : "border-border bg-surface"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-hover px-2.5 py-0.5 text-[11px] text-muted">
                  {KIND_LABELS[row.contextKind] ?? row.contextKind}
                </span>
                <span className="text-[14px] font-medium text-text">
                  {row.contextTitle || "без названия"}
                </span>
                <span className="text-[12px] text-faint">
                  {row.authorName || row.authorEmail || "гость"} ·{" "}
                  {row.createdAt.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>

              <pre className="mb-3 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-muted">
                {row.message}
              </pre>

              <div className="flex flex-wrap gap-2">
                {!row.resolved && (
                  <form action={resolveBugAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="h-8 rounded-md border border-border px-3 text-[13px] text-muted transition-colors hover:bg-hover hover:text-text"
                    >
                      Разобрано
                    </button>
                  </form>
                )}
                <form action={deleteBugAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    className="h-8 rounded-md border border-err/40 px-3 text-[13px] text-err transition-colors hover:bg-err/10"
                  >
                    Удалить
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
