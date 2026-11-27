/**
 * Проверка чистой логики черновика (src/lib/drafts.ts) — без DOM и React,
 * на объекте-заглушке. Запускается через `npm run verify:drafts`.
 *
 * Девять проверок: ключ, round-trip, битый JSON, чужая версия, не-объект,
 * черновик равен заготовке, переполнение квоты, недоступное хранилище,
 * изменение каркаса задачи.
 */
import {
  DRAFT_KEY_PREFIX,
  draftKey,
  dropDraft,
  loadDraft,
  saveDraft,
  starterHash,
} from "@/lib/drafts";

const out = (s: string) => process.stdout.write(s + "\n");
process.on("unhandledRejection", () => {});

function check(name: string, cond: boolean): void {
  if (!cond) {
    out("FAIL: " + name);
    process.exit(1);
  }
}

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    map,
  };
}

const starter = "function solution() {\n  return 42;\n}";

// 1. Ключ задачи владельца.
check(
  "ключ cube:draft:fizz-buzz:u1",
  draftKey("fizz-buzz", "u1") === "cube:draft:fizz-buzz:u1" &&
    DRAFT_KEY_PREFIX === "cube:draft:",
);

// 2. Round-trip: сохранили → прочитали тот же код и savedAt, каркас тот же.
{
  const s = fakeStorage();
  const key = draftKey("task", "u1");
  const savedAt = 1795825380000;
  const r = saveDraft(s, key, "console.log(1)", starter, savedAt);
  check("saveDraft → saved", r === "saved");
  const loaded = loadDraft(s, key, starter);
  const restored =
    loaded.status === "restored" &&
    loaded.code === "console.log(1)" &&
    loaded.savedAt === savedAt &&
    loaded.starterChanged === false;
  check("round-trip: restored", restored);
}

// 3. Битый JSON → none и ключа нет.
{
  const s = fakeStorage({ "cube:draft:broken:u1": "{" });
  const key = draftKey("broken", "u1");
  const loaded = loadDraft(s, key, starter);
  check("битый JSON → none", loaded.status === "none");
  check("битый JSON → ключ удалён", s.getItem(key) === null);
}

// 4. Чужая версия (v=0) → none и ключа нет.
{
  const s = fakeStorage({
    "cube:draft:oldv:u1": JSON.stringify({ v: 0, code: "x", savedAt: 1, starterHash: "y" }),
  });
  const key = draftKey("oldv", "u1");
  const loaded = loadDraft(s, key, starter);
  check("v=0 → none", loaded.status === "none");
  check("v=0 → ключ удалён", s.getItem(key) === null);
}

// 5. Не-объект (число) → none и ключа нет.
{
  const s = fakeStorage({ "cube:draft:num:u1": "42" });
  const key = draftKey("num", "u1");
  const loaded = loadDraft(s, key, starter);
  check("не-объект → none", loaded.status === "none");
  check("не-объект → ключ удалён", s.getItem(key) === null);
}

// 6. Черновик равен заготовке → cleared и ключа нет; чтение → none.
{
  const s = fakeStorage();
  const key = draftKey("same", "u1");
  const r = saveDraft(s, key, starter, starter, 1795825380000);
  check("code === starter → cleared", r === "cleared");
  check("code === starter → ключ удалён", s.getItem(key) === null);
  check("удалённый ключ не читается", loadDraft(s, key, starter).status === "none");
}

// 7. Переполнение квоты: setItem бросает → unavailable, исключения наружу нет.
{
  const s = fakeStorage();
  s.setItem = (): undefined => {
    throw new Error("QuotaExceededError");
  };
  let result: string | undefined;
  let threw = false;
  try {
    result = saveDraft(s, draftKey("q", "u1"), "x", starter, 1);
  } catch {
    threw = true;
  }
  check("квота → unavailable", result === "unavailable");
  check("квота: исключения наружу нет", !threw);
}

// 8. Недоступное хранилище: storage = null.
{
  const r = saveDraft(null, draftKey("q", "u1"), "x", starter, 1);
  check("storage=null → unavailable", r === "unavailable");
  check("storage=null → none", loadDraft(null, draftKey("q", "u1"), starter).status === "none");
  let threw = false;
  try {
    dropDraft(null, draftKey("q", "u1"));
  } catch {
    threw = true;
  }
  check("dropDraft(null) не бросает", !threw);
}

// 9. Каркас задачи изменился между записью и чтением → starterChanged: true.
{
  const s = fakeStorage();
  const key = draftKey("changed", "u1");
  const hashBefore = starterHash(starter);
  s.setItem(key, JSON.stringify({ v: 1, code: "y", savedAt: 1, starterHash: hashBefore }));
  const loaded = loadDraft(s, key, "// новый каркас задачи");
  check("изменившийся каркас → starterChanged", loaded.status === "restored" && loaded.starterChanged === true);
}

// Дополнительно: starterHash не падает на пустом каркасе.
check("starterHash('') — строка", typeof starterHash("") === "string");

out("OK: 9 проверок");
process.exit(0);
