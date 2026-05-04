"use client";

import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedChoiceId: string | null;
  revealed: boolean;
  onSelect: (id: string) => void;
}

export default function QuizQuestion({
  question,
  selectedChoiceId,
  revealed,
  onSelect,
}: QuizQuestionProps) {
  return (
    <fieldset className="rounded-2xl border border-grey-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-sm dark:border-grey-800 dark:bg-grey-900/60">
      <legend className="px-1 text-sm font-semibold leading-relaxed text-grey-900 dark:text-grey-25">
        {question.prompt}
      </legend>
      <div className="mt-4 space-y-2">
        {question.choices.map((choice, idx) => {
          const isSelected = selectedChoiceId === choice.id;
          const isCorrect = choice.id === question.correctChoiceId;
          const letter = String.fromCharCode(65 + idx);

          let wrapperClass =
            "group relative flex items-start gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-all duration-150 ";
          let letterClass =
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors ";
          let suffixNode: React.ReactNode = null;

          if (!revealed) {
            wrapperClass += isSelected
              ? "border-primary-400 bg-primary-50 text-grey-900 ring-1 ring-primary-300 dark:border-primary-500 dark:bg-primary-950/40 dark:text-grey-25 dark:ring-primary-700"
              : "border-grey-200 bg-white text-grey-700 hover:border-primary-200 hover:bg-primary-50/40 dark:border-grey-800 dark:bg-grey-900/40 dark:text-grey-200 dark:hover:border-primary-800 dark:hover:bg-primary-950/20";
            letterClass += isSelected
              ? "border-primary-400 bg-primary-500 text-white dark:border-primary-500"
              : "border-grey-200 bg-grey-50 text-grey-600 group-hover:border-primary-200 group-hover:text-primary-700 dark:border-grey-800 dark:bg-grey-900 dark:text-grey-400";
          } else if (isCorrect) {
            wrapperClass +=
              "border-success-300 bg-success-50 text-success-900 dark:border-success-700 dark:bg-success-900/30 dark:text-success-100";
            letterClass +=
              "border-success-400 bg-success-500 text-white dark:border-success-600";
            suffixNode = (
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-success-700 dark:text-success-300">
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 6.5L5 9l4.5-5" />
                </svg>
                Correct
              </span>
            );
          } else if (isSelected && !isCorrect) {
            wrapperClass +=
              "border-error-300 bg-error-50 text-error-900 dark:border-error-700 dark:bg-error-900/30 dark:text-error-100";
            letterClass +=
              "border-error-400 bg-error-500 text-white dark:border-error-600";
            suffixNode = (
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-error-700 dark:text-error-300">
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
                Yours
              </span>
            );
          } else {
            wrapperClass +=
              "border-grey-200 bg-white text-grey-500 dark:border-grey-800 dark:bg-grey-900/40 dark:text-grey-400";
            letterClass +=
              "border-grey-200 bg-grey-50 text-grey-400 dark:border-grey-800 dark:bg-grey-900 dark:text-grey-500";
          }

          return (
            <label key={choice.id} className={wrapperClass}>
              <input
                type="radio"
                name={question.id}
                value={choice.id}
                checked={isSelected}
                onChange={() => !revealed && onSelect(choice.id)}
                disabled={revealed}
                className="sr-only"
                aria-label={choice.text}
              />
              <span aria-hidden="true" className={letterClass}>
                {letter}
              </span>
              <span className="flex-1 pt-0.5 leading-relaxed">{choice.text}</span>
              {suffixNode}
            </label>
          );
        })}
      </div>
      {revealed && question.explanation && (
        <div className="mt-5 flex gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 dark:border-primary-900 dark:bg-primary-950/30">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-500 text-[11px] font-bold uppercase text-white"
          >
            i
          </span>
          <p className="text-sm leading-relaxed text-grey-800 dark:text-grey-200">
            <span className="mr-1 font-semibold text-grey-900 dark:text-grey-25">
              Explanation
            </span>
            <span className="text-grey-500">·</span>{" "}
            {question.explanation}
          </p>
        </div>
      )}
    </fieldset>
  );
}
