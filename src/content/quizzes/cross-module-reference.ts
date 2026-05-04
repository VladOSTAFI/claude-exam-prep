import type { Quiz } from "@/types/quiz";

const quiz: Quiz = {
  slug: "cross-module-reference",
  title: "Cross-Module Reference & Anti-Patterns",
  questions: [
    {
      id: "q1",
      prompt:
        "According to the cross-module anti-pattern blacklist, which of the following is a wrong-but-tempting answer you should always reject on the exam?",
      choices: [
        { id: "a", text: "Using `tool_choice: { type: 'tool', name: 'X' }` to force structured output." },
        { id: "b", text: "Trusting LLM self-confidence as an escalation trigger ('ask the agent if it's confident; if yes, proceed')." },
        { id: "c", text: "Using a fresh Claude instance for code review." },
        { id: "d", text: "Returning `errorCategory` and `isRetryable` from tool error responses." },
      ],
      correctChoiceId: "b",
      explanation:
        "The anti-pattern blacklist explicitly lists 'Trusting LLM self-confidence for escalation' as a wrong answer. Self-reported confidence is not a reliable signal. The correct pattern is escalation on structured business signals (e.g., amount > threshold, tool error category = 'permission').",
    },
    {
      id: "q2",
      prompt:
        "From the numbers-worth-memorizing table: what percentage of performance variance on BrowseComp is explained by token usage alone in multi-agent systems?",
      choices: [
        { id: "a", text: "~50%" },
        { id: "b", text: "~67%" },
        { id: "c", text: "~80%" },
        { id: "d", text: "~90%" },
      ],
      correctChoiceId: "c",
      explanation:
        "The cross-module reference table lists '~80%' as the variance in BrowseComp explained by token usage alone. This is a key research finding from Anthropic's multi-agent research system post, emphasizing that throwing more tokens (and thus parallelism) at a problem is the primary lever for performance.",
    },
    {
      id: "q3",
      prompt:
        "A customer support scenario requires: routing customer queries to specialized agents, enforcing a $500 refund cap, and generating release notes from git history. Which primitives map to each need, respectively?",
      choices: [
        { id: "a", text: "Routing pattern / system prompt rule / prompt chaining." },
        { id: "b", text: "Routing pattern / PreToolUse hook / skill with `context: fork`." },
        { id: "c", text: "Orchestrator-workers / PostToolUse hook / evaluator-optimizer." },
        { id: "d", text: "Parallelization / CLAUDE.md rule / subagent via `.claude/agents/`." },
      ],
      correctChoiceId: "b",
      explanation:
        "The decision matrix maps: customer support routing → the Routing pattern; refund cap enforcement → a deterministic PreToolUse hook (not a system prompt rule, which is probabilistic); release notes from git history → a skill with `context: fork` and `allowed-tools: [Bash(git log:*)]`.",
    },
    {
      id: "q4",
      prompt:
        "The five-question filter tells you to prefer answers that escalate on structured business signals. Which of the following best exemplifies this principle?",
      choices: [
        { id: "a", text: "If the model output sounds uncertain in wording, flag it for human review." },
        { id: "b", text: "If the model's confidence score self-report is below 0.8, escalate." },
        { id: "c", text: "If a tool returns `errorCategory: 'permission'`, route to human approval regardless of model confidence." },
        { id: "d", text: "If the agent has taken more than 10 turns without resolution, assume it is confused and escalate." },
      ],
      correctChoiceId: "c",
      explanation:
        "The five-question filter item 5 says: 'Escalates on structured business signals, not model self-confidence.' A `permission` error category is a hard, code-verifiable signal. Turn count and self-reported confidence are soft heuristics that can miss cases in both directions.",
    },
    {
      id: "q5",
      prompt:
        "According to the model selection table, which model is recommended for the contextualization step in RAG pipelines (generating per-chunk context summaries)?",
      choices: [
        { id: "a", text: "Claude Opus 4 — highest reasoning quality for accurate context generation." },
        { id: "b", text: "Claude Sonnet 4 — the balanced default for all production tasks." },
        { id: "c", text: "Claude Haiku 4.5 — high-volume, latency-sensitive sub-tasks; use with prompt caching." },
        { id: "d", text: "Any model is equivalent for contextualization; the bottleneck is the embedding model." },
      ],
      correctChoiceId: "c",
      explanation:
        "The cross-module model-selection table lists 'Contextualization = Haiku (with prompt caching) for RAG.' Haiku is used because contextualization is a high-volume operation (one call per chunk) and prompt caching makes it cheap. Opus would be prohibitively expensive per chunk.",
    },
    {
      id: "q6",
      prompt:
        "Per the decision matrix, what is the recommended anchor primitive for a 'multi-agent research' scenario?",
      choices: [
        { id: "a", text: "Prompt chaining with a single Sonnet model." },
        { id: "b", text: "Orchestrator-workers with parallel `Task` and a token-cost justification." },
        { id: "c", text: "Routing pattern with structured escalation hooks." },
        { id: "d", text: "Evaluator-optimizer loop with two Opus instances." },
      ],
      correctChoiceId: "b",
      explanation:
        "The decision matrix maps 'Multi-agent research' to 'Orchestrator-workers + parallel Task + token cost justification.' The token-cost justification is essential because multi-agent costs ~15× the baseline chat per the numbers table.",
    },
    {
      id: "q7",
      prompt:
        "From the numbers-worth-memorizing table, what is the approximate token-cost multiplier for a multi-agent system relative to baseline chat?",
      choices: [
        { id: "a", text: "~2×" },
        { id: "b", text: "~4×" },
        { id: "c", text: "~15×" },
        { id: "d", text: "~50×" },
      ],
      correctChoiceId: "c",
      explanation:
        "The reference table lists '~15×' as the token cost of multi-agent vs. baseline chat, and '~4×' for a single agent vs. baseline. This is why the decision matrix requires a token-cost justification before recommending multi-agent.",
    },
    {
      id: "q8",
      prompt:
        "Which of the following appears on the anti-pattern blacklist for stdio MCP servers?",
      choices: [
        { id: "a", text: "Returning structured error categories like 'transient' or 'business'." },
        { id: "b", text: "Using `console.log` for debugging output on the server." },
        { id: "c", text: "Namespacing tool names to avoid collisions." },
        { id: "d", text: "Implementing a JSON-RPC protocol over stdio." },
      ],
      correctChoiceId: "b",
      explanation:
        "The anti-pattern blacklist explicitly lists '`console.log` on stdio MCP servers' as wrong. stdio MCP servers communicate via stdout, so `console.log` corrupts the JSON-RPC stream. Logging must go to stderr or a file.",
    },
    {
      id: "q9",
      prompt:
        "According to the contextual retrieval numbers in the reference table, what is the failure-rate sequence as you stack improvements onto the baseline embeddings approach?",
      choices: [
        { id: "a", text: "5.7% → 4.5% → 3.2% → 2.0% (with each successive technique)." },
        { id: "b", text: "5.7% → 3.7% → 2.9% → 1.9% (Contextual Embeddings, +BM25, +Reranking)." },
        { id: "c", text: "10% → 7% → 4% → 2% (rounded for simplicity)." },
        { id: "d", text: "5.7% → 2.9% → 1.9% → 0.9% (with Opus reranker added last)." },
      ],
      correctChoiceId: "b",
      explanation:
        "The numbers-worth-memorizing table is explicit: 5.7% baseline → 3.7% with Contextual Embeddings (−35%) → 2.9% with Contextual BM25 (−49%) → 1.9% with Reranking (−67%). Memorizing this sequence is one of the day-of-exam preparation items.",
    },
    {
      id: "q10",
      prompt:
        "On the CLAUDE.md memory hierarchy, which level has the HIGHEST precedence?",
      choices: [
        { id: "a", text: "Project Memory (`CLAUDE.md` at the repo root)." },
        { id: "b", text: "User Memory (`~/.claude/CLAUDE.md`)." },
        { id: "c", text: "Managed Policy (enterprise)." },
        { id: "d", text: "Local Project Memory (`CLAUDE.local.md`, gitignored)." },
      ],
      correctChoiceId: "c",
      explanation:
        "The cross-module hierarchy lists 'Managed Policy (enterprise)' at the top, meaning highest precedence. The order is: Managed Policy → Managed Drop-ins → Project Memory → Project Rules → User Memory → User Rules → Local Project Memory → Auto Memory.",
    },
    {
      id: "q11",
      prompt:
        "A scenario requires structured data extraction with strict schema compliance. Per the decision matrix, which combination is the anchor primitive?",
      choices: [
        { id: "a", text: "`tool_choice: auto` plus a system prompt instruction to follow the schema." },
        { id: "b", text: "`tool_choice: { type: 'tool', name: 'X' }` plus an enum that includes `'other'` plus retry-on-validation-error." },
        { id: "c", text: "`tool_choice: any` with required-everywhere fields to force the model to fill them all." },
        { id: "d", text: "Few-shot prompting with 10+ examples to enforce the schema." },
      ],
      correctChoiceId: "b",
      explanation:
        "The decision matrix maps 'Structured data extraction' to '`tool_choice: specific tool` + enum w/ \"other\" + retry-on-validation-error.' The \"other\" enum option avoids hallucinated values, and required-everywhere schemas appear on the anti-pattern blacklist because they force hallucination.",
    },
    {
      id: "q12",
      prompt:
        "On the `stop_reason` cheat sheet, what does `max_tokens` indicate and what is the correct action?",
      choices: [
        { id: "a", text: "The agent is done; return the result." },
        { id: "b", text: "A custom stop sequence was hit; handle per design." },
        { id: "c", text: "Output was truncated — treat as a failure and retry or chunk." },
        { id: "d", text: "The model wants to call a tool; execute it and continue the loop." },
      ],
      correctChoiceId: "c",
      explanation:
        "The cheat sheet states `max_tokens` means 'Truncated' and the action is 'Failure — retry or chunk.' Treating a truncated response as success is a subtle bug because the JSON or tool call may be incomplete.",
    },
    {
      id: "q13",
      prompt:
        "What is the recommended maximum size for a single CLAUDE.md file according to the numbers-worth-memorizing table?",
      choices: [
        { id: "a", text: "Under 50 lines." },
        { id: "b", text: "Under 200 lines." },
        { id: "c", text: "Under 1,000 lines." },
        { id: "d", text: "There is no recommended limit — bigger is better for context." },
      ],
      correctChoiceId: "b",
      explanation:
        "The reference table lists '< 200 lines' as the recommended max for a single CLAUDE.md file. Larger files dilute attention and bleed unrelated context into every session; the right pattern is to split into `.claude/rules/*.md` files.",
    },
    {
      id: "q14",
      prompt:
        "When must you choose a hook instead of a system prompt instruction, per the 'Hooks vs. prompts' table?",
      choices: [
        { id: "a", text: "When you want to set the assistant's tone or writing style." },
        { id: "b", text: "When the rule is a soft preference that should usually but not always apply." },
        { id: "c", text: "When the rule concerns compliance, security, or destructive operations and MUST be enforced." },
        { id: "d", text: "Never — hooks are deprecated in favor of CLAUDE.md instructions." },
      ],
      correctChoiceId: "c",
      explanation:
        "The cross-module table is unambiguous: 'Compliance, security, destructive ops → Hook (deterministic).' If a rule MUST be enforced, a hook is the only correct answer. Prompts are probabilistic and inappropriate for hard requirements.",
    },
    {
      id: "q15",
      prompt:
        "According to the `tool_choice` cheat sheet, which setting forces the model to call any tool (but not a specific one)?",
      choices: [
        { id: "a", text: "`{ type: 'auto' }`" },
        { id: "b", text: "`{ type: 'any' }`" },
        { id: "c", text: "`{ type: 'tool', name: 'X' }`" },
        { id: "d", text: "`{ type: 'none' }`" },
      ],
      correctChoiceId: "b",
      explanation:
        "The `tool_choice` cheat sheet maps 'Force any tool call' → `{ type: 'any' }`. `auto` lets the model decide, `tool` forces a specific named tool (used for structured output), and `none` forbids tool use entirely.",
    },
    {
      id: "q16",
      prompt:
        "Per the model-selection guidance for multi-agent research, what is the recommended split between the lead and subagents?",
      choices: [
        { id: "a", text: "Lead = Sonnet, Subagents = Haiku — minimize cost." },
        { id: "b", text: "Lead = Opus, Subagents = Sonnet — Opus orchestrates, Sonnet executes." },
        { id: "c", text: "Lead = Haiku, Subagents = Opus — fast routing to powerful workers." },
        { id: "d", text: "All Opus — never compromise reasoning quality." },
      ],
      correctChoiceId: "b",
      explanation:
        "The cross-module model-selection notes state: 'Lead = Opus, Subagents = Sonnet for multi-agent research.' Opus handles the harder orchestration reasoning while Sonnet handles the parallel sub-tasks at lower cost.",
    },
    {
      id: "q17",
      prompt:
        "Which item is the day-of-exam tips section explicit about?",
      choices: [
        { id: "a", text: "Leave a question blank if you don't know — there is a guessing penalty." },
        { id: "b", text: "Spend extra time on each scenario header for every question in it." },
        { id: "c", text: "There is no guessing penalty — never leave a question blank." },
        { id: "d", text: "Skip the answer review screen to save time before submitting." },
      ],
      correctChoiceId: "c",
      explanation:
        "The day-of-exam tips include 'No guessing penalty — never leave a question blank.' The same section also recommends reading the scenario header once deeply (since it's shared across 10–15 questions) and checking the answer review screen before submitting.",
    },
    {
      id: "q18",
      prompt:
        "An MCP tool returns an error categorized as `business`. Per the MCP error categories table, what is the correct response?",
      choices: [
        { id: "a", text: "Retry with exponential backoff — `business` errors are transient." },
        { id: "b", text: "Retry after correcting the input — same as `validation` errors." },
        { id: "c", text: "Escalate — `business` errors are not retryable." },
        { id: "d", text: "Silently swallow the error and return an empty result to the agent." },
      ],
      correctChoiceId: "c",
      explanation:
        "The MCP error categories table shows `business` is not retryable and the action is 'Escalate.' Only `transient` is straightforwardly retryable; `validation` is sometimes retryable after correction; and the blacklist explicitly forbids returning empty results on subagent failure.",
    },
    {
      id: "q19",
      prompt:
        "Which of these is on the anti-pattern blacklist as a wrong way to 'fix' a stuck agent?",
      choices: [
        { id: "a", text: "Adding structured business-signal escalation." },
        { id: "b", text: "Raising `max_iterations` to give the agent more turns." },
        { id: "c", text: "Reducing the number of tools available to the agent." },
        { id: "d", text: "Switching from a system prompt rule to a PreToolUse hook." },
      ],
      correctChoiceId: "b",
      explanation:
        "The blacklist's first item is 'Raising `max_iterations` to fix a stuck agent.' If an agent is looping or stuck, the fix is structured — improve tool error categories, add escalation triggers, or trim tools — not give it more turns to be confused.",
    },
    {
      id: "q20",
      prompt:
        "From the numbers-worth-memorizing table, what is the prompt cache write multiplier for a 5-minute TTL versus a 1-hour TTL?",
      choices: [
        { id: "a", text: "1× / 1.25× (no premium for 5-minute cache)." },
        { id: "b", text: "1.25× / 2× (5-minute writes cost 1.25×; 1-hour writes cost 2×)." },
        { id: "c", text: "2× / 4× (1-hour cache is 4× the input price to write)." },
        { id: "d", text: "0.1× / 0.25× (cache writes are always cheaper than input)." },
      ],
      correctChoiceId: "b",
      explanation:
        "The reference table lists '1.25× / 2×' as the prompt cache write multiplier for the 5-minute and 1-hour TTLs respectively. Reads are ~10% of input price. The maximum number of cache breakpoints is 4.",
    },
  ],
};

export default quiz;
