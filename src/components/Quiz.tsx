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

// Extended internal state that includes the computed result for the submitted phase
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

// Map InternalState to the public QuizState type for consumers
function toPublicState(state: InternalState): QuizState {
  return state as QuizState;
}

export default function Quiz({ quiz }: QuizProps) {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const resultRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the result heading when quiz is submitted
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

    // Persist last score to localStorage (best-effort)
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
      // localStorage unavailable (private mode, SSR, etc.) — non-fatal
    }

    dispatch({ type: "submit", result });
  }

  function handleRetry() {
    dispatch({ type: "retry" });
  }

  const isSubmitted = state.status === "submitted";
  // Keep linter happy — toPublicState used for type documentation only
  void toPublicState;

  return (
    <section aria-labelledby="quiz-heading" className="mt-8">
      <h2
        id="quiz-heading"
        className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100"
      >
        Self-check quiz
      </h2>

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
        <div className="space-y-6">
          {quiz.questions.map((question) => (
            <QuizQuestion
              key={question.id}
              question={question}
              selectedChoiceId={answers[question.id] ?? null}
              revealed={isSubmitted}
              onSelect={(choiceId) => handleSelect(question.id, choiceId)}
            />
          ))}
        </div>

        {!isSubmitted && (
          <div className="mt-6 flex items-center gap-4">
            <button
              type="submit"
              disabled={!allAnswered}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Submit answers
            </button>
            {!allAnswered && (
              <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
                Answer all questions to submit.
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );
}
