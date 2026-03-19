'use client';

import { useMemo } from 'react';
import { useStore, useHasHydrated } from '@/store/useStore';
import StatsGrid from '@/components/dashboard/StatsGrid';
import DomainProgress from '@/components/dashboard/DomainProgress';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';

export default function ProgressPage() {
  const hydrated = useHasHydrated();
  const progress = useStore((s) => s.progress);

  const stats = useMemo(() => {
    const sessions = progress?.testSessions ?? [];
    const completed = sessions.filter((s) => s.completedAt);

    let totalQ = 0;
    let totalCorrect = 0;

    completed.forEach((session) => {
      session.questions.forEach((q) => {
        totalQ++;
        if (session.answers[q.id] === q.correctAnswer) totalCorrect++;
      });
    });

    const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
    const readiness = Math.min(100, Math.round(accuracy * 0.7 + completed.length * 3));

    // Simple streak calculation based on completed tests
    const streak = completed.length;

    return [
      { label: 'Questions Attempted', value: totalQ, icon: 'questions' as const },
      { label: 'Overall Accuracy', value: `${accuracy}%`, icon: 'accuracy' as const },
      { label: 'Tests Completed', value: streak, icon: 'streak' as const },
      { label: 'Readiness Score', value: `${readiness}%`, icon: 'readiness' as const },
    ];
  }, [progress]);

  const domainData = useMemo(() => {
    const sessions = progress?.testSessions ?? [];
    const completed = sessions.filter((s) => s.completedAt);
    const domainMap = new Map<number, { domain: string; domainNumber: number; correct: number; total: number }>();

    completed.forEach((session) => {
      session.questions.forEach((q) => {
        const existing = domainMap.get(q.domainNumber) || {
          domain: q.domain,
          domainNumber: q.domainNumber,
          correct: 0,
          total: 0,
        };
        existing.total++;
        if (session.answers[q.id] === q.correctAnswer) existing.correct++;
        domainMap.set(q.domainNumber, existing);
      });
    });

    return Array.from(domainMap.values())
      .sort((a, b) => a.domainNumber - b.domainNumber)
      .map((d) => ({
        domain: d.domain,
        domainNumber: d.domainNumber,
        accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
        questionsAttempted: d.total,
        totalQuestions: d.total,
      }));
  }, [progress]);

  const testHistory = useMemo(() => {
    const sessions = progress?.testSessions ?? [];
    return sessions
      .filter((s) => s.completedAt)
      .reverse()
      .slice(0, 10);
  }, [progress]);

  const weakAreas = useMemo(() => {
    return domainData
      .filter((d) => d.accuracy < 72 && d.questionsAttempted > 0)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [domainData]);

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
        Progress
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Track your study progress and identify areas for improvement.
      </p>

      {/* Stats */}
      <div className="mb-10">
        <StatsGrid stats={stats} />
      </div>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Areas Needing Improvement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weakAreas.map((area) => (
              <GlassCard key={area.domainNumber} className="p-4 border-l-4 border-l-error">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {area.domain}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {area.accuracy}% accuracy ({area.questionsAttempted} questions)
                    </p>
                  </div>
                  <Badge variant="difficulty" color="#ef4444">
                    Below 72%
                  </Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Domain progress */}
      {domainData.length > 0 && (
        <div className="mb-10">
          <DomainProgress domains={domainData} />
        </div>
      )}

      {/* Test history */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Test History
        </h2>
        {testHistory.length > 0 ? (
          <div className="space-y-3">
            {testHistory.map((session) => {
              const correct = session.questions.filter(
                (q) => session.answers[q.id] === q.correctAnswer
              ).length;
              const total = session.questions.length;
              const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
              const score = Math.round((pct / 100) * 1000);
              const passed = score >= 720;

              return (
                <GlassCard key={session.id} className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {total} Questions
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {session.completedAt
                          ? new Date(session.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'In progress'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {correct}/{total} correct
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          passed ? 'text-success' : 'text-error'
                        }`}
                      >
                        {score}
                      </span>
                      <Badge
                        variant="status"
                        color={passed ? '#10b981' : '#ef4444'}
                      >
                        {passed ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">
              No tests completed yet. Take a practice test to start tracking your progress.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
