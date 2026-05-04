# Module 7 — Cross-Module Reference & Anti-Patterns

> **The print-it-and-bring-it cheat sheet.**
> Use this for last-mile review and as a decision aid during scenario practice.

---

## Decision matrix — pick the right primitive

| If the scenario is about… | Anchor primitive |
|---|---|
| Customer support agent making decisions | Subagents + structured escalation + hooks for refund caps |
| Code generation in Claude Code | CLAUDE.md hierarchy + skills with `context: fork` + plan mode |
| Multi-agent research | Orchestrator-workers + parallel `Task` + token cost justification |
| Developer productivity | Skills + slash commands + MCP servers |
| CI/CD with Claude Code | `claude -p` + `--output-format json` + GitHub Actions |
| Structured data extraction | `tool_choice: specific tool` + enum w/ `"other"` + retry-on-validation-error |
| Anything retrieval-heavy | Contextual Embeddings + BM25 + (optional) rerank + citations |

---

## Anti-pattern blacklist — memorize

These are the wrong-but-tempting answers the exam plants:

- ❌ Raising `max_iterations` to fix a stuck agent
- ❌ Giving an agent every available tool ("for flexibility")
- ❌ Using few-shot to enforce ordering or compliance
- ❌ Trusting LLM self-confidence for escalation
- ❌ Self-review with the same instance
- ❌ `console.log` on stdio MCP servers
- ❌ Returning empty results on subagent failure
- ❌ Routing blocking workflows to Batch API (no SLA)
- ❌ SSE transport on a new MCP server (deprecated)
- ❌ Two tools called `search` without namespacing
- ❌ Required-everywhere schemas (forces hallucination)
- ❌ Plain-string error messages from tools
- ❌ Putting compliance rules in the system prompt instead of a hook
- ❌ Using a 1M-token context "to fit everything"
- ❌ Skipping prompt caching on contextualization passes

---

## Five-question filter (when in doubt)

When a question feels ambiguous, prefer the answer that:

1. **Isolates context** (subagents, fresh instances, fork)
2. **Returns structured errors** (categories, retryable flags)
3. **Uses deterministic mechanisms** (hooks, schema enums) for compliance
4. **Keeps tools minimal and well-described**
5. **Escalates on structured business signals**, not model self-confidence

---

## Numbers worth memorizing

| Value | Meaning |
|---|---|
| **+90.2%** | Multi-agent (Opus 4 lead + Sonnet 4 sub) vs. single Opus 4 on internal research eval |
| **~80%** | Variance in BrowseComp explained by token usage alone |
| **~15×** | Token cost of multi-agent vs. baseline chat |
| **~4×** | Token cost of single agent vs. baseline chat |
| **5.7% → 3.7% (−35%)** | Contextual Embeddings retrieval failure reduction |
| **5.7% → 2.9% (−49%)** | + Contextual BM25 |
| **5.7% → 1.9% (−67%)** | + Reranking |
| **50%** | Batch API discount on input AND output (no SLA) |
| **~10%** | Prompt cache read price vs. input price |
| **1.25× / 2×** | Prompt cache write multiplier (5m / 1h TTL) |
| **4** | Max prompt cache breakpoints |
| **< 200 lines** | Recommended max for a single CLAUDE.md file |
| **2025-03-26** | MCP spec version that replaced SSE with Streamable HTTP |
| **v1.10.0 (Apr 17, 2025)** | TS SDK version that added Streamable HTTP support |

---

## Model selection

| Model | When |
|---|---|
| **Claude Opus 4.5 / 4.6** | Hardest reasoning, long-horizon agents, multi-agent lead |
| **Claude Sonnet 4.5 / 4.6** | Default for production; balanced cost/quality |
| **Claude Haiku 4.5** | High-volume, latency-sensitive, sub-tasks (e.g., contextualization) |

Common patterns:
- **Lead = Opus, Subagents = Sonnet** for multi-agent research
- **Contextualization = Haiku** (with prompt caching) for RAG
- **Default everything to Sonnet** unless you have a reason

---

## `tool_choice` cheat sheet

| Need | Setting |
|---|---|
| General assistant; model decides | `{ type: "auto" }` |
| Force any tool call | `{ type: "any" }` |
| Force specific tool (structured output) | `{ type: "tool", name: "X" }` |
| Forbid tool use | `{ type: "none" }` |

---

## `stop_reason` cheat sheet

| Value | Meaning | Action |
|---|---|---|
| `end_turn` | Done | Return result |
| `tool_use` | Tool call requested | Execute, append result, continue |
| `max_tokens` | Truncated | **Failure** — retry or chunk |
| `stop_sequence` | Custom stop hit | Per design |

---

## CLAUDE.md memory hierarchy (top = highest precedence)

1. Managed Policy (enterprise)
2. Managed Drop-ins (enterprise)
3. Project Memory — `CLAUDE.md`
4. Project Rules — `.claude/rules/*.md`
5. User Memory — `~/.claude/CLAUDE.md`
6. User Rules — `~/.claude/rules/*.md`
7. Local Project Memory — `CLAUDE.local.md` (gitignored)
8. Auto Memory

---

## MCP error categories

| Category | Retryable? | Action |
|---|---|---|
| `transient` | ✅ Yes (with backoff) | Retry |
| `validation` | Sometimes | Retry after correction |
| `business` | ❌ No | Escalate |
| `permission` | ❌ No | Escalate |

---

## Hooks vs. prompts

| Concern | Mechanism |
|---|---|
| Compliance, security, destructive ops | **Hook** (deterministic) |
| Style, tone, soft preferences | **Prompt instruction** (probabilistic) |

If a rule **must** be enforced, a hook is the only correct answer.

---

## Day-of-exam tips

1. **Sleep > cramming.** The exam tests judgment, not recall.
2. **Read the scenario header once, deeply.** All 10–15 questions in that scenario share context.
3. **First pass:** answer everything you're sure of in <60s; flag the rest.
4. **120 min / 60 questions = 2 min each.** Don't dwell.
5. **No guessing penalty** — never leave a question blank.
6. **Eliminate "sounds smart but wrong" first** — those are deliberately planted.
7. Check the answer review screen before submitting.

---

## Final pre-flight checklist

- [ ] I can recite the 5 patterns (chaining, routing, parallelization × 2, orchestrator-workers, evaluator-optimizer).
- [ ] I can name the agent loop completion signal (`stop_reason === "end_turn"`).
- [ ] I can recite the CLAUDE.md hierarchy.
- [ ] I can pick `tool_choice` correctly per scenario.
- [ ] I never `console.log` from a stdio MCP server.
- [ ] I quote the contextual retrieval numbers (5.7 → 3.7 → 2.9 → 1.9).
- [ ] I prefer hooks over prompts for compliance.
- [ ] I use independent instances for review.
- [ ] I escalate on structured business signals, not LLM self-confidence.
- [ ] I default to workflows, reach for agents only when paths are unknown.

---

## Module index

| # | Module | Domain weight |
|---|---|---|
| [00](./00-exam-overview.md) | Exam overview | — |
| [01](./01-agentic-architecture.md) | Agentic Architecture & Orchestration | 27% |
| [02](./02-claude-code-configuration.md) | Claude Code Configuration & Workflows | 20% |
| [03](./03-prompt-engineering.md) | Prompt Engineering & Structured Output | 20% |
| [04](./04-tool-design-mcp.md) | Tool Design & MCP Integration | 18% |
| [05](./05-context-management.md) | Context Management & Reliability | 15% |
| [06](./06-rag-with-claude.md) | RAG with Claude (Contextual Retrieval) | Cross-cutting |
| [07](./07-cross-module-reference.md) | Cross-Module Reference & Anti-Patterns | All |
