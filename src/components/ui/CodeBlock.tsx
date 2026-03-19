'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden mb-4 border border-[var(--border-card)]">
      {/* Header bar with terminal dots */}
      <div className="flex items-center justify-between px-4 py-2 text-xs font-mono text-[var(--text-secondary)] border-b border-[var(--border-card)]" style={{ background: 'rgba(19,26,33,0.8)' }}>
        <div className="flex items-center gap-3">
          <div className="code-terminal-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-[var(--bg-input)] transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto" style={{ background: 'rgba(19,26,33,0.8)' }}>
        <code className="text-sm font-mono text-[var(--text-primary)] leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}
