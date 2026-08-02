import { isMissingUserError } from "@/lib/db/errors";
import { checkQuiz } from "@/lib/quiz";
import { getModuleForTask, getModules } from "@/lib/content";
import { recordSubmission } from "@/lib/progress";
import { getSessionUser } from "@/lib/session";
import { getTask } from "@/lib/tasks";
import type { QuizQuestion } from "@/lib/runner/types";

/** Достаёт вопросы теста, встроенного в урок */
async function findLessonQuiz(
  lessonId: string,
  blockIndex: unknown,
): Promise<QuizQuestion[] | null> {
  if (typeof blockIndex !== "number" || !Number.isInteger(blockIndex) || blockIndex < 0) {
    return null;
  }

  const modules = await getModules();
  for (const module of modules) {
    const lesson = module.lessons.find((item) => item.id === lessonId);
    if (!lesson) continue;

    const block = lesson.blocks[blockIndex];
    return block && block.type === "quiz" ? block.questions : null;
  }

  return null;
}

/**
 * Проверка теста. Ответы сверяются на сервере, поэтому правильные
 * варианты не попадают в браузер, а результат сразу идёт в прогресс.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Ожидается JSON" }, { status: 400 });
  }

  const { taskSlug, lessonId, blockIndex, answers } = (payload ?? {}) as {
    taskSlug?: unknown;
    lessonId?: unknown;
    blockIndex?: unknown;
    answers?: unknown;
  };

  // Приводим ответы к { вопрос: [варианты] }, отбрасывая всё лишнее
  const normalized: Record<string, string[]> = {};
  if (answers && typeof answers === "object") {
    for (const [key, value] of Object.entries(answers as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        normalized[key] = value.filter((item): item is string => typeof item === "string");
      }
    }
  }

  // Тест внутри урока: самопроверка, в прогресс не идёт
  if (typeof lessonId === "string") {
    const questions = await findLessonQuiz(lessonId, blockIndex);
    if (!questions) {
      return Response.json({ error: "Тест не найден" }, { status: 400 });
    }
    return Response.json({ verdict: checkQuiz({ questions }, normalized), saved: false });
  }

  if (typeof taskSlug !== "string") {
    return Response.json({ error: "Не указана задача" }, { status: 400 });
  }

  const task = getTask(taskSlug);
  if (!task || task.kind !== "quiz") {
    return Response.json({ error: "Неизвестный тест" }, { status: 400 });
  }

  const verdict = checkQuiz(task, normalized);
  const user = await getSessionUser();

  if (user) {
    try {
      await recordSubmission({
        userId: user.id,
        taskSlug,
        code: JSON.stringify(normalized),
        passed: verdict.allPassed,
      });
    } catch (error) {
      if (isMissingUserError(error)) {
        return Response.json({ error: "session-expired" }, { status: 401 });
      }
      throw error;
    }
  } else {
    // Гость из демо: тест проверяем, но записывать результат некуда
    const module = await getModuleForTask(taskSlug);
    if (!module?.demoTaskSlugs.includes(taskSlug)) {
      return Response.json({ error: "Требуется вход" }, { status: 401 });
    }
  }

  return Response.json({ verdict, saved: Boolean(user) });
}
