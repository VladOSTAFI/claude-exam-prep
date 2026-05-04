interface BadgeProps {
  variant: "pass" | "retry";
}

export default function Badge({ variant }: BadgeProps) {
  if (variant === "pass") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-success-700 ring-1 ring-inset ring-success-200 dark:bg-success-900/30 dark:text-success-300 dark:ring-success-800">
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 6.5L5 9l4.5-5" />
        </svg>
        Pass
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-warning-700 ring-1 ring-inset ring-warning-200 dark:bg-warning-900/30 dark:text-warning-300 dark:ring-warning-800">
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.5 6a3.5 3.5 0 1 1-1.026-2.474" />
        <path d="M9.5 2v2.5H7" />
      </svg>
      Retry
    </span>
  );
}
