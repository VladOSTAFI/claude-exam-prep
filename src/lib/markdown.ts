import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";

interface MdastLike {
  type?: string;
  url?: string;
  children?: MdastLike[];
}

// Rewrite source-tree links like `./01-agentic-architecture.md` → `/modules/agentic-architecture`.
// Preserves any trailing #fragment. Maps `00-exam-overview.md` to the home route.
function remarkRewriteModuleLinks() {
  const moduleLink = /^\.{0,2}\/?(\d{2})-([a-z0-9-]+)\.md(#.*)?$/i;
  const walk = (node: MdastLike) => {
    if (node.type === "link" && typeof node.url === "string") {
      const m = node.url.match(moduleLink);
      if (m) {
        const [, prefix, slug, fragment = ""] = m;
        node.url = prefix === "00" ? `/${fragment}` : `/modules/${slug}${fragment}`;
      }
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  };
  return (tree: MdastLike) => walk(tree);
}

export type TocItem = {
  depth: 2 | 3;
  text: string;
  slug: string;
};

/**
 * Extracts a flat list of h2 and h3 headings from raw markdown source.
 * Uses github-slugger so the generated slugs match what rehype-slug produces.
 */
export function extractToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(source)) !== null) {
    const depth = match[1].length as 2 | 3;
    // Strip inline markdown (backticks, bold, italic, links) from heading text
    const text = match[2].replace(/[`*_[\]]/g, "").trim();
    const slug = slugger.slug(text);
    items.push({ depth, text, slug });
  }

  return items;
}

/**
 * Renders markdown to an HTML string using the full plugin pipeline.
 * Async because rehype-pretty-code (Shiki) is inherently async.
 * Called only in Server Components at build time — never on the client.
 */
export async function renderMarkdownToHtml(source: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRewriteModuleLinks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "append" })
    .use(rehypePrettyCode, {
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);

  return String(file);
}
