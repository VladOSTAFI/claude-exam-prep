import type { Quiz } from "@/types/quiz";

const quiz: Quiz = {
  slug: "context-management",
  title: "Context Management & Reliability",
  questions: [
    {
      id: "q1",
      prompt:
        "An agent has just produced a long code refactoring. Your quality gate asks the same agent to review its own output using extended thinking. Why is this insufficient?",
      choices: [
        { id: "a", text: "Extended thinking is too slow for post-generation review in production." },
        { id: "b", text: "The same instance that generated the output is biased toward defending it; a fresh independent instance is required." },
        { id: "c", text: "Extended thinking traces are read-only and cannot be used to drive follow-up actions." },
        { id: "d", text: "Self-review works fine if the model is given a strict rubric — the issue is the rubric quality, not the instance." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module states: 'Self-review fails. A Claude instance that just produced output is biased toward defending it.' Extended thinking doesn't solve this — it's still the same instance with the same biases. The correct pattern is an independent fresh instance with no prior context reviewing the work.",
    },
    {
      id: "q2",
      prompt:
        "A refund automation system must never approve refunds over $500 without human sign-off. A developer proposes adding this rule to the system prompt. What is wrong with this approach?",
      choices: [
        { id: "a", text: "System prompts cannot include numeric conditions — use a policy file instead." },
        { id: "b", text: "The system prompt is visible to users via prompt injection, exposing the limit." },
        { id: "c", text: "Prompt instructions are probabilistic — the model may occasionally violate them. Use a deterministic hook instead." },
        { id: "d", text: "System prompt rules apply only to the first turn; the model may ignore them in later turns." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module draws a bright line: hooks are deterministic (code executes, the decision is binary), while prompt instructions are probabilistic. For a compliance rule that 'must not be bypassed,' a PreToolUse hook that exits non-zero is the only correct mechanism.",
    },
    {
      id: "q3",
      prompt:
        "You need to process a 500-page legal document that is too large for a single context window. Which approach does the module recommend?",
      choices: [
        { id: "a", text: "Use a model with a 1M-token context window — context size limits are no longer a practical concern." },
        { id: "b", text: "Chunking with multi-pass analysis — run multiple passes over chunks rather than one giant context." },
        { id: "c", text: "Summarize the document externally before sending it, even if precision is lost." },
        { id: "d", text: "Ask the model to focus on the most relevant sections by adding those sections last in the context." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module explicitly warns: 'Don't rely on bigger context windows — a 1M-token window doesn't fix attention dilution, it makes it worse.' Chunking with multi-pass analysis is the recommended mitigation for the lost-in-the-middle problem.",
    },
    {
      id: "q4",
      prompt:
        "Which of the following is a reliable escalation trigger in an agentic system?",
      choices: [
        { id: "a", text: "The agent's response text contains phrases like 'I am not certain' or 'I may be wrong'." },
        { id: "b", text: "The agent's confidence score (from its self-assessment tool) drops below 0.7." },
        { id: "c", text: "A `transfer_funds` tool call has an `amount` field exceeding the $500 business limit." },
        { id: "d", text: "The agent has made more than 5 tool calls without producing a final answer." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's escalation trigger rule: use structured business signals, not LLM self-confidence. `amount > $500` is a deterministic, code-checkable condition. Self-reported confidence ('I'm not sure') is explicitly flagged as an unreliable signal in the module.",
    },
    {
      id: "q5",
      prompt:
        "A long-running agent is accumulating a large conversation history that risks hitting the context limit. Which context-management strategy periodically replaces older turns with a summary?",
      choices: [
        { id: "a", text: "Multi-agent isolation — spin up a new agent that starts from scratch with a briefing." },
        { id: "b", text: "Compaction — periodically summarize older turns so the conversation fits in the context budget." },
        { id: "c", text: "Note-taking — persist intermediate results to external storage and load on demand." },
        { id: "d", text: "RAG retrieval — retrieve only the most relevant past turns for each new request." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module defines three context-management strategies: compaction (replace old turns with a summary), note-taking (persist to external storage), and multi-agent isolation (fresh context per subagent). Compaction is specifically the technique that replaces accumulated turns with a rolling summary.",
    },
    {
      id: "q6",
      prompt:
        "Where in a long context window does the module say information is most likely to be ignored by the model?",
      choices: [
        { id: "a", text: "At the very start, because system instructions saturate attention." },
        { id: "b", text: "At the very end, because the model has already committed to a plan." },
        { id: "c", text: "In the middle, because LLMs attend most strongly to the start and end." },
        { id: "d", text: "Anywhere — token position has no measurable effect on attention." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module describes the lost-in-the-middle effect: 'LLMs attend most strongly to the start and end of long contexts. Information in the middle is more likely to be ignored.' This is described as a real, measured effect — not theoretical.",
    },
    {
      id: "q7",
      prompt:
        "A research agent produces structured artifacts (transcripts, citations, extracted tables) over a multi-hour run. The team wants intermediate results to survive across sessions and be loaded on demand. Which strategy fits best?",
      choices: [
        { id: "a", text: "Compaction — summarize older turns into the context window each time." },
        { id: "b", text: "Note-taking — persist intermediate results to external storage and load on demand." },
        { id: "c", text: "Extended thinking — let the model carry richer state in its reasoning trace." },
        { id: "d", text: "Larger context window — keep all artifacts inline so nothing is lost." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module describes note-taking (memory tool) as: 'Persist intermediate results to external storage (a file, a database, a memory tool). Load on demand. Useful for long-running agents that produce structured artifacts.' That matches this scenario exactly.",
    },
    {
      id: "q8",
      prompt:
        "A coordinator agent dispatches three subagents in parallel for independent research tasks. According to the module, what role does context isolation play here?",
      choices: [
        { id: "a", text: "It is an unfortunate side effect — ideally subagents would share full context." },
        { id: "b", text: "It is the point of multi-agent design — each subagent gets a fresh context with only what's passed in." },
        { id: "c", text: "It is unnecessary if subagents are spawned from the same parent — they inherit context automatically." },
        { id: "d", text: "It only applies to read-only subagents; write-capable subagents must share context to stay coherent." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module is emphatic: 'Each subagent gets a fresh context with only what's passed in. This *is* the strategy — context isolation isn't a side effect, it's the point.'",
    },
    {
      id: "q9",
      prompt:
        "Which of the following is correctly handled by a PreToolUse hook rather than a prompt instruction?",
      choices: [
        { id: "a", text: "Preferring concise responses over verbose ones." },
        { id: "b", text: "Asking the model to format code blocks with language tags." },
        { id: "c", text: "Blocking destructive shell commands or writes to .env files." },
        { id: "d", text: "Requesting that the agent address the user by name." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's quick reference: hooks are for hard rules that must not be bypassed (refund caps, .env writes, destructive commands, compliance). Prompt instructions handle style, tone, and soft preferences.",
    },
    {
      id: "q10",
      prompt:
        "Reviewing a 40-file pull request, which review pattern does the module endorse?",
      choices: [
        { id: "a", text: "One Claude instance reviews all 40 files in a single context for global coherence." },
        { id: "b", text: "The same agent that produced the diff reviews it via extended thinking." },
        { id: "c", text: "Per-file review with a fresh instance per file, then a cross-file integration pass." },
        { id: "d", text: "Skip per-file review and rely on a single self-confidence score from the author agent." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module describes the per-file + integration pattern: 'For large reviews, review each file separately (fresh instance per file), then run a cross-file integration pass.' This combines independent-instance review with decomposition.",
    },
    {
      id: "q11",
      prompt:
        "A teammate argues: 'Extended thinking traces give us a transparent audit log of why the agent decided X — we should branch production logic on those traces.' How should you respond?",
      choices: [
        { id: "a", text: "Agree — chain-of-thought traces are deterministic and a strong production signal." },
        { id: "b", text: "Disagree — treat extended thinking traces as helpful but not load-bearing for production decisions." },
        { id: "c", text: "Agree, but only if the trace is also reviewed by the same agent for consistency." },
        { id: "d", text: "Disagree — extended thinking should be disabled in production to save tokens." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module explicitly says: 'Treat extended thinking traces as helpful, not load-bearing. Don't trust them for production decisions.' It also lists 'Trust extended thinking traces for production decisions' as an exam trap to reject.",
    },
    {
      id: "q12",
      prompt:
        "A developer adds critical safety constraints in the middle of a 100k-token system prompt full of examples. What is the most module-aligned correction?",
      choices: [
        { id: "a", text: "Trust the model to find them — modern LLMs index the whole prompt evenly." },
        { id: "b", text: "Repeat the same examples three times to reinforce the constraints by frequency." },
        { id: "c", text: "Move the critical constraints to the start or end of the prompt and use structured anchors like XML tags." },
        { id: "d", text: "Switch to a 1M-token model so attention has more room to spread across the prompt." },
      ],
      correctChoiceId: "c",
      explanation:
        "Module mitigations for lost-in-the-middle include placing critical info at start or end, and using structured anchors (XML tags, headers, explicit references) to help the model navigate. A bigger context window is explicitly the wrong move.",
    },
    {
      id: "q13",
      prompt:
        "A subagent fails midway through a research task. The coordinator gets back nothing. According to the module's exam traps, what should the subagent return instead?",
      choices: [
        { id: "a", text: "An empty result — the coordinator should infer the failure from missing data." },
        { id: "b", text: "A polite natural-language apology so the coordinator can re-prompt." },
        { id: "c", text: "A structured error so the coordinator can decide how to handle it." },
        { id: "d", text: "Nothing — silently retry until success or timeout." },
      ],
      correctChoiceId: "c",
      explanation:
        "The exam-traps table lists 'Return empty results when a subagent fails' as wrong; the right behavior is to 'Return structured error so the coordinator can decide.' This aligns with the broader principle of structured business signals.",
    },
    {
      id: "q14",
      prompt:
        "Which mechanism does the module recommend for producing an audit trail of tool invocations?",
      choices: [
        { id: "a", text: "A PreToolUse hook that prints to stdout before the tool runs." },
        { id: "b", text: "A PostToolUse hook that records the call after it completes." },
        { id: "c", text: "A system-prompt instruction asking the agent to log every tool call." },
        { id: "d", text: "Extended thinking, since the trace already documents the agent's reasoning." },
      ],
      correctChoiceId: "b",
      explanation:
        "The quick-reference table maps 'Audit trail' to a PostToolUse hook, while 'Catch a destructive operation' maps to PreToolUse. Audit means after-the-fact recording, which is PostToolUse.",
    },
    {
      id: "q15",
      prompt:
        "An ambiguous exam question asks how to enforce a compliance rule. Per the module's five-question filter, which answer should you prefer?",
      choices: [
        { id: "a", text: "The answer that asks the model to be more careful via the system prompt." },
        { id: "b", text: "The answer that uses a deterministic mechanism such as a hook or schema enum." },
        { id: "c", text: "The answer that increases the context window to fit the policy text." },
        { id: "d", text: "The answer that has the agent self-review using extended thinking." },
      ],
      correctChoiceId: "b",
      explanation:
        "The five-question filter prefers answers that use deterministic mechanisms (hooks, schema enums) for compliance, isolate context, return structured errors, keep tools minimal, and escalate on structured business signals — not model self-confidence.",
    },
    {
      id: "q16",
      prompt:
        "A team writes: `if (response.includes(\"I'm not sure\")) escalate();`. Why does the module call this an anti-pattern?",
      choices: [
        { id: "a", text: "String matching is locale-sensitive and fails for non-English responses." },
        { id: "b", text: "It uses LLM self-confidence as a routing signal, which is unreliable; structured business signals are the right mechanism." },
        { id: "c", text: "Substring checks are O(n) and slow at production scale." },
        { id: "d", text: "The model rarely emits 'I'm not sure' — escalation will almost never fire." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's code snippet flags this exact pattern as bad: model self-confidence as a routing signal. The good pattern checks structured signals like `refundAmount > REFUND_LIMIT` or `toolError.errorCategory === 'business'`.",
    },
    {
      id: "q17",
      prompt:
        "In the hands-on exercise, when a `transfer_funds` call exceeds $500 the PreToolUse hook blocks it. What is the agent expected to do next, per the exercise?",
      choices: [
        { id: "a", text: "Retry the same call up to three times — the hook is sometimes flaky." },
        { id: "b", text: "Lower the amount silently and re-issue the call to satisfy the hook." },
        { id: "c", text: "Call `request_human_approval(reason)` — a structured escalation path." },
        { id: "d", text: "Return an empty response so the user can decide what to do." },
      ],
      correctChoiceId: "c",
      explanation:
        "The exercise specifies: 'Add an escalation path: when the hook blocks, the agent should call request_human_approval(reason) instead. This is structured escalation in action.'",
    },
    {
      id: "q18",
      prompt:
        "Which statement best captures the module's view on increasing context window size as a reliability strategy?",
      choices: [
        { id: "a", text: "Bigger windows are strictly better — they eliminate the lost-in-the-middle effect." },
        { id: "b", text: "Bigger windows help only when the data fits naturally in chronological order." },
        { id: "c", text: "Bigger windows do not fix attention dilution and can make lost-in-the-middle worse; prefer decomposition." },
        { id: "d", text: "Window size is irrelevant; the only thing that matters is the temperature setting." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module says outright: 'A 1M-token window doesn't fix attention dilution — it makes it worse.' The exam framing prefers decomposition (chunking, multi-agent isolation, retrieval) over a larger window.",
    },
    {
      id: "q19",
      prompt:
        "Which pairing of need and mechanism matches the module's quick-reference table?",
      choices: [
        { id: "a", text: "'Free up context budget' → multi-agent isolation." },
        { id: "b", text: "'Persist intermediate state' → compaction." },
        { id: "c", text: "'Avoid attention dilution across tasks' → multi-agent isolation." },
        { id: "d", text: "'Reliable code review' → extended thinking on the same instance." },
      ],
      correctChoiceId: "c",
      explanation:
        "The quick-reference table maps 'Avoid attention dilution across tasks' to multi-agent isolation. 'Free up context budget' is compaction, 'Persist intermediate state' is note-taking, and 'Reliable code review' is an independent Claude instance.",
    },
    {
      id: "q20",
      prompt:
        "Which pair correctly matches a guarantee type to the right mechanism, per the module?",
      choices: [
        { id: "a", text: "Deterministic guarantee → prompt instruction; probabilistic guarantee → hook." },
        { id: "b", text: "Deterministic guarantee → hook; probabilistic guarantee → prompt instruction." },
        { id: "c", text: "Both deterministic and probabilistic guarantees should use prompt instructions for simplicity." },
        { id: "d", text: "Both should use hooks; prompt instructions are deprecated in agentic systems." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's hook-vs-prompt table: hooks are deterministic (code runs, decision is binary) and used for compliance/destructive-command guarantees; prompt instructions are probabilistic and used for style, tone, and soft preferences.",
    },
  ],
};

export default quiz;
