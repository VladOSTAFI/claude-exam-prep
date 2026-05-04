import fs from "fs";
import path from "path";
import type { ModuleMeta } from "@/types/modules";

/**
 * Single source of truth for all module slugs and metadata.
 * The landing module (00-exam-overview.md) is included here with isLanding: true
 * so it can be referenced for the home page, but it is EXCLUDED from
 * generateStaticParams — visiting /modules/exam-overview returns 404.
 */
export const MODULES: ModuleMeta[] = [
  {
    slug: "exam-overview",
    title: "Exam Overview",
    domain: "0",
    weight: "—",
    sourceFile: "00-exam-overview.md",
    isLanding: true,
    summary: "Introduction to the CCA-F exam structure, domains, and scoring.",
  },
  {
    slug: "agentic-architecture",
    title: "Agentic Architecture",
    domain: "1",
    weight: "22%",
    sourceFile: "01-agentic-architecture.md",
    isLanding: false,
    summary: "Multi-agent orchestration, tool use, and autonomous workflow design.",
    estMinutes: 25,
  },
  {
    slug: "claude-code-configuration",
    title: "Claude Code Configuration",
    domain: "2",
    weight: "18%",
    sourceFile: "02-claude-code-configuration.md",
    isLanding: false,
    summary: "CLAUDE.md, memory types, MCP server setup, and CLI configuration.",
    estMinutes: 20,
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    domain: "3",
    weight: "20%",
    sourceFile: "03-prompt-engineering.md",
    isLanding: false,
    summary: "Effective prompting, chain-of-thought, and prompt patterns for Claude.",
    estMinutes: 22,
  },
  {
    slug: "tool-design-mcp",
    title: "Tool Design & MCP",
    domain: "4",
    weight: "18%",
    sourceFile: "04-tool-design-mcp.md",
    isLanding: false,
    summary: "Model Context Protocol, tool schemas, and custom server development.",
    estMinutes: 20,
  },
  {
    slug: "context-management",
    title: "Context Management",
    domain: "5",
    weight: "12%",
    sourceFile: "05-context-management.md",
    isLanding: false,
    summary: "Context window strategy, summarization, and efficient information retrieval.",
    estMinutes: 15,
  },
  {
    slug: "rag-with-claude",
    title: "RAG with Claude",
    domain: "6",
    weight: "10%",
    sourceFile: "06-rag-with-claude.md",
    isLanding: false,
    summary: "Retrieval-augmented generation patterns, chunking, and embedding strategies.",
    estMinutes: 12,
  },
  {
    slug: "cross-module-reference",
    title: "Cross-Module Reference",
    domain: "7",
    weight: "—",
    sourceFile: "07-cross-module-reference.md",
    isLanding: false,
    summary: "Quick-reference tables spanning all domains for final review.",
    estMinutes: 10,
  },
];

export interface GetAllModulesOptions {
  includeLanding?: boolean;
}

/**
 * Returns all non-landing modules by default.
 * Pass { includeLanding: true } to also include the exam overview entry.
 */
export function getAllModules(options: GetAllModulesOptions = {}): ModuleMeta[] {
  if (options.includeLanding) {
    return MODULES;
  }
  return MODULES.filter((m) => !m.isLanding);
}

/**
 * Looks up a module by slug and reads its markdown from disk.
 * Reads at build time inside RSC — never on the client.
 */
export function getModuleBySlug(
  slug: string
): { meta: ModuleMeta; markdown: string } | null {
  const meta = MODULES.find((m) => m.slug === slug);
  if (!meta) return null;
  const filePath = path.join(process.cwd(), "modules", meta.sourceFile);
  const markdown = fs.readFileSync(filePath, "utf-8");
  return { meta, markdown };
}

/**
 * Returns the raw markdown for the landing page (00-exam-overview.md).
 */
export function getLandingMarkdown(): string {
  const filePath = path.join(process.cwd(), "modules", "00-exam-overview.md");
  return fs.readFileSync(filePath, "utf-8");
}
