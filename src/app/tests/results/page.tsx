'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, useHasHydrated } from '@/store/useStore';
import ResultsChart from '@/components/tests/ResultsChart';
import QuestionCard from '@/components/tests/QuestionCard';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const PASSING_SCORE = 720;
const MAX_SCORE = 1000;

export default function TestResultsPage() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const progress = useStore((s) => s.progress);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Get the most recent completed test
  const session = useMemo(() => {
    const sessions = progress?.testSessions ?? [];
    const completed = sessions.filter((s) => s.completedAt);
    return completed[completed.length - 1] ?? null;
  }, [progress]);

  useEffect(() => {
    if (hydrated && !session) {
      router.replace('/tests');
    }
  }, [hydrated, session, router]);

  // Calculate results
  const results = useMemo(() => {
    if (!session) return { correct: 0, total: 0, score: 0, domains: [] };

    let correct = 0;
    const domainMap = new Map<number, { domain: string; domainNumber: number; correct: number; total: number }>();

    session.questions.forEach((q) => {
      const answer = session.answers[q.id];
      const isCorrect = answer === q.correctAnswer;
      if (isCorrect) correct++;

      const existing = domainMap.get(q.domainNumber) || {
        domain: q.domain,
        domainNumber: q.domainNumber,
        correct: 0,
        total: 0,
      };
      existing.total++;
      if (isCorrect) existing.correct++;
      domainMap.set(q.domainNumber, existing);
    });

    const total = session.questions.length;
    const score = total > 0 ? Math.round((correct / total) * MAX_SCORE) : 0;
    const domains = Array.from(domainMap.values()).sort(
      (a, b) => a.domainNumber - b.domainNumber
    );

    return { correct, total, score, domains };
  }, [session]);

  // Animate score counter
  useEffect(() => {
    if (results.score === 0) return;
    const duration = 1500;
    const start = performance.now();
    const target = results.score;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [results.score]);

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const passed = results.score >= PASSING_SCORE;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Score header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
          Test Results
        </h1>

        <GlassCard className="p-8 inline-block">
          <div
            className={`text-6xl font-bold mb-2 ${
              passed ? 'text-success' : 'text-error'
            }`}
          >
            {animatedScore}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            out of {MAX_SCORE}
          </p>
          <div
            className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
              passed
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            {passed ? 'PASSED' : 'NOT PASSED'}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-3">
            {results.correct} / {results.total} correct (
            {results.total > 0
              ? Math.round((results.correct / results.total) * 100)
              : 0}
            %)
          </p>
        </GlassCard>
      </div>

      {/* Domain chart */}
      {results.domains.length > 0 && (
        <div className="mb-10">
          <ResultsChart results={results.domains} />
        </div>
      )}

      {/* Question review */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Question Review
        </h2>
        <div className="space-y-3">
          {session.questions.map((q, idx) => {
            const answer = session.answers[q.id];
            const isCorrect = answer === q.correctAnswer;
            const isExpanded = expandedQ === q.id;

            return (
              <GlassCard key={q.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                  className="w-full text-left p-4 flex items-center gap-3"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCorrect
                        ? 'bg-success/20 text-success'
                        : 'bg-error/20 text-error'
                    }`}
                  >
                    {isCorrect ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm text-[var(--text-primary)] flex-1 line-clamp-1">
                    Q{idx + 1}: {q.scenario.slice(0, 100)}...
                  </span>
                  <Badge variant="difficulty">{q.difficulty}</Badge>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[var(--border-card)] pt-4">
                    <QuestionCard
                      question={q}
                      selectedAnswer={answer}
                      onSelect={() => {}}
                      reviewMode
                    />
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button href="/tests" variant="secondary" size="lg">
          New Test
        </Button>
        <Button href="/progress" size="lg">
          View Progress
        </Button>
      </div>
    </div>
  );
}
