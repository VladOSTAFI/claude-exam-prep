import Link from 'next/link';
import type { Module } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

const domainColors = ['#e07a5f', '#3d85c6', '#10b981', '#f59e0b', '#8b5cf6'];

interface ModuleCardProps {
  module: Module;
  progress?: number;
}

export default function ModuleCard({ module, progress = 0 }: ModuleCardProps) {
  const color = domainColors[(module.domain - 1) % domainColors.length];

  return (
    <Link href={`/modules/${module.slug}`}>
      <GlassCard hover className="p-5 h-full flex flex-col">
        {/* Domain badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="domain" color={color}>
            Domain {module.domain}
          </Badge>
          <span
            className="text-sm font-bold"
            style={{ color }}
          >
            {module.weight}%
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
          {module.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 flex-1">
          {module.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 text-xs text-[var(--text-secondary)]">
          <span>{module.taskStatements} task statements</span>
          <span>{module.sections.length} sections</span>
        </div>

        {/* Progress */}
        <ProgressBar value={progress} size="sm" color={color} />
      </GlassCard>
    </Link>
  );
}
