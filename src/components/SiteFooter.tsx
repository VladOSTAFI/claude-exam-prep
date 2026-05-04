export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-grey-200 bg-white py-8 dark:border-grey-800 dark:bg-grey-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center text-xs text-grey-500 sm:flex-row sm:justify-between sm:text-left dark:text-grey-400 lg:px-8">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500"
          />
          <p>
            CCA-F Exam Prep — independent study companion. Not affiliated with Anthropic.
          </p>
        </div>
        <p className="text-grey-400 dark:text-grey-500">
          720 / 1000 to pass · 72% per-module benchmark
        </p>
      </div>
    </footer>
  );
}
