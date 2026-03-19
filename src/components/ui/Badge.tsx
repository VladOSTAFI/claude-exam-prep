import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant: 'domain' | 'difficulty' | 'status';
  color?: string;
}

const difficultyColors: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

export default function Badge({ children, variant, color }: BadgeProps) {
  let bgColor = color || '#7f56d9';
  let textContent = children;

  if (variant === 'difficulty' && typeof children === 'string') {
    bgColor = difficultyColors[children] || bgColor;
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: `${bgColor}20`,
        color: bgColor,
        border: `1px solid ${bgColor}40`,
      }}
    >
      {textContent}
    </span>
  );
}
