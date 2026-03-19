import GlassCard from '@/components/ui/GlassCard';

interface Stat {
  label: string;
  value: string | number;
  icon: 'questions' | 'accuracy' | 'streak' | 'readiness';
}

interface StatsGridProps {
  stats: Stat[];
}

const icons: Record<string, React.ReactNode> = {
  questions: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7f56d9" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  accuracy: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  streak: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  readiness: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round">
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    </svg>
  ),
};

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <GlassCard key={stat.label} className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-input)]">
              {icons[stat.icon]}
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {stat.value}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
        </GlassCard>
      ))}
    </div>
  );
}
