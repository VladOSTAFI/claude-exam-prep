import type { TocItem } from "@/lib/markdown";

interface TocProps {
  items: TocItem[];
}

export default function Toc({ items }: TocProps) {
  if (items.length === 0) return null;

  const listContent = (
    <ul className="space-y-0.5 border-l border-grey-200 pl-4 dark:border-grey-800">
      {items.map((item) => (
        <li key={item.slug} className={item.depth === 3 ? "ml-3" : ""}>
          <a
            href={`#${item.slug}`}
            className="group relative -ml-[17px] block rounded-md py-1 pl-4 pr-2 text-sm leading-snug text-grey-600 transition-colors hover:text-primary-700 dark:text-grey-400 dark:hover:text-primary-300"
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-4 w-px -translate-y-1/2 scale-y-0 bg-primary-500 transition-transform duration-200 group-hover:scale-y-100"
            />
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <aside className="hidden lg:block">
        <nav
          aria-label="On this page"
          className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
        >
          <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-grey-500 dark:text-grey-400">
            <span aria-hidden="true" className="h-1 w-4 rounded-full bg-primary-500" />
            On this page
          </p>
          {listContent}
        </nav>
      </aside>

      <details className="group mb-6 overflow-hidden rounded-xl border border-grey-200 bg-white shadow-xs lg:hidden dark:border-grey-800 dark:bg-grey-900/60">
        <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-grey-800 transition-colors hover:bg-grey-50 dark:text-grey-200 dark:hover:bg-grey-800/40">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-1 w-4 rounded-full bg-primary-500" />
            On this page
          </span>
          <span
            aria-hidden="true"
            className="text-grey-400 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <nav aria-label="On this page" className="px-4 pb-4 pt-1">
          {listContent}
        </nav>
      </details>
    </>
  );
}
