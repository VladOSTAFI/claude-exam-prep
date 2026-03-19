'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Section } from '@/types';

interface SidebarProps {
  sections: Section[];
}

export default function Sidebar({ sections }: SidebarProps) {
  const [activeId, setActiveId] = useState<string>('');

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const visible = entries.filter((e) => e.isIntersecting);
    if (visible.length > 0) {
      setActiveId(visible[0].target.id);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, handleIntersect]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (sections.length === 0) return null;

  return (
    <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto w-64 shrink-0">
      <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-secondary)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wider">
          Contents
        </h3>
        <nav className="space-y-0.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
              className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-all duration-300 ${
                activeId === section.id
                  ? 'text-[#7f56d9] bg-[rgba(127,86,217,0.1)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
              }`}
              style={{ paddingLeft: `${(section.depth - 1) * 12 + 8}px` }}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
