"use client";

import { useReducer, useRef, useEffect, useCallback } from "react";
import type {
  Quiz as QuizType,
  QuizState,
  QuizResult as QuizResultType,
} from "@/types/quiz";
import QuizQuestion from "./QuizQuestion";
import QuizResult from "./QuizResult";

interface QuizProps {
  quiz: QuizType;
}

type InternalState =
  | { status: "idle" }
  | { status: "answering"; answers: Record<string, string> }
  | { status: "submitted"; answers: Record<string, string>; result: QuizResultType };

type InternalAction =
  | { type: "select"; questionId: string; choiceId: string }
  | { type: "submit"; result: QuizResultType }
  | { type: "retry" };

function computeResult(
  quiz: QuizType,
  answers: Record<string, string>
): QuizResultType {
  const perQuestion = quiz.questions.map((q) => ({
    questionId: q.id,
    correct: answers[q.id] === q.correctChoiceId,
    selectedChoiceId: answers[q.id] ?? null,
  }));
  const score = perQuestion.filter((r) => r.correct).length;
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  return {
    score,
    total,
    percentage,
    passed: percentage >= 72,
    perQuestion,
  };
}

function reducer(state: InternalState, action: InternalAction): InternalState {
  switch (action.type) {
    case "select": {
      const prev = state.status === "answering" ? state.answers : {};
      return {
        status: "answering",
        answers: { ...prev, [action.questionId]: action.choiceId },
      };
    }
    case "submit": {
      if (state.status !== "answering") return state;
      return {
        status: "submitted",
        answers: state.answers,
        result: action.result,
      };
    }
    case "retry": {
      return { status: "idle" };
    }
    default:
      return state;
  }
}

function toPublicState(state: InternalState): QuizState {
  return state as QuizState;
}

export default function Quiz({ quiz }: QuizProps) {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const resultRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === "submitted") {
      resultRef.current?.focus();
    }
  }, [state.status]);

  const answers: Record<string, string> =
    state.status === "answering" || state.status === "submitted"
      ? state.answers
      : {};

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);
  const answeredCount = quiz.questions.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const total = quiz.questions.length;
  const progressPct = Math.round((answeredCount / total) * 100);

  const handleSelect = useCallback(
    (questionId: string, choiceId: string) => {
      if (state.status !== "submitted") {
        dispatch({ type: "select", questionId, choiceId });
      }
    },
    [state.status]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered || state.status !== "answering") return;

    const result = computeResult(quiz, state.answers);

    try {
      localStorage.setItem(
        `cca-prep:last-score:${quiz.slug}`,
        JSON.stringify({
          score: result.score,
          total: result.total,
          percentage: result.percentage,
          passed: result.passed,
          date: new Date().toISOString(),
        })
      );
    } catch {
      // localStorage unavailable — non-fatal
    }

    dispatch({ type: "submit", result });
  }

  function handleRetry() {
    dispatch({ type: "retry" });
  }

  const isSubmitted = state.status === "submitted";
  void toPublicState;

  return (
    <section aria-labelledby="quiz-heading" className="mt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-grey-200 pb-4 dark:border-grey-800">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">
            <span aria-hidden="true" className="h-1 w-4 rounded-full bg-primary-500" />
            Self-check
          </p>
          <h2
            id="quiz-heading"
            className="mt-1 font-display text-2xl font-semibold tracking-tight text-grey-900 dark:text-grey-25"
          >
            Test what you just learned
          </h2>
        </div>
        {!isSubmitted && (
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-medium text-grey-500 dark:text-grey-400">
              {answeredCount} / {total} answered
            </span>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-grey-200 dark:bg-grey-800">
              <div
                className="h-full rounded-full bg-primary-gradient transition-[width] duration-300"
                style={{ width: `${progressPct}%` }}
                role="progressbar"
                aria-valuenow={answeredCount}
                aria-valuemin={0}
                aria-valuemax={total}
              />
            </div>
          </div>
        )}
      </div>

      {isSubmitted && state.status === "submitted" && (
        <div className="mb-8">
          <QuizResult
            ref={resultRef}
            score={state.result.score}
            total={state.result.total}
            passed={state.result.passed}
            onRetry={handleRetry}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <ol className="space-y-4 [counter-reset:question]">
          {quiz.questions.map((question, idx) => (
            <li key={question.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-1 top-6 hidden -translate-x-full select-none font-display text-xs font-semibold uppercase tracking-[0.14em] text-grey-400 sm:block"
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <QuizQuestion
                question={question}
                selectedChoiceId={answers[question.id] ?? null}
                revealed={isSubmitted}
                onSelect={(choiceId) => handleSelect(question.id, choiceId)}
              />
            </li>
          ))}
        </ol>

        {!isSubmitted && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-grey-200 bg-white p-5 shadow-xs dark:border-grey-800 dark:bg-grey-900/60">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-grey-900 dark:text-grey-25">
                {allAnswered
                  ? "Ready to submit?"
                  : `Answer ${total - answeredCount} more to submit`}
              </p>
              <p className="text-xs text-grey-500 dark:text-grey-400">
                Pass threshold · 72% (matches the 720/1000 exam mark)
              </p>
            </div>
            <button
              type="submit"
              disabled={!allAnswered}
              className="inline-flex items-center gap-2 rounded-xl bg-grey-950 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-grey-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:bg-grey-200 disabled:text-grey-400 disabled:shadow-none disabled:hover:translate-y-0 dark:bg-white dark:text-grey-950 dark:hover:bg-grey-100 dark:disabled:bg-grey-800 dark:disabled:text-grey-600"
            >
              Submit answers
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
