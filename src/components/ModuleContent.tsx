import { renderMarkdownToHtml } from "@/lib/markdown";

interface ModuleContentProps {
  markdown: string;
}

export default async function ModuleContent({ markdown }: ModuleContentProps) {
  const html = await renderMarkdownToHtml(markdown);
  return (
    <article
      className="prose prose-grey max-w-none text-grey-800 dark:prose-invert dark:text-grey-200 prose-headings:font-display prose-headings:tracking-tight prose-h1:text-3xl prose-h1:font-semibold prose-h2:mt-12 prose-h2:border-b prose-h2:border-grey-200 prose-h2:pb-2 prose-h2:text-2xl prose-h2:font-semibold dark:prose-h2:border-grey-800 prose-h3:text-lg prose-h3:font-semibold prose-a:text-primary-700 hover:prose-a:text-primary-900 dark:prose-a:text-primary-300 dark:hover:prose-a:text-primary-200 prose-strong:font-semibold prose-strong:text-grey-900 dark:prose-strong:text-grey-25 prose-blockquote:rounded-r-md prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50/40 prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-grey-800 dark:prose-blockquote:bg-primary-950/20 dark:prose-blockquote:text-grey-200 prose-table:overflow-hidden prose-table:rounded-lg prose-table:border prose-table:border-grey-200 dark:prose-table:border-grey-800 prose-pre:rounded-xl prose-pre:border prose-pre:border-grey-900 prose-pre:bg-grey-950 prose-pre:shadow-sm prose-img:rounded-xl prose-img:border prose-img:border-grey-200 dark:prose-img:border-grey-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
