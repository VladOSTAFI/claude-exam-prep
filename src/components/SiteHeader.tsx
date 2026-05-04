import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
        >
          <span className="text-base font-bold tracking-tight">CCA-F Prep</span>
          <span className="hidden text-xs font-normal text-slate-500 sm:inline dark:text-slate-400">
            Claude Certified Architect — Foundations
          </span>
        </Link>
        <nav aria-label="Site navigation">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            All Modules
          </Link>
        </nav>
      </div>
    </header>
  );
}
