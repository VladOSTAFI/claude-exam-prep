import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-grey-200/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 dark:border-grey-800/80 dark:bg-grey-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-grey-900 transition-colors dark:text-grey-25"
          aria-label="CCA-F Prep — Home"
        >
          <span
            aria-hidden="true"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-gradient text-white shadow-xs ring-1 ring-inset ring-white/30"
          >
            <span className="font-display text-[15px] font-semibold leading-none tracking-tight">
              C
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary-300 ring-2 ring-white dark:ring-grey-950" />
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-[17px] font-semibold leading-none tracking-tight">
              CCA-F
            </span>
            <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-grey-500 sm:inline dark:text-grey-400">
              Prep
            </span>
          </span>
        </Link>
        <nav aria-label="Site navigation" className="flex items-center gap-1">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-grey-700 transition-colors hover:bg-grey-100 hover:text-grey-900 dark:text-grey-300 dark:hover:bg-grey-800 dark:hover:text-grey-25"
          >
            Modules
          </Link>
          <a
            href="https://www.anthropic.com/learn/claude"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-grey-700 transition-colors hover:bg-grey-100 hover:text-grey-900 sm:inline-flex dark:text-grey-300 dark:hover:bg-grey-800 dark:hover:text-grey-25"
          >
            Anthropic Learn
            <span aria-hidden="true" className="ml-1 text-grey-400">↗</span>
          </a>
        </nav>
      </div>
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-primary-400/50 to-transparent"
      />
    </header>
  );
}
