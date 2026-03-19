import ProgressBar from '@/components/ui/ProgressBar';

interface TestProgressProps {
  current: number;
  total: number;
  answers: Record<number, string>;
  flagged: number[];
  questionIds: number[];
  onJump?: (index: number) => void;
}

export default function TestProgress({
  current,
  total,
  answers,
  flagged,
  questionIds,
  onJump,
}: TestProgressProps) {
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">
          Question <span className="text-[var(--text-primary)] font-semibold">{current + 1}</span> of{' '}
          <span className="text-[var(--text-primary)] font-semibold">{total}</span>
        </span>
        <span className="text-[var(--text-secondary)]">
          {answeredCount} answered
        </span>
      </div>

      <ProgressBar value={(answeredCount / total) * 100} size="sm" />

      {/* Question dots */}
      <div className="flex flex-wrap gap-1.5">
        {questionIds.map((qId, idx) => {
          const isAnswered = qId in answers;
          const isCurrent = idx === current;
          const isFlagged = flagged.includes(qId);

          return (
            <button
              key={qId}
              onClick={() => onJump?.(idx)}
              className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-all duration-300 ${
                isCurrent
                  ? 'ring-2 ring-[#7f56d9] ring-offset-1 ring-offset-[var(--bg-primary)] bg-[#7f56d9] text-white'
                  : isAnswered
                  ? 'bg-[rgba(127,86,217,0.2)] text-[#7f56d9]'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
              }`}
              title={`Question ${idx + 1}${isFlagged ? ' (flagged)' : ''}`}
            >
              {isFlagged ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              ) : (
                idx + 1
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
