import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-card)] bg-[var(--bg-secondary)] ${
        hover ? 'transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(127,86,217,0.3)] hover:shadow-[0_0_30px_rgba(127,86,217,0.15)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
