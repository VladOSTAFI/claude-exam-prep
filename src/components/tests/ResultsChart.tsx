'use client';

import { useEffect, useState } from 'react';

interface DomainResult {
  domain: string;
  domainNumber: number;
  correct: number;
  total: number;
}

interface ResultsChartProps {
  results: DomainResult[];
}

const domainColors = ['#e07a5f', '#3d85c6', '#10b981', '#f59e0b', '#8b5cf6'];
const PASSING_THRESHOLD = 72;

export default function ResultsChart({ results }: ResultsChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxBarHeight = 200;

  return (
    <div className="glass p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
        Accuracy by Domain
      </h3>

      <div className="relative">
        {/* Chart area */}
        <svg
          viewBox={`0 0 ${results.length * 80 + 40} ${maxBarHeight + 60}`}
          className="w-full"
          style={{ maxHeight: '300px' }}
        >
          {/* Passing threshold line */}
          <line
            x1="20"
            y1={maxBarHeight - (PASSING_THRESHOLD / 100) * maxBarHeight + 10}
            x2={results.length * 80 + 20}
            y2={maxBarHeight - (PASSING_THRESHOLD / 100) * maxBarHeight + 10}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="6 3"
          />
          <text
            x={results.length * 80 + 22}
            y={maxBarHeight - (PASSING_THRESHOLD / 100) * maxBarHeight + 14}
            fill="#ef4444"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            72%
          </text>

          {/* Bars */}
          {results.map((result, i) => {
            const pct = result.total > 0 ? (result.correct / result.total) * 100 : 0;
            const barHeight = animated ? (pct / 100) * maxBarHeight : 0;
            const color = domainColors[(result.domainNumber - 1) % domainColors.length];
            const x = i * 80 + 40;
            const barWidth = 40;

            return (
              <g key={result.domainNumber}>
                {/* Bar background */}
                <rect
                  x={x}
                  y={10}
                  width={barWidth}
                  height={maxBarHeight}
                  rx="4"
                  fill="var(--bg-input)"
                />
                {/* Bar fill */}
                <rect
                  x={x}
                  y={maxBarHeight - barHeight + 10}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={color}
                  style={{ transition: 'height 1s ease-out, y 1s ease-out' }}
                />
                {/* Percentage label */}
                <text
                  x={x + barWidth / 2}
                  y={maxBarHeight - barHeight + 4}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  style={{ transition: 'y 1s ease-out', opacity: animated ? 1 : 0 }}
                >
                  {Math.round(pct)}%
                </text>
                {/* Domain label */}
                <text
                  x={x + barWidth / 2}
                  y={maxBarHeight + 28}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontFamily="var(--font-sans)"
                >
                  D{result.domainNumber}
                </text>
                {/* Score */}
                <text
                  x={x + barWidth / 2}
                  y={maxBarHeight + 42}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                >
                  {result.correct}/{result.total}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
