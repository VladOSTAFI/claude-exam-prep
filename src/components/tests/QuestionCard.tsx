'use client';

import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string;
  onSelect: (label: string) => void;
  reviewMode?: boolean;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
  reviewMode = false,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      {/* Scenario */}
      <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-secondary)] p-6">
        <p className="text-[var(--text-primary)] leading-relaxed text-base">
          {question.scenario}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.label;
          const isCorrect = option.label === question.correctAnswer;
          let borderColor = 'var(--border-card)';
          let bgColor = 'transparent';

          if (reviewMode) {
            if (isCorrect) {
              borderColor = '#10b981';
              bgColor = 'rgba(16, 185, 129, 0.1)';
            } else if (isSelected && !isCorrect) {
              borderColor = '#ef4444';
              bgColor = 'rgba(239, 68, 68, 0.1)';
            }
          } else if (isSelected) {
            borderColor = '#7f56d9';
            bgColor = 'rgba(127, 86, 217, 0.1)';
          }

          return (
            <button
              key={option.label}
              onClick={() => !reviewMode && onSelect(option.label)}
              disabled={reviewMode}
              className="w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-start gap-3 hover:bg-[var(--bg-input)]"
              style={{ borderColor, background: bgColor }}
            >
              {/* Radio circle */}
              <span
                className="w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                style={{ borderColor: isSelected ? '#7f56d9' : 'var(--border-card)' }}
              >
                {isSelected && (
                  <span className="w-3 h-3 rounded-full bg-[#7f56d9]" />
                )}
                {reviewMode && isCorrect && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {reviewMode && isSelected && !isCorrect && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </span>

              <span className="text-sm text-[var(--text-primary)]">
                <span className="font-semibold mr-2">{option.label}.</span>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation in review mode */}
      {reviewMode && (
        <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-secondary)] p-4 border-l-3 border-l-[#7f56d9]">
          <h4 className="text-sm font-semibold text-[#7f56d9] mb-2">Explanation</h4>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
