# CCA-F Exam Overview

> **Claude Certified Architect — Foundations (CCA-F)**
> Anthropic's first technical certification — launched **March 12, 2026** through the Claude Partner Network.

---

## At a glance

| Item | Value |
|---|---|
| **Format** | 60 multiple-choice questions, scenario-grounded |
| **Duration** | 120 minutes (≈ 2 min per question) |
| **Passing score** | **720 / 1,000** (scaled) |
| **Cost** | **$99 USD** per attempt (free for the first 5,000 Partner Network employees) |
| **Delivery** | Online proctored or testing center |
| **Prerequisites** | Recommended ≥ 6 months hands-on with Claude Agent SDK, Claude Code, Claude API, MCP |
| **Score report** | ~2 business days, with section-level breakdown + shareable digital badge |

---

## Domain weights

The exam tests five domains. **Memorize these weights** — they tell you where to spend study time.

| # | Domain | Weight | What it covers |
|---|---|---|---|
| 1 | **Agentic Architecture & Orchestration** | **27%** | Agent loop, `stop_reason`, hub-and-spoke, subagent context isolation, `Task` tool, parallel spawning, session resume vs. fork |
| 2 | **Claude Code Configuration & Workflows** | **20%** | CLAUDE.md hierarchy, `.claude/rules/`, skills frontmatter, plan mode, headless `-p`, GitHub Actions |
| 3 | **Prompt Engineering & Structured Output** | **20%** | `tool_use` for JSON, schema design, few-shot, validation-retry loops |
| 4 | **Tool Design & MCP Integration** | **18%** | Tool descriptions as routing, structured `isError` payloads, `.mcp.json`, namespacing |
| 5 | **Context Management & Reliability** | **15%** | Lost-in-the-middle, escalation triggers, multi-pass review, hooks vs. prompt instructions |

RAG (contextual retrieval) is **cross-cutting** — tested through Scenarios 3 and 6 rather than as a standalone domain.

---

## The 6 scenarios

Each exam picks **4 of 6** scenarios at random. Every question lives inside one scenario, so reading the scenario header carefully unlocks 10–15 answers.

1. **Customer Support Resolution Agent** — refunds, escalation, hooks, structured guardrails
2. **Code Generation with Claude Code** — CLAUDE.md, skills, plan mode, hooks
3. **Multi-Agent Research System** — orchestrator-workers, parallel `Task`, token economics
4. **Developer Productivity** — skills, slash commands, MCP servers
5. **Claude Code in CI/CD** — `claude -p`, `--output-format json`, GitHub Actions
6. **Structured Data Extraction** — `tool_choice`, schema design, retry on validation error

---

## How questions are written

Every question has **one correct answer of four**, and the wrong answers are **deliberately tempting**. They sound like good engineering. The exam tests *what NOT to do* as much as what to do.

Common wrong-but-plausible distractors:

- "Raise `max_iterations` to 100 to handle complex tasks"
- "Give every agent access to all tools for flexibility"
- "Use a 1M-token context to fit everything"
- "Add few-shot examples to enforce tool ordering"
- "Trust the LLM's self-reported confidence for escalation"
- "Use SSE transport for the new MCP server"
- "Route blocking workflows to the Batch API for cost savings"

When in doubt, prefer the answer that:
1. **Isolates context** (subagents, fresh instances)
2. **Returns structured errors** (categories, retryable flags)
3. **Uses deterministic mechanisms** (hooks, schema enums) for compliance
4. **Keeps tools minimal** and well-described
5. **Escalates on structured business signals**, not model self-confidence

---

## Modules in this guide

| Module | Domain | Weight |
|---|---|---|
| [01 — Agentic Architecture & Orchestration](./01-agentic-architecture.md) | 1 | 27% |
| [02 — Claude Code Configuration & Workflows](./02-claude-code-configuration.md) | 2 | 20% |
| [03 — Prompt Engineering & Structured Output](./03-prompt-engineering.md) | 3 | 20% |
| [04 — Tool Design & MCP Integration](./04-tool-design-mcp.md) | 4 | 18% |
| [05 — Context Management & Reliability](./05-context-management.md) | 5 | 15% |
| [06 — RAG with Claude (Contextual Retrieval)](./06-rag-with-claude.md) | Cross-cutting | — |
| [07 — Cross-Module Reference & Anti-Patterns](./07-cross-module-reference.md) | All | — |

---

## Day-of-exam checklist

- Sleep is more valuable than cramming. The exam tests judgment under ambiguity, not recall.
- Check the proctoring environment 60+ minutes early — webcam, ID, clean desk, no second monitor.
- **First pass:** answer everything you're sure of in under 60 seconds; flag the rest.
- **No guessing penalty** — never leave a question blank.
- Read the scenario header **once, deeply** — all questions in that scenario share the same context.
- Eliminate the "sounds smart but wrong" distractors first.
