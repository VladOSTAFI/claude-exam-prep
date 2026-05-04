import { renderMarkdownToHtml } from "@/lib/markdown";

interface ModuleContentProps {
  markdown: string;
}

/**
 * Server Component — renders markdown to HTML at build time using the
 * async unified pipeline (remark-gfm + rehype-slug + rehype-autolink-headings
 * + rehype-pretty-code/Shiki). Output is injected via dangerouslySetInnerHTML;
 * this is safe because all content comes from controlled source files in modules/.
 */
export default async function ModuleContent({ markdown }: ModuleContentProps) {
  const html = await renderMarkdownToHtml(markdown);
  return (
    <article
      className="prose prose-slate max-w-none dark:prose-invert prose-table:text-sm prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
