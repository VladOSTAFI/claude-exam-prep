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
      className="mt-12 flex items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-slate-700"
    >
      {prev ? (
        <Link
          href={`/modules/${prev.slug}`}
          className="group flex max-w-xs flex-col gap-1 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">Previous</span>
          <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-400">
            &larr; {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/modules/${next.slug}`}
          className="group flex max-w-xs flex-col gap-1 rounded-lg border border-slate-200 px-4 py-3 text-right transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">Next</span>
          <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-400">
            {next.title} &rarr;
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
