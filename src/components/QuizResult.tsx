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
        className={`relative overflow-hidden rounded-2xl border bg-white p-7 shadow-sm dark:bg-grey-900/60 ${
          passed
            ? "border-success-200 dark:border-success-800"
            : "border-warning-200 dark:border-warning-800"
        }`}
        role="region"
        aria-label="Quiz results"
      >
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 h-1 ${
            passed
              ? "bg-gradient-to-r from-success-400 via-success-500 to-success-600"
              : "bg-gradient-to-r from-warning-300 via-warning-400 to-warning-500"
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl ${
            passed ? "bg-success-100/70 dark:bg-success-900/40" : "bg-warning-100/70 dark:bg-warning-900/30"
          }`}
        />

        <div className="relative" aria-live="polite">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  passed
                    ? "text-success-700 dark:text-success-300"
                    : "text-warning-700 dark:text-warning-300"
                }`}
              >
                {passed ? "Module passed" : "Keep going"}
              </p>
              <h3
                ref={ref}
                tabIndex={-1}
                className="mt-1 font-display text-2xl font-semibold tracking-tight text-grey-900 outline-none dark:text-grey-25"
              >
                {passed ? "Strong work — you're ready." : "Almost there."}
              </h3>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-grey-600 dark:text-grey-400">
                You scored{" "}
                <strong className="text-grey-900 dark:text-grey-25">
                  {score} / {total}
                </strong>{" "}
                {passed
                  ? "— above the 72% module threshold mirroring the 720/1000 exam pass mark."
                  : "— score 72% or higher to clear this module's self-check, the same ratio as the 720/1000 exam pass mark."}
              </p>
            </div>

            <div className="hidden shrink-0 sm:block">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-4 ${
                  passed
                    ? "ring-success-100 dark:bg-success-950 dark:ring-success-900"
                    : "ring-warning-100 dark:bg-warning-950 dark:ring-warning-900"
                }`}
              >
                <span
                  className={`font-display text-2xl font-semibold tracking-tight ${
                    passed
                      ? "text-success-700 dark:text-success-300"
                      : "text-warning-700 dark:text-warning-300"
                  }`}
                >
                  {percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.12em] text-grey-500 dark:text-grey-400">
              <span>Progress</span>
              <span className="sm:hidden">{percentage}%</span>
              <span className="hidden sm:inline">Pass mark · 72%</span>
            </div>
            <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-grey-100 dark:bg-grey-800">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out ${
                  passed
                    ? "bg-gradient-to-r from-success-400 to-success-600"
                    : "bg-gradient-to-r from-warning-300 to-warning-500"
                }`}
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Score: ${percentage}%`}
              />
              <span
                aria-hidden="true"
                className="absolute inset-y-0 hidden w-px bg-grey-400 sm:block"
                style={{ left: "72%" }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-grey-950 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-grey-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 dark:bg-white dark:text-grey-950 dark:hover:bg-grey-100"
            >
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11.5 7a4.5 4.5 0 1 1-1.32-3.18" />
                <path d="M11.5 2.5V5H9" />
              </svg>
              Retake quiz
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-grey-500 dark:text-grey-400">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  passed ? "bg-success-500" : "bg-warning-500"
                }`}
              />
              {score} correct · {total - score} missed
            </span>
          </div>
        </div>
      </div>
    );
  }
);

export default QuizResult;
