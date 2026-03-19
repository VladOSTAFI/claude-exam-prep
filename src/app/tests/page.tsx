'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/types';
import { useStore } from '@/store/useStore';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const domainColors = ['#e07a5f', '#3d85c6', '#10b981', '#f59e0b', '#8b5cf6'];

const timeLimitOptions = [
  { label: 'No Limit', value: 0 },
  { label: '30 min', value: 30 * 60 },
  { label: '60 min', value: 60 * 60 },
  { label: '90 min', value: 90 * 60 },
];

export default function TestConfigPage() {
  const router = useRouter();
  const startTest = useStore((s) => s.startTest);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomains, setSelectedDomains] = useState<number[]>([1, 2, 3, 4, 5]);
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState<string>('all');
  const [timeLimit, setTimeLimit] = useState(60 * 60);

  useEffect(() => {
    fetch('/api/questions')
      .then((r) => r.json())
      .then((data: Question[]) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!selectedDomains.includes(q.domainNumber)) return false;
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
      return true;
    });
  }, [questions, selectedDomains, difficulty]);

  const availableCount = filteredQuestions.length;

  // Unique domain names
  const domains = useMemo(() => {
    const map = new Map<number, string>();
    questions.forEach((q) => map.set(q.domainNumber, q.domain));
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [questions]);

  const toggleDomain = (num: number) => {
    setSelectedDomains((prev) =>
      prev.includes(num) ? prev.filter((d) => d !== num) : [...prev, num]
    );
  };

  const handleStart = () => {
    // Shuffle and slice
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, availableCount));

    if (selected.length === 0) return;

    startTest(selected, timeLimit);
    router.push('/tests/session');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-[var(--text-secondary)]">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
        Practice Test
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Configure your practice test settings and begin.
      </p>

      <div className="space-y-6">
        {/* Domain selection */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Domains
          </h2>
          <div className="space-y-3">
            {domains.map(([num, name]) => {
              const color = domainColors[(num - 1) % domainColors.length];
              const checked = selectedDomains.includes(num);
              return (
                <label
                  key={num}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDomain(num)}
                    className="sr-only"
                  />
                  <span
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: checked ? color : 'var(--border-card)',
                      background: checked ? color : 'transparent',
                    }}
                  >
                    {checked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <Badge variant="domain" color={color}>
                    D{num}
                  </Badge>
                  <span className="text-sm text-[var(--text-primary)] group-hover:text-[#7f56d9] transition-all duration-300">
                    {name}
                  </span>
                </label>
              );
            })}
          </div>
        </GlassCard>

        {/* Difficulty */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Difficulty
          </h2>
          <div className="flex flex-wrap gap-3">
            {['all', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  difficulty === d
                    ? 'bg-[#7f56d9] text-white border-[#7f56d9]'
                    : 'border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                }`}
              >
                {d === 'all' ? 'All Levels' : d}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Question count */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Questions: {Math.min(questionCount, availableCount)}
          </h2>
          <input
            type="range"
            min={5}
            max={Math.max(availableCount, 5)}
            value={Math.min(questionCount, availableCount)}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: '#7f56d9' }}
          />
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
            <span>5</span>
            <span>{availableCount} available</span>
          </div>
        </GlassCard>

        {/* Time limit */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Time Limit
          </h2>
          <div className="flex flex-wrap gap-3">
            {timeLimitOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeLimit(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  timeLimit === opt.value
                    ? 'bg-[#7f56d9] text-white border-[#7f56d9]'
                    : 'border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Start button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-secondary)]">
            {availableCount} questions match your filters
          </p>
          <Button
            onClick={handleStart}
            disabled={availableCount === 0}
            size="lg"
          >
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}
