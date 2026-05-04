# Module 5 — Context Management & Reliability

> **Domain weight: 15%.**
> Estimated effort: ~2 hrs reading + 1 hr exercise.

---

## Why this domain matters

Context is a finite, attention-degraded resource. Long contexts lose information in the middle. Self-review is unreliable. LLM self-confidence is not a signal. The exam tests whether you know **which mechanism enforces which guarantee** — and the wrong answers consistently propose "tell the model to be more careful" when the right answer is "constrain the model with code".

---

## Learning objectives

- Apply the **independent Claude instance** review pattern (vs. self-review).
- Recognize **lost-in-the-middle** and design around it.
- Choose escalation triggers based on **structured business signals**, not LLM self-confidence.
- Use **hooks** for deterministic enforcement and **prompt instructions** only for soft preferences.
- Apply **compaction**, **note-taking**, and **multi-agent isolation** as context-management strategies.

---

## Lost-in-the-middle

LLMs attend most strongly to the **start** and **end** of long contexts. Information in the middle is more likely to be ignored. This is a real, measured effect — not a theoretical concern.

### Mitigation

| Strategy | What it does |
|---|---|
| **Place critical info at start or end** | Order matters; put the most important constraints at the boundaries |
| **Chunk long inputs** | Run multiple passes over chunks rather than one giant context |
| **Use structured anchors** | XML tags, headers, and explicit references help the model navigate |
| **Don't rely on bigger context windows** | A 1M-token window doesn't fix attention dilution — it makes it worse |

> **Exam framing:** if a question proposes "use a larger context window to fit everything", that's almost always wrong. The right answer is some form of decomposition — chunking, multi-agent isolation, retrieval.

---

## Independent-instance review

> **Self-review fails.** A Claude instance that just produced output is biased toward defending it. Spin up a **fresh instance** to review.

| Pattern | Description |
|---|---|
| **Self-review** | Same agent reviews its own output. ❌ Unreliable. |
| **Independent-instance review** | Fresh Claude instance with no prior context reviews the work. ✅ The right pattern. |
| **Per-file + integration pass** | For large reviews, review each file separately (fresh instance per file), then run a cross-file integration pass. |

### Why extended thinking is not a substitute

Extended thinking lets the model reason longer, but it's the same instance with the same biases. **Treat extended thinking traces as helpful, not load-bearing.** Don't trust them for production decisions.

---

## Escalation triggers

The exam loves this distinction:

| Signal type | Reliable? | Examples |
|---|---|---|
| **Structured business signal** | ✅ Yes | Refund > $500, missing required field, tool failure category = `permission` |
| **LLM self-confidence** | ❌ No | "Ask the agent if it's confident; if not, escalate" |

```ts
// ❌ BAD — model self-confidence as routing signal
if (response.includes("I'm not sure")) escalate();

// ✅ GOOD — structured business signals
if (refundAmount > REFUND_LIMIT) escalate("refund_over_limit");
if (toolError?.errorCategory === "business") escalate(toolError.message);
if (!extractedFields.customerId) escalate("missing_customer_id");
```

---

## Hooks (deterministic) vs. prompts (probabilistic)

| Mechanism | Guarantee | Use for |
|---|---|---|
| **Hook** | **Deterministic** — code runs, decision is binary | Refund caps, `.env` writes, destructive commands, compliance |
| **Prompt instruction** | **Probabilistic** — model usually follows | Style, tone, soft preferences, formatting |

```bash
# Hook example: block any refund > $500
#!/usr/bin/env bash
INPUT=$(cat)
AMOUNT=$(echo "$INPUT" | jq -r '.amount')

if (( $(echo "$AMOUNT > 500" | bc -l) )); then
  echo "Refunds over \$500 require human approval." >&2
  exit 1
fi
exit 0
```

> **Exam trap:** "Add 'never refund more than $500' to the system prompt" is wrong. The model will sometimes ignore it. Use a hook.

---

## Three context-management strategies

From Anthropic's *Effective Context Engineering for AI Agents*:

### 1. Compaction
Periodically summarize older turns so the conversation fits in the context budget. The summary replaces the raw turns; new work continues from there.

### 2. Note-taking (memory tool)
Persist intermediate results to external storage (a file, a database, a memory tool). Load on demand. Useful for long-running agents that produce structured artifacts.

### 3. Multi-agent isolation
Each subagent gets a fresh context with only what's passed in. This *is* the strategy — context isolation isn't a side effect, it's the point.

---

## Reading queue

1. [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — read fully
2. Skilljar — *AI Capabilities and Limitations* (calibration, refusal, honest "unclear")
3. [Claude Code hooks](https://code.claude.com/docs/en/hooks) + [Agent SDK hooks](https://platform.claude.com/docs/en/agent-sdk/hooks)
4. [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — re-skim for context isolation framing

---

## Hands-on exercise

Take the MCP server from Module 4 and add a deterministic guardrail:

1. Add a `transfer_funds(from, to, amount)` tool.
2. Add a `PreToolUse` hook that **blocks any call where `amount > 500`**.
3. Try to convince the agent (via prompt) to bypass it. Confirm the hook wins.
4. Add an *escalation path*: when the hook blocks, the agent should call `request_human_approval(reason)` instead. This is **structured escalation** in action.

```bash
# .claude/hooks/pre-tool-transfer-funds.sh
#!/usr/bin/env bash
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name')

if [[ "$TOOL" != "transfer_funds" ]]; then exit 0; fi

AMOUNT=$(echo "$INPUT" | jq -r '.tool_input.amount')

if (( $(echo "$AMOUNT > 500" | bc -l) )); then
  cat <<EOF
{
  "block": true,
  "message": "Transfer over \$500 requires human approval. Call request_human_approval(reason) instead."
}
EOF
  exit 0
fi

exit 0
```

---

## Self-check

- [ ] I know why self-review fails and what replaces it.
- [ ] I default critical info to the start or end of long contexts.
- [ ] I never use LLM self-confidence as an escalation trigger.
- [ ] I use hooks for compliance, prompts for style.
- [ ] I can describe compaction vs. note-taking vs. multi-agent isolation.
- [ ] I treat extended thinking traces as helpful but not load-bearing.

---

## Exam traps to reject

| Tempting wrong answer | Why it's wrong |
|---|---|
| "Ask the agent 'are you confident?' — if yes, proceed" | Self-confidence is not a reliable signal |
| "Add 'never refund more than $500' to the system prompt" | Probabilistic — use a hook |
| "Use a 1M-token context to fit everything" | Attention dilutes; lost-in-the-middle worsens |
| "Have the agent review its own output via extended thinking" | Self-review is biased; use a fresh instance |
| "Trust extended thinking traces for production decisions" | They're not load-bearing |
| "Return empty results when a subagent fails" | Return structured error so the coordinator can decide |

---

## When in doubt — the five-question filter

When a question feels ambiguous, prefer the answer that:

1. **Isolates context** (subagents, fresh instances)
2. **Returns structured errors** (categories, retryable flags)
3. **Uses deterministic mechanisms** (hooks, schema enums) for compliance
4. **Keeps tools minimal and well-described**
5. **Escalates on structured business signals**, not model self-confidence

---

## Quick reference

| Need | Mechanism |
|---|---|
| Hard rule, must not be bypassed | Hook |
| Soft preference / style | Prompt instruction |
| Catch a destructive operation | `PreToolUse` hook |
| Audit trail | `PostToolUse` hook |
| Reliable code review | Independent Claude instance |
| Long input doesn't fit | Chunking + multi-pass, not bigger context |
| Persist intermediate state | Note-taking / memory tool |
| Free up context budget | Compaction |
| Avoid attention dilution across tasks | Multi-agent isolation |
