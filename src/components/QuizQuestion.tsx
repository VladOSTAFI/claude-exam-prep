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
    <fieldset className="rounded-lg border border-slate-200 p-5 dark:border-slate-700">
      <legend className="mb-4 text-sm font-semibold leading-relaxed text-slate-900 dark:text-slate-100">
        {question.prompt}
      </legend>
      <div className="space-y-2">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const isCorrect = choice.id === question.correctChoiceId;
          let choiceClass =
            "flex items-start gap-3 rounded-md border px-4 py-3 text-sm cursor-pointer transition-colors ";

          if (!revealed) {
            choiceClass += isSelected
              ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-100"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:text-slate-200";
          } else {
            if (isCorrect) {
              choiceClass +=
                "border-green-400 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-900/30 dark:text-green-100";
            } else if (isSelected && !isCorrect) {
              choiceClass +=
                "border-red-400 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-900/30 dark:text-red-100";
            } else {
              choiceClass +=
                "border-slate-200 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400";
            }
          }

          return (
            <label key={choice.id} className={choiceClass}>
              <input
                type="radio"
                name={question.id}
                value={choice.id}
                checked={isSelected}
                onChange={() => !revealed && onSelect(choice.id)}
                disabled={revealed}
                className="mt-0.5 shrink-0 accent-indigo-600"
                aria-label={choice.text}
              />
              <span className="flex-1">{choice.text}</span>
              {revealed && isCorrect && (
                <span className="shrink-0 text-xs font-semibold text-green-700 dark:text-green-400">
                  Correct
                </span>
              )}
              {revealed && isSelected && !isCorrect && (
                <span className="shrink-0 text-xs font-semibold text-red-700 dark:text-red-400">
                  Incorrect
                </span>
              )}
            </label>
          );
        })}
      </div>
      {revealed && question.explanation && (
        <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="mr-1 font-semibold text-slate-900 dark:text-slate-100">
            Explanation:
          </span>
          {question.explanation}
        </p>
      )}
    </fieldset>
  );
}
