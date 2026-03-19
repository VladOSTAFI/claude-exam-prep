import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';

const domainColors = ['#e07a5f', '#3d85c6', '#10b981', '#f59e0b', '#8b5cf6'];

interface DomainData {
  domain: string;
  domainNumber: number;
  accuracy: number;
  questionsAttempted: number;
  totalQuestions: number;
}

interface DomainProgressProps {
  domains: DomainData[];
}

export default function DomainProgress({ domains }: DomainProgressProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Domain Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((d) => {
          const color = domainColors[(d.domainNumber - 1) % domainColors.length];
          return (
            <GlassCard key={d.domainNumber} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: color }}
                >
                  {d.domainNumber}
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1 flex-1">
                  {d.domain}
                </h3>
              </div>

              <ProgressBar value={d.accuracy} color={color} size="md" label="Accuracy" />

              <p className="text-xs text-[var(--text-secondary)] mt-2">
                {d.questionsAttempted} / {d.totalQuestions} questions attempted
              </p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
