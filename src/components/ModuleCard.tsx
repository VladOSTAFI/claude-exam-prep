import Link from "next/link";

interface ModuleCardProps {
  slug: string;
  title: string;
  domain: string;
  weight: string;
  summary?: string;
  estMinutes?: number;
}

export default function ModuleCard({
  slug,
  title,
  domain,
  weight,
  summary,
  estMinutes,
}: ModuleCardProps) {
  return (
    <Link
      href={`/modules/${slug}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-grey-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:border-primary-400 focus-visible:shadow-md dark:border-grey-800 dark:bg-grey-900/60 dark:hover:border-primary-700"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/0 to-transparent transition-opacity duration-300 group-hover:via-primary-400/70"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-50 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-primary-950"
      />

      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-grey-200 bg-grey-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-grey-600 dark:border-grey-700 dark:bg-grey-800/60 dark:text-grey-300">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          Domain {domain}
        </span>
        {weight !== "—" && (
          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-brand-700 ring-1 ring-inset ring-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-800">
            {weight}
          </span>
        )}
      </div>

      <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-grey-900 transition-colors group-hover:text-primary-700 dark:text-grey-25 dark:group-hover:text-primary-300">
        {title}
      </h3>

      {summary && (
        <p className="text-sm leading-relaxed text-grey-600 dark:text-grey-400">
          {summary}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-3">
        {estMinutes ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-grey-500 dark:text-grey-400">
            <svg
              aria-hidden="true"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="6" cy="6" r="4.5" />
              <path d="M6 3.5V6l1.75 1" />
            </svg>
            ~{estMinutes} min
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-primary-300">
          Study
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
