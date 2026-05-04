import type { Quiz } from "@/types/quiz";

const quiz: Quiz = {
  slug: "agentic-architecture",
  title: "Agentic Architecture & Orchestration",
  questions: [
    {
      id: "q1",
      prompt:
        "A user asks you to build a system that reviews 5 independent files and produces a consolidated security report. Which agentic pattern is the best fit?",
      choices: [
        { id: "a", text: "Prompt chaining — pass each file's review as input to the next step." },
        { id: "b", text: "Parallelization (sectioning) — dispatch one agent per file concurrently, then synthesize." },
        { id: "c", text: "Routing — classify each file by type and send to a specialized reviewer." },
        { id: "d", text: "Evaluator-optimizer — generate a report and have a critic iterate until quality is acceptable." },
      ],
      correctChoiceId: "b",
      explanation:
        "The five files are independent, so reviewing them in parallel (sectioning) is ideal. Prompt chaining is sequential and wastes time; routing is for dispatching to different handlers, not parallelizing the same task; evaluator-optimizer addresses output quality verification, not parallelism.",
    },
    {
      id: "q2",
      prompt:
        "In the agent loop, what is the ONLY reliable signal that the agent has finished its work and should stop looping?",
      choices: [
        { id: "a", text: "The model outputs text containing 'Final answer:' or 'I am done'." },
        { id: "b", text: "The `max_iterations` counter reaches its limit." },
        { id: "c", text: "`stop_reason === \"end_turn\"`" },
        { id: "d", text: "The model returns an empty content array." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module explicitly states: \"The only reliable agent-loop completion signal is `stop_reason === 'end_turn'`.\" Never parse text outputs for completion signals — the model's natural-language claims are not load-bearing. `max_iterations` is a safety net, not a primary stop condition.",
    },
    {
      id: "q3",
      prompt:
        "You are designing a multi-agent hub-and-spoke system. Why must subagents run in isolated contexts rather than sharing the coordinator's message history?",
      choices: [
        { id: "a", text: "The Agent SDK does not allow subagents to access the coordinator's messages for security reasons." },
        { id: "b", text: "Sharing the coordinator's full history causes attention dilution and increases token cost without adding value." },
        { id: "c", text: "Subagents need isolated contexts so each can use a different model version." },
        { id: "d", text: "Shared context would violate the Task tool's API contract." },
      ],
      correctChoiceId: "b",
      explanation:
        "Context isolation prevents 'lost-in-the-middle' attention dilution: a subagent given the full coordinator history would pay for tokens it doesn't need and may miss the relevant part of its task. Isolation is described in the module as 'a feature, not a limitation.'",
    },
    {
      id: "q4",
      prompt:
        "A customer support system must verify an order and then generate a refund. The steps always happen in a fixed sequence. Which pattern is most appropriate?",
      choices: [
        { id: "a", text: "Orchestrator-workers, because the coordinator must dynamically decide the steps at runtime." },
        { id: "b", text: "Evaluator-optimizer, because each step's output should be reviewed before proceeding." },
        { id: "c", text: "Prompt chaining, because the task cleanly decomposes into fixed sequential sub-steps." },
        { id: "d", text: "Parallelization (voting), to get a majority decision on whether to issue the refund." },
      ],
      correctChoiceId: "c",
      explanation:
        "Prompt chaining is for tasks with fixed, known sequential steps — exactly this scenario. Orchestrator-workers is for when subtasks are unknown until runtime. Evaluator-optimizer applies when output quality can be verified and iterated; voting applies when you need confidence from multiple independent runs.",
    },
    {
      id: "q5",
      prompt:
        "Anthropic's research found that a multi-agent system (Opus 4 lead + Sonnet 4 subagents) outperformed a single Opus 4 by +90.2% on their internal eval, but at what approximate token cost multiplier relative to typical chat?",
      choices: [
        { id: "a", text: "~3× more tokens than chat." },
        { id: "b", text: "~8× more tokens than chat." },
        { id: "c", text: "~15× more tokens than chat." },
        { id: "d", text: "~50× more tokens than chat." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module states multi-agent systems use approximately 15× more tokens than typical chat, while single agents use ~4×. This cost is justified when subtasks are parallelizable and the task value exceeds token cost, but is not justified for simple lookups.",
    },
    {
      id: "q6",
      prompt:
        "Per Anthropic's *Building Effective Agents*, what is the core distinction between a workflow and an agent?",
      choices: [
        { id: "a", text: "Workflows use tools while agents only generate text." },
        { id: "b", text: "Workflows orchestrate LLMs and tools through predefined code paths; agents let the LLM dynamically direct its own process and tool usage." },
        { id: "c", text: "Workflows always run in parallel, while agents always run sequentially." },
        { id: "d", text: "Workflows require multiple models, while agents use a single model." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module quotes Anthropic directly: workflows are systems where LLMs and tools are orchestrated through predefined code paths, while agents are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks.",
    },
    {
      id: "q7",
      prompt:
        "When deciding between a workflow and an agent for a new feature, what should be your default choice?",
      choices: [
        { id: "a", text: "Always start with an agent — it's more flexible and the LLM can adapt." },
        { id: "b", text: "Default to a workflow; only reach for an agent when the task genuinely requires the model to choose its own path." },
        { id: "c", text: "Pick whichever the team is most familiar with; the architectures are equivalent in cost and predictability." },
        { id: "d", text: "Default to multi-agent because parallelism is always faster." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module explicitly states 'Default to workflows. Reach for an agent only when the task genuinely requires the model to choose its own path.' Workflows are more predictable and cheaper; agents trade those for dynamic reasoning.",
    },
    {
      id: "q8",
      prompt:
        "A team needs to classify incoming customer messages as either billing, technical, or general inquiries, then send each to a specialized prompt. Which pattern fits?",
      choices: [
        { id: "a", text: "Routing — classify the input, then dispatch to a specialized prompt or model." },
        { id: "b", text: "Tool use — let the model call a `classify` tool inside the agent loop." },
        { id: "c", text: "Orchestrator-workers — let a coordinator decide subtasks dynamically." },
        { id: "d", text: "Parallelization (sectioning) — run all three specialized prompts and pick the best output." },
      ],
      correctChoiceId: "a",
      explanation:
        "Routing is the canonical pattern when distinct input categories benefit from different handling. The module also warns: don't conflate routing with `tool_use`. Running every specialized prompt in parallel would waste tokens, and orchestrator-workers is for unknown subtasks.",
    },
    {
      id: "q9",
      prompt:
        "A deployment system needs high confidence on whether a code change is safe to merge. You decide to run the same classification three times and take a 2-of-3 majority. Which pattern is this?",
      choices: [
        { id: "a", text: "Evaluator-optimizer — a critic reviews the generator's output." },
        { id: "b", text: "Prompt chaining — each call refines the previous output." },
        { id: "c", text: "Parallelization (voting) — same task run multiple times and aggregated." },
        { id: "d", text: "Routing — classify and dispatch to specialized handlers." },
      ],
      correctChoiceId: "c",
      explanation:
        "Voting is the second flavor of parallelization: run the same task multiple times and aggregate results (e.g., 3-of-5 majority on a classification). Use it when you need diversity or confidence on a decision.",
    },
    {
      id: "q10",
      prompt:
        "Which pattern is best when you don't know the subtasks in advance — the LLM must decide at runtime which workers to dispatch?",
      choices: [
        { id: "a", text: "Prompt chaining" },
        { id: "b", text: "Routing" },
        { id: "c", text: "Evaluator-optimizer" },
        { id: "d", text: "Orchestrator-workers" },
      ],
      correctChoiceId: "d",
      explanation:
        "Orchestrator-workers is the pattern for when subtasks aren't known up front — the orchestrator decomposes the task at runtime, dispatches to workers in isolated contexts, then synthesizes their results. Prompt chaining requires fixed, known steps.",
    },
    {
      id: "q11",
      prompt:
        "Which scenario is the textbook fit for the evaluator-optimizer pattern?",
      choices: [
        { id: "a", text: "Generating SQL queries that must pass a syntax validator and unit tests before being accepted." },
        { id: "b", text: "Translating a 100-page document into 5 languages simultaneously." },
        { id: "c", text: "Classifying inbound emails into one of three categories." },
        { id: "d", text: "Running the same prompt three times for a majority vote." },
      ],
      correctChoiceId: "a",
      explanation:
        "Evaluator-optimizer applies when 'good' is verifiable — tests, schema validation, or an evaluation rubric. The generator produces output, the evaluator critiques it, and the loop repeats until acceptance. The other options describe sectioning, routing, and voting respectively.",
    },
    {
      id: "q12",
      prompt:
        "Which of the following is NOT one of the four `stop_reason` values listed in the module?",
      choices: [
        { id: "a", text: "`end_turn`" },
        { id: "b", text: "`tool_use`" },
        { id: "c", text: "`completed`" },
        { id: "d", text: "`max_tokens`" },
      ],
      correctChoiceId: "c",
      explanation:
        "The module lists exactly four `stop_reason` values: `end_turn`, `tool_use`, `max_tokens`, and `stop_sequence`. There is no `completed` value — agents detect completion via `end_turn`, not a string named 'completed'.",
    },
    {
      id: "q13",
      prompt:
        "In the Agent SDK, what is required for a coordinator agent to be able to spawn subagents?",
      choices: [
        { id: "a", text: "The subagent must inherit the coordinator's full message history." },
        { id: "b", text: "The `Task` tool must be in the coordinator's `allowedTools`." },
        { id: "c", text: "Each subagent must be defined as a separate API key." },
        { id: "d", text: "The coordinator must use `claude-opus-4-6` specifically." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's hub-and-spoke table specifies that `Task` is the Agent SDK primitive that spawns a subagent and 'must be in the coordinator's `allowedTools`.' Subagents intentionally do NOT inherit the coordinator's message history (that would break isolation).",
    },
    {
      id: "q14",
      prompt:
        "How do you make multiple subagent invocations run in parallel in the Agent SDK?",
      choices: [
        { id: "a", text: "Set a `parallel: true` flag on each `Task` call." },
        { id: "b", text: "Issue multiple `Task` calls in a single assistant turn." },
        { id: "c", text: "Use `await Promise.all` around the coordinator runs." },
        { id: "d", text: "Configure the coordinator with `mode: 'concurrent'`." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module states: 'Multiple `Task` calls in one assistant turn run in parallel.' Parallelism is intrinsic to how the coordinator emits Task tool calls in a single turn — there is no explicit `parallel: true` flag.",
    },
    {
      id: "q15",
      prompt:
        "A user paused a long conversation last night and wants to come back today and continue exactly where they left off, with full prior context. Which session mode applies?",
      choices: [
        { id: "a", text: "`fork_session` — branch from the parent context into a new track." },
        { id: "b", text: "Fresh start — a new context with no shared state." },
        { id: "c", text: "`--resume <id>` — continue a named session with full prior context." },
        { id: "d", text: "Multi-agent dispatch — recreate the conversation across subagents." },
      ],
      correctChoiceId: "c",
      explanation:
        "`--resume <id>` continues a named session carrying full prior context — exactly the user-returns-to-paused-conversation case. `fork_session` is for exploring an alternative path without polluting the main session; fresh start gives no shared state.",
    },
    {
      id: "q16",
      prompt:
        "You want to explore an alternative answer path from the middle of an existing conversation, without altering the main session's history. Which session mode is correct?",
      choices: [
        { id: "a", text: "`--resume <id>`" },
        { id: "b", text: "`fork_session`" },
        { id: "c", text: "Fresh start" },
        { id: "d", text: "Subagent dispatch via `Task`" },
      ],
      correctChoiceId: "b",
      explanation:
        "`fork_session` branches from a shared parent context into a new track, so you can explore alternatives without polluting the main session. `--resume` continues the same session in place; a fresh start has no shared state at all.",
    },
    {
      id: "q17",
      prompt:
        "According to Anthropic's research on the multi-agent system, what fraction of performance variance on BrowseComp is explained by token usage alone?",
      choices: [
        { id: "a", text: "About 20%" },
        { id: "b", text: "About 50%" },
        { id: "c", text: "About 80%" },
        { id: "d", text: "About 99%" },
      ],
      correctChoiceId: "c",
      explanation:
        "The module cites Anthropic's finding that 'Token usage alone explains ~80% of performance variance' on BrowseComp. This is part of the justification for the multi-agent architecture's higher cost.",
    },
    {
      id: "q18",
      prompt:
        "An exam answer suggests: 'Raise `max_iterations` to 100 to handle complex tasks.' Why is this an anti-pattern?",
      choices: [
        { id: "a", text: "`max_iterations` is capped at 50 by the SDK." },
        { id: "b", text: "Higher iteration counts are billed at a premium rate." },
        { id: "c", text: "`max_iterations` is a safety net, not a primary stop condition — use proper stop conditions instead." },
        { id: "d", text: "It will cause `stop_reason` to never be returned." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's exam-traps table flags this exact wording: `max_iterations` is a safety net, not a primary stop condition. The correct mechanism is `stop_reason === 'end_turn'`. Cranking iterations doesn't fix faulty stop logic.",
    },
    {
      id: "q19",
      prompt:
        "A customer pushes back on the 15× token cost of a multi-agent research system. Which justification aligns with the module?",
      choices: [
        { id: "a", text: "Multi-agent is always cheaper because subagents use smaller models." },
        { id: "b", text: "The cost is justified when subtasks are parallelizable, context isolation prevents attention dilution, and task value exceeds token cost." },
        { id: "c", text: "The 15× figure is a worst-case estimate that rarely materializes in practice." },
        { id: "d", text: "Token cost is irrelevant because Anthropic discounts multi-agent traffic." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's exam framing is precise: cost is high but justifiable when (a) subtasks are parallelizable, (b) context isolation prevents attention dilution, and (c) task value exceeds token cost. Multi-agent is NOT justified for simple lookups.",
    },
    {
      id: "q20",
      prompt:
        "Which statement about giving every subagent access to all available tools is correct?",
      choices: [
        { id: "a", text: "It maximizes flexibility, so the coordinator's design becomes simpler." },
        { id: "b", text: "It is required by the Agent SDK — subagents cannot have a narrower tool list than the coordinator." },
        { id: "c", text: "It is an anti-pattern; isolation is the point, so tools should be narrowed per subagent." },
        { id: "d", text: "It improves performance because subagents can self-route to the right tool." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's exam-traps table flags 'Give every subagent access to all tools for flexibility' as wrong: 'Isolation is the point — narrow tools per subagent.' Each subagent should receive only the tools it needs for its specific subtask.",
    },
  ],
};

export default quiz;
