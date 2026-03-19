'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Section } from '@/types';

interface TableOfContentsProps {
  sections: Section[];
}

export default function TableOfContents({ sections }: TableOfContentsProps) {
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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (sections.length === 0) return null;

  return (
    <nav className="space-y-0.5">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollTo(section.id)}
          className={`block w-full text-left text-sm py-1.5 px-3 rounded transition-all duration-300 ${
            activeId === section.id
              ? 'text-[#7f56d9] bg-[rgba(127,86,217,0.1)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
          }`}
          style={{ paddingLeft: `${(section.depth - 1) * 12 + 12}px` }}
        >
          {section.title}
        </button>
      ))}
    </nav>
  );
}
