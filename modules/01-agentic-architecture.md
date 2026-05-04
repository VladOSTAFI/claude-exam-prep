# Module 1 — Agentic Architecture & Orchestration

> **Domain weight: 27% — the single highest-leverage section of the exam.**
> Estimated effort: ~3.5 hrs reading + 1.5 hrs hands-on.

---

## Why this domain dominates

Almost half of the exam logic flows from two Anthropic essays: *Building Effective Agents* (Dec 2024) and *How we built our multi-agent research system* (Jun 2025). If you internalize those, you can reason your way through most Domain 1 questions even if the wording is unfamiliar.

The exam tests whether you can **pick the right pattern** for a scenario, **defend the cost trade-offs**, and **reject anti-patterns that look like good engineering**.

---

## Learning objectives

- Articulate **agents vs. workflows** in one sentence and pick the right one per scenario.
- Choose correctly between the 5 canonical patterns: **prompt chaining, routing, parallelization (sectioning + voting), orchestrator-workers, evaluator-optimizer**.
- Design a hub-and-spoke multi-agent system with proper context isolation.
- Choose between session **resume**, **fork**, and **fresh start**.
- Justify the multi-agent token cost (~15× chat) trade-off.

---

## Agents vs. workflows — the foundational distinction

> *"Workflows are systems where LLMs and tools are orchestrated through predefined code paths. Agents, on the other hand, are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks."* — Anthropic, *Building Effective Agents*

| | Workflow | Agent |
|---|---|---|
| Control flow | Hard-coded by you | Decided by the LLM |
| Predictability | High | Lower |
| Cost | Lower | Higher |
| When to use | Paths are known and stable | Paths are unknown / require dynamic reasoning |

**Default to workflows.** Reach for an agent only when the task genuinely requires the model to choose its own path.

---

## The 5 patterns

### 1. Prompt chaining
Decompose a task into a sequence of LLM calls where each step's output feeds the next. Add programmatic checks ("gates") between steps.

```
[Input] → LLM Call 1 → Gate → LLM Call 2 → Gate → [Output]
```

**Use when:** the task cleanly decomposes into fixed sub-steps (e.g., outline → draft → edit).

### 2. Routing
Classify the input, then dispatch to a specialized prompt or model.

```
[Input] → Classifier → ┬→ Customer service prompt
                       ├→ Refund prompt
                       └→ Technical prompt
```

**Use when:** distinct categories benefit from different handling. Don't conflate with `tool_use`.

### 3. Parallelization
Two flavors:

- **Sectioning** — split independent subtasks across concurrent calls (e.g., 3 agents reviewing 3 different files).
- **Voting** — run the same task multiple times and aggregate (e.g., 3-of-5 majority on a classification).

**Use when:** subtasks are independent, or you need diversity / confidence.

### 4. Orchestrator-workers
A coordinator decomposes the task, dispatches to workers in isolated contexts, then synthesizes the results.

```
                 ┌→ Worker 1
[Input] → Orchestrator ├→ Worker 2 ─→ Synthesizer → [Output]
                 └→ Worker 3
```

**Use when:** subtasks aren't known up front (the orchestrator decides at runtime).

### 5. Evaluator-optimizer
Generator produces output; critic evaluates; generator revises. Loop until acceptable.

```
[Input] → Generator → Output → Evaluator ─┬→ Accept → [Output]
              ↑                            └→ Reject → revise
              └────── feedback ────────────┘
```

**Use when:** "good" is verifiable (tests, schema validation, evaluation rubric).

---

## The agent loop

The fundamental pattern any agent runs:

```
while (response.stop_reason !== "end_turn") {
  if (response.stop_reason === "tool_use") {
    const toolResults = await executeTools(response.content);
    response = await claude.messages.create({
      messages: [...history, ...toolResults],
      tools,
    });
  }
}
```

**Critical rules:**

- **Loop on `stop_reason === "end_turn"`** — never on text content.
- Never parse the model's text for completion signals like "I'm done" or "Final answer:". The model lies.
- `max_iterations` is a **safety net**, not a primary stop condition.
- The four `stop_reason` values: `end_turn`, `tool_use`, `max_tokens`, `stop_sequence`.

---

## Multi-agent: hub-and-spoke

| Concept | What you must know |
|---|---|
| **Coordinator** | Single entry point. Decomposes the task and dispatches subagents. |
| **Subagents** | Run in **isolated contexts**. Cannot see the coordinator's earlier messages or other subagents' work. |
| **Context isolation** | Subagents only know what's passed in their prompt. This is a feature, not a limitation — it's how you avoid attention dilution. |
| **`Task` tool** | The Agent SDK primitive that spawns a subagent. Must be in the coordinator's `allowedTools`. |
| **Parallelism** | Multiple `Task` calls in **one assistant turn** run in parallel. |
| **Synthesis** | The coordinator collects subagent outputs and produces the final answer. |

### The token-cost trade-off

From Anthropic's research:
- A multi-agent system with **Opus 4 lead + Sonnet 4 subagents** beat a single Opus 4 by **+90.2%** on their internal research eval.
- **Token usage alone explains ~80% of performance variance** on BrowseComp.
- Multi-agent uses **~15× more tokens** than typical chat. Single agents use **~4× more** than chat.

**Exam framing:** the cost is high but justifiable when (a) subtasks are parallelizable, (b) context isolation prevents attention dilution, and (c) the task value > token cost. Not justified for simple lookups.

---

## Sessions: resume vs. fork vs. fresh

| Mode | Behavior | Use when |
|---|---|---|
| `--resume <id>` | Continue a named session with full prior context | User comes back to a paused conversation |
| `fork_session` | Branch from shared parent context into a new track | Exploring an alternative path without polluting the main session |
| Fresh start | New context, no shared state | Subagents that should reason from scratch with only what you pass them |

---

## Reading queue

1. [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) — the canonical patterns essay. Take notes per pattern.
2. [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — focus on lead/sub-agent prompting, parallel tool calls, the +90.2% number, and the "token usage explains 80% of variance" finding.
3. [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview), [Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents), [Sessions](https://platform.claude.com/docs/en/agent-sdk/sessions) — the actual API surface.
4. [Skilljar — Introduction to subagents](https://anthropic.skilljar.com/introduction-to-subagents) — the single most exam-aligned course.
5. [Cookbook `patterns/agents`](https://github.com/anthropics/anthropic-cookbook) — run the orchestrator-workers and evaluator-optimizer notebooks.

---

## Hands-on exercise

Build a **2-level orchestrator** in TypeScript using the Agent SDK:

```ts
// Pseudocode sketch
const coordinator = createAgent({
  model: "claude-opus-4-6",
  allowedTools: ["Task"],
  systemPrompt: "You coordinate research across GitHub and npm.",
});

// Coordinator spawns parallel subagents
await coordinator.run({
  prompt: "Research the state of OAuth libraries in 2026.",
  agents: {
    github_researcher: { tools: ["search_github"], systemPrompt: "..." },
    npm_researcher:    { tools: ["search_npm"],    systemPrompt: "..." },
  },
});
```

**Requirements:**
- Coordinator dispatches 2 parallel subagents via `Task` (no tool overlap).
- Each subagent has its own tool list.
- Coordinator synthesizes results into a final answer.
- Add a third subagent that runs *after* the first two complete (sequential after parallel).

---

## Self-check

- [ ] I can sketch on a whiteboard when to choose orchestrator-workers vs. evaluator-optimizer.
- [ ] I know `Task` requires being in `allowedTools` of the coordinator.
- [ ] I can explain why a subagent cannot see the coordinator's earlier messages.
- [ ] I know the difference between `fork_session` and `--resume`.
- [ ] I can defend the 15× token cost in a customer conversation.
- [ ] I can name and pick between the 5 patterns from a scenario description.
- [ ] The only reliable agent-loop completion signal is `stop_reason === "end_turn"`.

---

## Exam traps to reject

| Tempting wrong answer | Why it's wrong |
|---|---|
| "Raise `max_iterations` to 100 to handle complex tasks" | Use proper stop conditions; iterations are a safety net |
| "Give every subagent access to all tools for flexibility" | Isolation is the point — narrow tools per subagent |
| "Use a single agent with a very long context to avoid coordination overhead" | Lost-in-the-middle dilutes attention; parallelism wins |
| "Trust the LLM's text output ('I'm done now') as the completion signal" | Use `stop_reason` only; text is not load-bearing |
| "Run multi-agent for everything to maximize quality" | 15× tokens is not justified for simple lookups |
| "Have subagents read the coordinator's full message history" | Breaks isolation, dilutes attention, increases cost |

---

## Quick decision matrix

| Scenario hint | Pattern |
|---|---|
| Independent subtasks, results combined | **Parallelization — sectioning** |
| Same task, want confidence | **Parallelization — voting** |
| Need to classify before processing | **Routing** |
| Subtasks unknown until runtime | **Orchestrator-workers** |
| Output quality is verifiable | **Evaluator-optimizer** |
| Fixed sequential pipeline | **Prompt chaining** |
