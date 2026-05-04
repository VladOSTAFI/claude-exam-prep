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
      className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          Domain {domain}
        </span>
        {weight !== "—" && (
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {weight}
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-400">
        {title}
      </h3>
      {summary && (
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {summary}
        </p>
      )}
      {estMinutes && (
        <p className="mt-auto text-xs text-slate-400 dark:text-slate-500">
          ~{estMinutes} min
        </p>
      )}
    </Link>
  );
}
