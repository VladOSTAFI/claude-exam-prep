import type { TocItem } from "@/lib/markdown";

interface TocProps {
  items: TocItem[];
}

export default function Toc({ items }: TocProps) {
  if (items.length === 0) return null;

  const listContent = (
    <ul className="space-y-1">
      {items.map((item) => (
        <li
          key={item.slug}
          className={item.depth === 3 ? "ml-3" : ""}
        >
          <a
            href={`#${item.slug}`}
            className="block rounded py-0.5 text-sm leading-snug text-slate-600 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Large screens: sticky sidebar */}
      <aside className="hidden lg:block">
        <nav
          aria-label="On this page"
          className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            On this page
          </p>
          {listContent}
        </nav>
      </aside>

      {/* Small/medium screens: collapsible details */}
      <details className="mb-6 rounded-lg border border-slate-200 p-4 lg:hidden dark:border-slate-700">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
          On this page
        </summary>
        <nav aria-label="On this page" className="mt-3">
          {listContent}
        </nav>
      </details>
    </>
  );
}
