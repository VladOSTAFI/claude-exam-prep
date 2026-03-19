'use client';

import { useStore } from '@/store/useStore';
import Button from '@/components/ui/Button';

interface MarkCompleteButtonProps {
  slug: string;
}

export default function MarkCompleteButton({ slug }: MarkCompleteButtonProps) {
  const markModuleComplete = useStore((s) => s.markModuleComplete);
  const progress = useStore((s) => s.progress);
  const isComplete = progress?.modulesRead?.[slug]?.completed ?? false;

  return (
    <Button
      variant={isComplete ? 'secondary' : 'primary'}
      onClick={() => markModuleComplete(slug)}
      size="lg"
    >
      {isComplete ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Module Completed
        </>
      ) : (
        'Mark as Complete'
      )}
    </Button>
  );
}
