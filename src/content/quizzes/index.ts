/**
 * Quiz registry — maps module slugs to their Quiz objects.
 *
 * Note: the exam overview module (00-exam-overview.md / slug: "exam-overview")
 * intentionally has NO quiz. It is reference/orientation material, not a
 * learning module with self-check content. This is by design and documented in
 * the implementation plan.
 */
import type { Quiz } from "@/types/quiz";

import agenticArchitecture from "./agentic-architecture";
import claudeCodeConfiguration from "./claude-code-configuration";
import promptEngineering from "./prompt-engineering";
import toolDesignMcp from "./tool-design-mcp";
import contextManagement from "./context-management";
import ragWithClaude from "./rag-with-claude";
import crossModuleReference from "./cross-module-reference";

export const quizzesBySlug: Record<string, Quiz> = {
  "agentic-architecture": agenticArchitecture,
  "claude-code-configuration": claudeCodeConfiguration,
  "prompt-engineering": promptEngineering,
  "tool-design-mcp": toolDesignMcp,
  "context-management": contextManagement,
  "rag-with-claude": ragWithClaude,
  "cross-module-reference": crossModuleReference,
};
