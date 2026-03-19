'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import QuestionCard from '@/components/tests/QuestionCard';
import TestTimer from '@/components/tests/TestTimer';
import TestProgress from '@/components/tests/TestProgress';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

export default function TestSessionPage() {
  const router = useRouter();
  const currentTest = useStore((s) => s.currentTest);
  const answerQuestion = useStore((s) => s.answerQuestion);
  const flagQuestion = useStore((s) => s.flagQuestion);
  const submitTest = useStore((s) => s.submitTest);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const questions = currentTest?.questions ?? [];
  const answers = currentTest?.answers ?? {};
  const flagged = currentTest?.flagged ?? [];
  const timeLimit = currentTest?.timeLimit ?? 0;
  const question = questions[currentIndex];

  // Redirect if no active test
  useEffect(() => {
    if (!currentTest || questions.length === 0) {
      router.replace('/tests');
    }
  }, [currentTest, questions.length, router]);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleFlag = useCallback(() => {
    if (question) flagQuestion(question.id);
  }, [question, flagQuestion]);

  const handleSubmit = useCallback(() => {
    submitTest();
    router.push('/tests/results');
  }, [submitTest, router]);

  const handleTimeUp = useCallback(() => {
    submitTest();
    router.push('/tests/results');
  }, [submitTest, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showConfirm) return;

      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4': {
          const idx = parseInt(e.key) - 1;
          if (question && question.options[idx]) {
            answerQuestion(question.id, question.options[idx].label);
          }
          break;
        }
        case 'n':
        case 'N':
          goNext();
          break;
        case 'p':
        case 'P':
          goPrev();
          break;
        case 'f':
        case 'F':
          handleFlag();
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [question, answerQuestion, goNext, goPrev, handleFlag, showConfirm]);

  if (!question) {
    return null;
  }

  const isFlagged = flagged.includes(question.id);
  const unansweredCount = questions.length - Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {timeLimit > 0 && (
            <TestTimer timeLimit={timeLimit} onTimeUp={handleTimeUp} />
          )}
          <button
            onClick={() => setShowMap(!showMap)}
            className="lg:hidden px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors"
          >
            Map
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFlag}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${
              isFlagged
                ? 'text-warning bg-warning/10'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            Flag
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowConfirm(true)}
          >
            Submit Test
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Question number */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-[#7f56d9]">
              Question {currentIndex + 1}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              of {questions.length}
            </span>
            {question.difficulty && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  question.difficulty === 'Easy'
                    ? 'text-success bg-success/10'
                    : question.difficulty === 'Medium'
                    ? 'text-warning bg-warning/10'
                    : 'text-error bg-error/10'
                }`}
              >
                {question.difficulty}
              </span>
            )}
          </div>

          <QuestionCard
            question={question}
            selectedAnswer={answers[question.id]}
            onSelect={(label) => answerQuestion(question.id, label)}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              &larr; Previous (P)
            </Button>
            <Button
              variant="ghost"
              onClick={goNext}
              disabled={currentIndex === questions.length - 1}
            >
              Next (N) &rarr;
            </Button>
          </div>

          {/* Keyboard hints */}
          <p className="text-xs text-[var(--text-secondary)] text-center mt-4">
            Keys: 1-4 answer, N/P navigate, F flag
          </p>
        </div>

        {/* Question map sidebar - desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <GlassCard className="p-4">
              <TestProgress
                current={currentIndex}
                total={questions.length}
                answers={answers}
                flagged={flagged}
                questionIds={questions.map((q) => q.id)}
                onJump={setCurrentIndex}
              />
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Mobile question map overlay */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowMap(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-xl border border-[var(--border-card)] bg-[var(--bg-secondary)] p-6 rounded-t-2xl max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <TestProgress
              current={currentIndex}
              total={questions.length}
              answers={answers}
              flagged={flagged}
              questionIds={questions.map((q) => q.id)}
              onJump={(idx) => {
                setCurrentIndex(idx);
                setShowMap(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <GlassCard className="p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Submit Test?
            </h3>
            {unansweredCount > 0 && (
              <p className="text-sm text-warning mb-4">
                You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.
              </p>
            )}
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Once submitted, you cannot change your answers.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
