"use client";

import { forwardRef } from "react";

interface QuizResultProps {
  score: number;
  total: number;
  passed: boolean;
  onRetry: () => void;
}

const QuizResult = forwardRef<HTMLHeadingElement, QuizResultProps>(
  function QuizResult({ score, total, passed, onRetry }, ref) {
    const percentage = Math.round((score / total) * 100);

    return (
      <div
        className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50"
        role="region"
        aria-label="Quiz results"
      >
        <div aria-live="polite">
          <h3
            ref={ref}
            tabIndex={-1}
            className="mb-2 text-lg font-bold text-slate-900 outline-none dark:text-slate-100"
          >
            {passed ? "Well done!" : "Keep studying!"}
          </h3>
          <p className="mb-4 text-slate-600 dark:text-slate-400">
            You scored{" "}
            <strong className="text-slate-900 dark:text-slate-100">
              {score} / {total} correct ({percentage}%)
            </strong>
            .{" "}
            <span>
              {passed
                ? "You passed this module's self-check (72% threshold)."
                : "Score 72% or above to pass this module's self-check."}
            </span>
          </p>
          <div className="mb-5 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                passed
                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
              }`}
            >
              {passed ? (
                <>
                  <span aria-hidden="true">&#10003;</span>
                  PASS
                </>
              ) : (
                <>
                  <span aria-hidden="true">&#8635;</span>
                  RETRY
                </>
              )}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full transition-all ${
                  passed ? "bg-green-500" : "bg-amber-400"
                }`}
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Score: ${percentage}%`}
              />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {percentage}%
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Retry quiz
        </button>
      </div>
    );
  }
);

export default QuizResult;
