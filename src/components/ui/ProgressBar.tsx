interface ProgressBarProps {
  value: number;
  label?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  label,
  color,
  size = 'md',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || size === 'lg') && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
          )}
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${sizeClasses[size]}`}
        style={{ background: 'var(--bg-input)' }}
      >
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-700 ease-out progress-glow`}
          style={{
            width: `${clampedValue}%`,
            background: color
              ? color
              : 'linear-gradient(90deg, #7f56d9, #9b7ae0)',
          }}
        />
      </div>
    </div>
  );
}
