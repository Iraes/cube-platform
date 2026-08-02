import type { LessonBlock } from "@/lib/content/types";
import type { QuizQuestion, QuizTask } from "@/lib/runner/types";

/**
 * Вопрос в том виде, в каком он уезжает в браузер: без списка верных
 * вариантов. Иначе ответы можно подсмотреть в исходниках страницы.
 */
export type PublicQuestion = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  /** Сколько вариантов нужно выбрать — подсказка «можно выбрать несколько» */
  multiple: boolean;
};

export type QuestionVerdict = {
  id: string;
  passed: boolean;
  correct: string[];
  explanation?: string;
};

export type QuizVerdict = {
  questions: QuestionVerdict[];
  passedCount: number;
  total: number;
  allPassed: boolean;
};

export function toPublicQuestions(source: { questions: QuizQuestion[] }): PublicQuestion[] {
  return source.questions.map((question) => ({
    id: question.id,
    text: question.text,
    options: question.options.map((option) => ({ id: option.id, text: option.text })),
    multiple: question.correct.length > 1,
  }));
}

/** Блок урока в том виде, в каком его можно отдать в браузер */
export type PublicLessonBlock =
  | Exclude<LessonBlock, { type: "quiz" }>
  | { type: "quiz"; title?: string; questions: PublicQuestion[] };

/**
 * Убирает из блоков урока верные ответы. Блоки уходят в клиентский
 * компонент целиком, поэтому чистить нужно на сервере.
 */
export function toPublicBlocks(blocks: LessonBlock[]): PublicLessonBlock[] {
  return blocks.map((block) =>
    block.type === "quiz"
      ? { type: "quiz" as const, title: block.title, questions: toPublicQuestions(block) }
      : block,
  );
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
}

/**
 * Ответы приходят как { идентификатор вопроса: выбранные варианты }.
 * Источник вопросов не важен: задача-тест и блок урока проверяются одинаково.
 */
export function checkQuiz(
  source: { questions: QuizQuestion[] },
  answers: Record<string, string[]>,
): QuizVerdict {
  const questions = source.questions.map((question: QuizQuestion): QuestionVerdict => {
    const given = Array.isArray(answers[question.id]) ? answers[question.id] : [];
    // Считаем только варианты, которые действительно есть в вопросе
    const known = given.filter((id) => question.options.some((option) => option.id === id));

    return {
      id: question.id,
      passed: sameSet([...new Set(known)], question.correct),
      correct: question.correct,
      explanation: question.explanation,
    };
  });

  const passedCount = questions.filter((question) => question.passed).length;

  return {
    questions,
    passedCount,
    total: questions.length,
    allPassed: questions.length > 0 && passedCount === questions.length,
  };
}
