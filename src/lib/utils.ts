import type { Question } from '@/types';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function calculateScore(
  answers: Record<number, string>,
  questions: Question[]
): number {
  if (questions.length === 0) return 0;

  let correct = 0;
  for (const question of questions) {
    if (answers[question.id] === question.correctAnswer) {
      correct++;
    }
  }

  return Math.round((correct / questions.length) * 1000);
}
