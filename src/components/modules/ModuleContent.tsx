'use client';

interface ModuleContentProps {
  html: string;
}

export default function ModuleContent({ html }: ModuleContentProps) {
  return (
    <article
      className="prose-content max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
