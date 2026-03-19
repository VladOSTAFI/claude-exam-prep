'use client';

import { useStore, useHasHydrated } from '@/store/useStore';
import ModuleCard from './ModuleCard';
import type { Module } from '@/types';

interface ModuleGridProps {
  modules: Module[];
}

export default function ModuleGrid({ modules }: ModuleGridProps) {
  const hydrated = useHasHydrated();
  const progress = useStore((s) => s.progress);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((mod) => {
        let pct = 0;
        if (hydrated) {
          const mp = progress?.modulesRead?.[mod.slug];
          if (mp?.completed) {
            pct = 100;
          } else if (mp?.sectionsRead?.length && mod.sections.length > 0) {
            pct = Math.round(
              (mp.sectionsRead.length / mod.sections.length) * 100
            );
          }
        }
        return <ModuleCard key={mod.slug} module={mod} progress={pct} />;
      })}
    </div>
  );
}
