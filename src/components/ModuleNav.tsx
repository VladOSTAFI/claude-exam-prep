import Link from "next/link";

interface NavEntry {
  slug: string;
  title: string;
}

interface ModuleNavProps {
  prev?: NavEntry;
  next?: NavEntry;
}

export default function ModuleNav({ prev, next }: ModuleNavProps) {
  return (
    <nav
      aria-label="Module navigation"
      className="mt-12 grid grid-cols-1 gap-3 border-t border-grey-200 pt-8 sm:grid-cols-2 dark:border-grey-800"
    >
      {prev ? (
        <Link
          href={`/modules/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-grey-200 bg-white px-5 py-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md sm:col-start-1 dark:border-grey-800 dark:bg-grey-900/60 dark:hover:border-primary-700"
        >
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-grey-500 dark:text-grey-400">
            <span aria-hidden="true" className="text-primary-500">←</span>
            Previous
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-grey-900 transition-colors group-hover:text-primary-700 dark:text-grey-25 dark:group-hover:text-primary-300">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/modules/${next.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-grey-200 bg-white px-5 py-4 text-right shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md sm:col-start-2 dark:border-grey-800 dark:bg-grey-900/60 dark:hover:border-primary-700"
        >
          <span className="inline-flex items-center justify-end gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-grey-500 dark:text-grey-400">
            Next
            <span aria-hidden="true" className="text-primary-500">→</span>
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-grey-900 transition-colors group-hover:text-primary-700 dark:text-grey-25 dark:group-hover:text-primary-300">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
