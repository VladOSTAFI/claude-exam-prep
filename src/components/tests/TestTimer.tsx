'use client';

import { useEffect, useState } from 'react';

interface TestTimerProps {
  timeLimit: number; // in seconds
  onTimeUp: () => void;
  paused?: boolean;
}

export default function TestTimer({ timeLimit, onTimeUp, paused = false }: TestTimerProps) {
  const [remaining, setRemaining] = useState(timeLimit);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, paused, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 60;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold transition-colors ${
        isLow
          ? 'text-error bg-error/10 animate-pulse'
          : 'text-[var(--text-primary)] bg-[var(--bg-input)]'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
