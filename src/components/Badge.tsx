interface BadgeProps {
  variant: "pass" | "retry";
}

export default function Badge({ variant }: BadgeProps) {
  if (variant === "pass") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
        <span aria-hidden="true">&#10003;</span>
        PASS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      <span aria-hidden="true">&#8635;</span>
      RETRY
    </span>
  );
}
