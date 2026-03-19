# Claude Certified Architect – Foundations Practice Test Bank

## Test Overview

**Total Questions:** 60
**Passing Score:** 720/1000 (72%)
**Question Format:** Multiple choice (1 correct answer, 3 distractors)
**Time Limit (Recommended):** 90-120 minutes

## How to Use This Test Bank

1. **Self-Guided Study:** Work through questions by domain to identify weak areas
2. **Practice Tests:** Take all 60 questions under timed conditions (90 minutes)
3. **Review:** Study explanations for all missed questions and related concepts
4. **Scoring:** Each question worth ~16.67 points. You need ≥43 correct answers to pass

### Difficulty Distribution
- **Easy (20%):** 12 questions - Foundation concepts, straightforward application
- **Medium (50%):** 30 questions - Practical scenarios, concept integration
- **Hard (30%):** 18 questions - Edge cases, architectural decisions, trade-offs

---

## Domain 1: Agentic Architecture & Orchestration (27% — 16 questions)

### Question 1
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Easy

You're building a customer support resolution agent that needs to analyze tickets, check knowledge base articles, and generate responses. The agent should execute these steps sequentially, with the knowledge base lookup depending on the ticket analysis results.

Which agentic loop pattern best enables this sequential, dependent execution?

- A) Run all tools in parallel using concurrent task scheduling
- B) Use a single-turn model response with tool_choice set to "any" for all tools
- C) Implement an agentic loop where the model's stop_reason guides conditional tool execution
- D) Create three separate agents, each handling one step independently

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** An agentic loop leverages the model's stop_reason to determine when to invoke tools and when to continue. The model naturally reasons about dependencies and orders its tool calls appropriately. Option A fails because parallel execution ignores dependencies. Option B doesn't repeat the loop for sequential reasoning. Option D creates unnecessary isolation and coordination overhead.

</details>

---

### Question 2
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Medium

Your multi-agent system uses a coordinator-subagent pattern where a coordinator delegates tasks to specialized agents. The coordinator must ensure that subagents only access tools relevant to their domain. A financial subagent accidentally called a customer deletion tool.

What should you implement to prevent this cross-domain tool access?

- A) Add an allowedTools constraint in the subagent's AgentDefinition with a precise list of permitted tools
- B) Document tool usage guidelines in the coordinator's system prompt
- C) Use programmatic enforcement through the Task tool's tool_choice parameter
- D) Remove all potentially dangerous tools from the MCP registry

<details>
<summary>Show Answer</summary>

**Correct Answer: A)**

**Explanation:** AgentDefinition's allowedTools parameter provides hard boundaries—a subagent literally cannot access unlisted tools, regardless of prompting. This is programmatic enforcement at the agent level, the strongest boundary. Option B relies on prompt-based guidance, which is brittle. Option C enforces at the task level but doesn't prevent the subagent from calling any tool. Option D is overly destructive and limits legitimate tool access.

</details>

---

### Question 3
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Medium

You're implementing a code review agent that must maintain isolated context for each pull request review. The agent analyzes code, generates comments, and detects security issues—all within the same session.

How should you structure this to ensure PR reviews don't leak context between consecutive reviews?

- A) Use fork_session to create independent review contexts for each PR
- B) Rely on system prompt instructions to prevent cross-PR context contamination
- C) Clear the conversation history manually between reviews
- D) Create a new session file for each PR review

<details>
<summary>Show Answer</summary>

**Correct Answer: A)**

**Explanation:** fork_session creates isolated execution contexts with clean history and independent state. This prevents any information from one PR review contaminating the next. Option B (prompt-based guidance) cannot prevent accidental context leakage. Option C is manual and error-prone. Option D creates file management overhead but fork_session is the intended architectural pattern for this use case.

</details>

---

### Question 4
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Hard

A research automation agent uses the Task tool to decompose complex queries into subtasks. You must decide whether to use **prompt chaining** (sequential task prompts) or **dynamic decomposition** (the agent dynamically decides subtasks).

In what scenario is prompt chaining superior to dynamic decomposition?

- A) When the task structure is unpredictable and requires real-time adaptation
- B) When you have a well-defined, repeatable process (e.g., "always do A, then B, then C")
- C) When you need maximum flexibility to handle novel research questions
- D) When the agent has insufficient reasoning capability for complex decomposition

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Prompt chaining excels when the task structure is predictable and stable. You define the exact sequence once, reducing per-task reasoning overhead. Dynamic decomposition is better for unpredictable scenarios (A, C). Option D misunderstands the trade-off—both approaches work with capable models; the difference is determinism vs. flexibility, not capability.

</details>

---

### Question 5
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Medium

Your agent processes user requests with the following stop_reason values:

- `end_turn`: Model decided to stop and return a response
- `tool_use`: Model wants to call a tool
- `max_tokens`: Context window limit reached

A user's request about competitive analysis results in `max_tokens`. What's the best recovery strategy?

- A) Resume the same session with --resume to continue from the last valid state
- B) Summarize the partial analysis and ask the user to resubmit a more focused query
- C) Increase the model's max_tokens parameter and retry the request
- D) Fork a new session and restart the analysis with a simpler prompt

<details>
<summary>Show Answer</summary>

**Correct Answer: A)**

**Explanation:** --resume resumes the exact session state, allowing the model to continue reasoning where it left off. This preserves all prior context and reasoning steps. Option B abandons useful work. Option C doesn't solve the structural problem (the task genuinely needs more tokens). Option D loses context from the partial analysis.

</details>

---

### Question 6
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Easy

When should you use **programmatic enforcement** (hard constraints in AgentDefinition) versus **prompt-based guidance** (instructions in system prompts)?

- A) Prompt-based guidance is always better because it gives the agent more flexibility
- B) Programmatic enforcement for critical security/reliability boundaries; prompt-based guidance for preferences
- C) Use programmatic enforcement only when you cannot express constraints in natural language
- D) They're equivalent; choose based on readability preference

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Programmatic enforcement creates hard boundaries that cannot be bypassed—essential for security and reliability. Prompt-based guidance is suitable for softer preferences where some deviation is acceptable. Option A underestimates security risks. Option C is backward (many constraints can be expressed naturally but still need hard enforcement). Option D ignores the functional difference.

</details>

---

### Question 7
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Hard

You implement a PostToolUse hook in your agent to validate tool outputs before the model processes them. A tool returns `{"result": "N/A", "error": "timeout"}`.

What should the PostToolUse hook do?

- A) Let the error pass through; the model is sophisticated enough to handle malformed responses
- B) Retry the tool immediately up to 3 times before allowing the model to see the error
- C) Flag the output as structured error metadata (errorCategory, isRetryable) so the model can decide whether to retry
- D) Hide the error from the model and return a synthetic success response

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** PostToolUse hooks should provide structured error metadata, allowing the model to make informed decisions about retries. Option A ignores the hook's value. Option B oversimplifies (not all timeouts benefit from immediate retry; exponential backoff is better). Option D defeats error handling and debugging.

</details>

---

### Question 8
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Medium

Your data extraction agent uses the Task tool to process a large batch of documents. Each task should be isolated and retriable independently. How should you structure task decomposition to support this?

- A) Create one task per document with explicit input/output specifications
- B) Create one large task for all documents to maintain context across the batch
- C) Let the agent dynamically decide the number of subtasks during execution
- D) Create tasks based on document size, not logical document boundaries

<details>
<summary>Show Answer</summary>

**Correct Answer: A)**

**Explanation:** Explicit 1:1 task-to-document mapping enables independent retries and clear failure isolation. Batch processing (B) prevents per-document retry logic. Dynamic decomposition (C) makes retry logic complex. Arbitrary partitioning (D) creates unpredictable failure modes.

</details>

---

### Question 9
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Hard

You've built a customer support agent that maintains conversation history across 50 messages. The conversation includes sensitive PII, resolved issues, and outdated information. A user asks, "What did I tell you about my account number?"

What's the architectural problem with this scenario, and how should you handle it?

- A) The agent has too much context history; use prompt pruning to remove PII before processing new requests
- B) Sensitive PII should never be stored in conversation history; use fork_session to create isolated subagents for sensitive operations
- C) This is fine; the model has no ability to leak data, and full context improves accuracy
- D) Archive messages older than 30 days and restrict the agent's context window to recent messages only

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Storing PII in shared conversation history creates privacy and security risks. fork_session isolates sensitive operations, preventing data accumulation. Option A (prompt pruning) is unreliable; information might still be present. Option C ignores privacy responsibilities. Option D doesn't address the fundamental problem.

</details>

---

### Question 10
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Medium

You're debugging an agent that calls the same tool multiple times with nearly identical parameters. The tool calls appear wasteful, but the agent's reasoning suggests it's intentional (checking for state changes between calls).

What should you investigate?

- A) The agent is poorly designed; merge redundant tool calls into a single batch call
- B) This indicates a bug in the agentic loop; the model should only call tools when necessary
- C) This might be legitimate polling behavior for state changes; analyze whether the state-checking rationale justifies the overhead
- D) Implement a cache in the tool to deduplicate requests and reduce API calls

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** Repeated calls with identical parameters can be legitimate state-checking behavior. You must understand the intent before "fixing" it. Option A/B assume it's wasteful without investigation. Option D solves a symptom, not the underlying design question.

</details>

---

### Question 11
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Easy

Your agent's system prompt says, "Always use the code review tool before responding." However, the agent sometimes responds without calling the tool.

Why might this happen, and what's the proper fix?

- A) The model is ignoring instructions; you need a more forceful prompt
- B) The code review tool isn't in the agent's allowedTools list, or tool_choice isn't configured correctly
- C) The model reached its max_tokens limit before calling the tool
- D) This is normal behavior; prompts are suggestions, not guarantees

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Programmatic constraints (allowedTools, tool_choice) enforce tool usage where prompts cannot. If the tool isn't accessible or tool_choice doesn't require it, the agent won't call it. Option A underestimates the need for hard constraints. Option C is possible but less likely. Option D is true in general but misses the architectural solution.

</details>

---

### Question 12
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Hard

You're building a multi-step approval workflow: Agent A gathers requirements, Agent B drafts a proposal, Agent C reviews it, and Agent D approves it. Agents should not have visibility into each other's full context to prevent bias.

How should you structure this with agentic patterns?

- A) Create four agents in sequence within one fork_session, sharing the same context
- B) Use four independent fork_session calls, passing only the necessary output (not the full context) between agents
- C) Create a central coordinator that calls each agent sequentially and translates outputs
- D) Use prompt chaining to guide one agent through all four steps

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Isolated fork_session contexts prevent bias from full context visibility. Passing only necessary outputs maintains separation. Option A shares too much context. Option C (coordinator) adds overhead if you're using fork_session correctly. Option D collapses the isolation benefit.

</details>

---

### Question 13
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Medium

Your agent uses stop_reason checks to decide next actions. You notice that sometimes stop_reason is `tool_use` with a tool call to the Grep tool, and other times the same type of query results in `end_turn` with inline text search.

What's the likely explanation?

- A) The Grep tool is unreliable; replace it with the Bash tool
- B) Depending on query complexity and model reasoning, the agent chooses between tool-based and inline approaches
- C) This indicates a bug; the agent should consistently use the same tool
- D) The agent's allowedTools configuration is changing between calls

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Models make contextual decisions about whether to invoke tools or handle tasks inline. This flexibility is a feature, not a bug. Option A doesn't address the real issue. Option C prevents beneficial flexibility. Option D would require configuration changes, which aren't happening.

</details>

---

### Question 14
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Hard

You're designing a financial analysis agent that must never execute trades without explicit human approval. You've added a human-in-the-loop gate in the system prompt and created a special "ExecuteTrade" tool.

What's the architectural risk, and how should you mitigate it?

- A) The prompt-based restriction alone isn't sufficient; use allowedTools to exclude ExecuteTrade, requiring a separate human approval process outside the agent
- B) This design is secure; the system prompt is a sufficient safeguard
- C) Implement a separate approval agent that must authorize all trade requests before passing them to the executor
- D) Add additional tool constraints in the PostToolUse hook to double-check before executing trades

<details>
<summary>Show Answer</summary>

**Correct Answer: A)**

**Explanation:** Hard constraints beat soft prompts for security-critical decisions. The agent shouldn't have access to ExecuteTrade directly; human approval should be an architectural requirement, not a prompt suggestion. Option B ignores proven attack vectors. Option C adds complexity without addressing the root issue. Option D is defense-in-depth but doesn't solve the primary problem.

</details>

---

### Question 15
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Medium

You've implemented an agent that uses fork_session to create isolated contexts for different user requests. However, you realize some users are asking questions that build on previous conversation history.

How should you handle this architecture problem?

- A) Stop using fork_session and keep all conversations in one session
- B) Use fork_session for isolation but allow users to explicitly reference previous sessions if they choose
- C) Automatically merge relevant context from previous sessions into new fork_session contexts
- D) Document that users cannot reference previous conversations and must restart context

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** fork_session provides isolation by default, but users can explicitly request continuity by referencing previous sessions. This balances isolation and user control. Option A loses isolation benefits. Option C automates merging, creating unintended context bleed. Option D is overly restrictive.

</details>

---

### Question 16
**Domain:** Agentic Architecture & Orchestration | **Difficulty:** Hard

You're auditing an agent that frequently uses the Task tool to create subtasks. One subtask creation shows: Task(prompt="Analyze this data", tools=["Grep", "Read"], timeout=1s).

What's problematic about this task definition?

- A) The task doesn't specify allowedTools at the agent level, so the subagent has unlimited tool access
- B) The timeout (1s) is too short for a reasonable analysis task and will likely result in max_tokens stops
- C) The task doesn't define expected output structure, making results unpredictable
- D) None of these are problems; the task definition is reasonable

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** 1-second timeout is unrealistic for an agentic loop with tool usage. The task will likely hit max_tokens stops before completing analysis. Options A and C are design preferences, not critical problems. Timeouts should be realistic (10s-60s+ depending on complexity).

</details>

---

## Domain 2: Tool Design & MCP Integration (18% — 11 questions)

### Question 17
**Domain:** Tool Design & MCP Integration | **Difficulty:** Easy

You're designing a tool description for an agent that accesses customer data. Two potential descriptions are:

**Option 1:** "Access customer information"
**Option 2:** "Retrieve specific customer records by ID. Returns customer_id, name, email, phone, account_status, and metadata. Use this tool to look up individual customers."

Why is Option 2 superior for LLM tool selection?

- A) It's longer and more impressive
- B) It provides concrete parameter and output examples, enabling the model to make informed decisions about tool usage
- C) Longer descriptions don't affect tool selection; they're equally good
- D) It's more technical and prevents non-experts from using the tool

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Detailed descriptions with parameter names and output fields help models understand when and how to invoke tools. Option 1 is vague, leading to incorrect tool routing. Option C is false; description quality directly impacts tool selection. Option D doesn't make sense.

</details>

---

### Question 18
**Domain:** Tool Design & MCP Integration | **Difficulty:** Medium

Your system has two tools: "SearchCustomer" (queries by name, email, or ID) and "FindCustomerByID" (queries only by ID). An agent receives a request, "Find the customer with email john@example.com."

What problem does this tool overlap create, and what's the fix?

- A) The agent might choose the wrong tool; both are equally valid, so the request is ambiguous
- B) The tools overlap in functionality; remove one or make their purposes mutually exclusive
- C) The agent will work correctly because it can distinguish between tools based on the query
- D) This is fine; tool redundancy allows the agent to retry with a different tool if one fails

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Overlapping tools create routing ambiguity and degrade agent reliability. You should eliminate overlap by making tools purposefully distinct or combining them. Option A is true but doesn't lead to the right fix. Option C overestimates the model's disambiguation ability. Option D treats redundancy as a feature when it's a design flaw.

</details>

---

### Question 19
**Domain:** Tool Design & MCP Integration | **Difficulty:** Medium

A tool returns an error response: `{"status": "failed", "error": "Database connection timeout"}`.

You want to structure this as standardized error metadata so agents can handle retries intelligently. What fields should you include?

- A) Just the error message; it's descriptive enough
- B) errorCategory ("transient" vs "permanent"), isRetryable (boolean), errorMessage, and timestamp
- C) errorCode (numeric), errorMessage, and service_name
- D) The raw exception object from the database

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Structured metadata with errorCategory and isRetryable allows agents to make intelligent retry decisions. A "transient" error warrants retry; a "permanent" error warrants escalation. Option A lacks decision-making signals. Option C is less semantically clear. Option D is unsafe and not standardized.

</details>

---

### Question 20
**Domain:** Tool Design & MCP Integration | **Difficulty:** Hard

You're implementing an MCP tool that performs expensive API calls. You want to register it with multiple agents via ~/.claude.json, but the security team requires this tool to be available only to specific agents.

How should you scope tool availability?

- A) Use ~/.claude.json for global registration; scoping doesn't work with MCP
- B) Register the tool in .mcp.json at the project level, and control access via agent-specific allowedTools lists
- C) Create separate MCP configurations for different user groups and distribute .mcp.json files
- D) Register in ~/.claude.json but add permission checks inside the tool's implementation

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** .mcp.json scopes to the project/directory level, and allowedTools enforces agent-level restrictions. This provides fine-grained control. Option A ignores scoping capabilities. Option C is overcomplicated. Option D puts authorization logic in the tool (wrong layer).

</details>

---

### Question 21
**Domain:** Tool Design & MCP Integration | **Difficulty:** Medium

Your MCP tool configuration includes the line: `export API_KEY="${CLAUDE_API_KEY}"`.

What's the security implication of this environment variable expansion?

- A) This is safe; environment variables are encrypted at rest
- B) The value is interpolated at configuration load time, exposing it in logs or config dumps
- C) This is the recommended way to inject secrets into MCP tools
- D) Environment variables are only accessible to the tool, never to other processes

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Variable expansion makes values visible in config, logs, and debugging output. Secrets shouldn't be embedded this way. Option A is false (not encrypted at rest in config files). Option C is wrong (secrets should use secret management systems). Option D is false (environment variables are visible to sibling processes).

</details>

---

### Question 22
**Domain:** Tool Design & MCP Integration | **Difficulty:** Easy

How many tools is too many for a single agent before tool selection reliability begins degrading?

- A) There's no limit; the model can manage hundreds of tools
- B) Generally, more than 10-15 tools increases the risk of misrouting and decreases coherence
- C) Exactly 5 tools is the optimal number
- D) Tool count doesn't matter; prompt quality is the only factor

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Empirically, agent reliability degrades with tool proliferation (typically >10-15 tools). The model must reason about which tool to use, and too many options increase confusion. Option A is overly optimistic. Option C is arbitrary. Option D underestimates cognitive load.

</details>

---

### Question 23
**Domain:** Tool Design & MCP Integration | **Difficulty:** Hard

You're debugging an agent's tool selection behavior. The agent has access to:
- `ListenForNotifications` (subscribes to real-time events)
- `PollForNotifications` (checks for new messages once)
- `GetNotificationHistory` (retrieves past notifications)

The agent is misrouting between ListenForNotifications and PollForNotifications. How should you fix this?

- A) Rename the tools to be clearer (e.g., "SubscribeNotifications" vs "FetchNotifications")
- B) Improve tool descriptions to distinguish blocking (ListenForNotifications) vs non-blocking (PollForNotifications) behavior
- C) Remove one tool; the overlap is causing confusion
- D) Use tool_choice="forced" to require explicit selection before each call

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Clear descriptions emphasizing the behavioral difference (blocking vs non-blocking) help the model distinguish tools. Option A (renaming) might help but descriptions are more important. Option C removes functionality. Option D doesn't address the root cause.

</details>

---

### Question 24
**Domain:** Tool Design & MCP Integration | **Difficulty:** Medium

You're integrating an external MCP that provides weather data. The MCP exports three tools: WeatherNow, WeatherForecast, and WeatherAlert.

Your agent only needs WeatherNow and WeatherForecast. How should you handle this?

- A) Load all three tools and rely on prompting to prevent the agent from using WeatherAlert
- B) Use allowedTools to explicitly allow only WeatherNow and WeatherForecast
- C) Modify the MCP to remove WeatherAlert before loading it
- D) Accept all three tools; unused tools don't harm agent performance

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** allowedTools provides explicit control over which tools an agent can access. This prevents accidental misuse and reduces reasoning overhead. Option A relies on soft prompts. Option C requires modifying the MCP (unnecessary). Option D is false; unused tools increase confusion.

</details>

---

### Question 25
**Domain:** Tool Design & MCP Integration | **Difficulty:** Hard

An MCP resource definition specifies: `resource: "file://${APP_HOME}/data/customers.csv"`.

The agent will use this resource via tool calls. What's the issue with this pattern?

- A) File URIs aren't supported by MCP; use HTTP URIs instead
- B) Environment variable expansion in resources creates runtime dependency and potentially exposes paths in logs
- C) The resource path should be hardcoded, not parameterized
- D) There's no issue; this is a standard MCP pattern

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Variable expansion in resource paths creates dependencies and logging risks. Resources should use fixed, well-known paths or be resolved before MCP loading. Options A and C are too restrictive. Option D ignores operational concerns.

</details>

---

### Question 26
**Domain:** Tool Design & MCP Integration | **Difficulty:** Medium

You're designing tool schemas for a financial API. One schema definition is:

```json
{
  "type": "object",
  "properties": {
    "account_id": {"type": "string"},
    "amount": {"type": "number"},
    "currency": {"type": "string", "enum": ["USD", "EUR", "GBP"]}
  }
}
```

What's missing from this schema that would improve agent reliability?

- A) A "description" field for each property
- B) A "required" array specifying mandatory fields
- C) A "title" field for the overall schema
- D) A "minimum" constraint on the amount field

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** The "required" array tells the model which fields must be provided, preventing incomplete requests. Option A (descriptions) is helpful but less critical. Option C (title) is metadata. Option D (minimum) is a nice constraint but less important than required fields.

</details>

---

### Question 27
**Domain:** Tool Design & MCP Integration | **Difficulty:** Easy

What's the difference between tool_choice="auto" and tool_choice="any" in agent configuration?

- A) "auto" lets the model decide; "any" forces tool usage
- B) "auto" uses the LLM's native tool selection; "any" allows any tool in allowedTools
- C) They're equivalent; both allow flexible tool selection
- D) "any" doesn't exist; only "auto" and "forced" are valid

<details>
<summary>Show Answer</summary>

**Correct Answer: A)**

**Explanation:** tool_choice="auto" lets the model decide whether to use tools at all. tool_choice="any" forces the model to use a tool (from allowedTools) on every call. Option B is partially correct but less precise. Options C and D are incorrect.

</details>

---

## Domain 3: Claude Code Configuration & Workflows (20% — 12 questions)

### Question 28
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Easy

You have a CLAUDE.md file in your project root and another in a subdirectory. Which one takes precedence?

- A) The project root always takes precedence
- B) The most specific (nearest to the current file) takes precedence
- C) The subdirectory always overrides the root
- D) Both merge together

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** CLAUDE.md hierarchy follows a "nearest wins" pattern. The most specific file (closest to the current working directory) takes precedence. This allows fine-grained, context-specific rules. Options A and C are too absolute. Option D ignores the hierarchy principle.

</details>

---

### Question 29
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Medium

Your project structure has:
- `/CLAUDE.md` (project-level rules)
- `/.claude/rules/security.yaml` (security-specific rules)
- `/src/CLAUDE.md` (source code rules)

You're editing a file in `/src`. In what order are rules applied?

- A) Only /src/CLAUDE.md applies (nearest wins)
- B) /src/CLAUDE.md, then /.claude/rules/security.yaml, then /CLAUDE.md
- C) /CLAUDE.md, then /.claude/rules/, then /src/CLAUDE.md (project to specific)
- D) All rules merge equally

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** Rules are applied from broadest to most specific (project → directory → file rules). This prevents overly specific rules from overriding critical project policies. Option A ignores higher-level rules. Option B reverses the order. Option D doesn't respect hierarchy.

</details>

---

### Question 30
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Medium

You want to create a custom slash command in Claude Code that runs a linting check. Where should you define it?

- A) In .claude/commands/ directory with a shell script
- B) In CLAUDE.md as a tool definition
- C) In .claude/commands/ with a COMMAND.md file containing the command definition
- D) In the project's package.json scripts section

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** Slash commands are defined in .claude/commands/ with COMMAND.md files that specify the command behavior. Option A is incomplete (needs COMMAND.md structure). Option B is wrong (CLAUDE.md contains rules, not command definitions). Option D doesn't integrate with Claude Code.

</details>

---

### Question 31
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Hard

You're importing shared rules from a different project using @import. The imported file contains rules that conflict with your project's rules.

How should you handle the conflict?

- A) Use @import syntax to override: `@import "shared.md" -> override`
- B) Place your project's rules AFTER the @import statement to take precedence
- C) Remove the conflicting rules from the shared file
- D) Don't use @import for files with potential conflicts

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Rule order matters. Rules defined after @import statements take precedence over imported rules. This allows project-specific customization of shared rules. Options A doesn't exist. Option C defeats the purpose of shared rules. Option D is overly restrictive.

</details>

---

### Question 32
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Medium

You're setting up a skill with a SKILL.md file. The skill needs to use specific tools and accept arguments. What should SKILL.md contain in its YAML frontmatter?

- A) Just the skill description
- B) description, context (fork), allowed-tools, and argument-hint
- C) description, author, and version
- D) description and tool_choice setting

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** SKILL.md frontmatter should include description (what it does), context: fork (isolation), allowed-tools (which tools can be used), and argument-hint (expected input format). Option A is too minimal. Option C omits functional fields. Option D lacks argument-hint.

</details>

---

### Question 33
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Medium

You're deciding between **plan mode** and **direct execution** for a complex refactoring task in Claude Code.

When should you use plan mode?

- A) Always use plan mode for safety
- B) When the task is risky or requires approval before execution
- C) Only for simple tasks to save time
- D) Never use plan mode; it slows down development

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Plan mode creates a reviewable plan before execution, ideal for high-risk or irreversible operations. Direct execution is better for routine tasks. Options A and D are extremes. Option C is backward.

</details>

---

### Question 34
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Easy

What does the -p flag do in Claude Code?

- A) Enables plan mode for all operations
- B) Runs tests in parallel
- C) Enables CI-friendly output and disables interactive prompts
- D) Specifies a project name

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** The -p flag configures Claude Code for CI environments—non-interactive, structured output, suitable for automated pipelines. Option A is incorrect; plan mode is separate. Option B isn't correct. Option D is wrong.

</details>

---

### Question 35
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Medium

You want to integrate Claude Code into a CI/CD pipeline that must parse tool results as JSON. What flag should you use?

- A) -p (CI mode)
- B) --json (JSON output mode)
- C) --output-format json
- D) --ci-mode

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** --output-format json returns structured JSON output suitable for CI pipelines. Option A enables CI mode but doesn't specify format. Option B doesn't exist. Option D is nonstandard.

</details>

---

### Question 36
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Hard

You have two code review configurations:
1. **Integrated:** Reviewer and author context in the same session
2. **Isolated:** Review agent runs in a separate fork_session for independence

What are the trade-offs?

- A) Integrated is always better because context is shared
- B) Isolated is always better because reviews are independent
- C) Integrated allows shared context but risks bias; Isolated prevents bias but requires context passing
- D) They're equivalent; choose based on preference

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** Each approach has trade-offs. Integrated reviews have full context but may be biased by author's reasoning. Isolated reviews are independent but require explicit context passing (output from prior step). Options A and B are too absolute. Option D ignores real differences.

</details>

---

### Question 37
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Medium

You're using Claude Code in iterative refinement mode, where you make a change, get feedback, and refine. How should you structure your workflow to maintain context between iterations?

- A) Use a single session with multiple turns, preserving conversation history
- B) Create a new session for each iteration to avoid context pollution
- C) Use fork_session to create isolated contexts that don't affect the main session
- D) Manually copy context from one session to the next

<details>
<summary>Show Answer</summary>

**Correct Answer: A)**

**Explanation:** A single session preserves reasoning continuity across iterations, allowing the model to build on previous refinements. Option B loses context. Option C adds isolation overhead. Option D is manual and error-prone.

</details>

---

### Question 38
**Domain:** Claude Code Configuration & Workflows | **Difficulty:** Hard

You're reviewing Claude Code output before committing to production. The code has been generated and reviewed by isolated agents (author and reviewer contexts separated).

What's a critical architectural limitation of this approach, and how should you address it?

- A) Isolated agents can't see each other's work; use a unified session to merge reviews
- B) Isolated review agents lack authorial context, which might cause them to miss subtleties; use independent review instances that cross-check each other
- C) This design is optimal; no changes needed
- D) Isolated agents are more prone to errors; consolidate into a single agent

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Isolation prevents information leakage but also limits context. The fix is independent multi-pass review (different agents, different contexts) that cross-validates findings. Option A defeats the isolation benefit. Option C ignores real limitations. Option D loses the value of isolation.

</details>

---

## Domain 4: Prompt Engineering & Structured Output (20% — 12 questions)

### Question 39
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Easy

You're writing a prompt for a summarization task. Which version is more likely to produce consistent results?

**Version A:** "Summarize this document."

**Version B:** "Summarize this document in 2-3 sentences, focusing on key findings and business impact. Omit minor details."

- A) Both are equally effective
- B) Version A is better because it gives the model more freedom
- C) Version B is better because it specifies explicit criteria and constraints
- D) Neither is effective; summaries always vary

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** Explicit criteria (length, focus areas, omissions) significantly improve consistency. Version A is vague and produces unpredictable output. Option B overestimates the value of freedom. Option D is false; clear prompts produce predictable results.

</details>

---

### Question 40
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Medium

You're using few-shot prompting to teach a model to classify support tickets. You provide 3 examples of ticket-to-category pairs.

How many examples are generally optimal before diminishing returns?

- A) 1-2 examples to avoid overwhelming the model
- B) 3-5 examples to establish clear patterns
- C) 10+ examples for maximum accuracy
- D) As many as the context window allows

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** 3-5 well-chosen examples typically establish patterns effectively. Beyond that, diminishing returns kick in and you consume more context. Option A (1-2) may be insufficient. Option C increases context usage without proportional gains. Option D wastes context.

</details>

---

### Question 41
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Medium

You want a model to output structured JSON for invoice extraction. You could:

**Approach 1:** Use a system prompt: "Output JSON with fields: invoice_id, date, total_amount"

**Approach 2:** Use tool_use with a JSON schema, where the model must call an InvoiceExtracted tool with the structured data

Which is more reliable for ensuring valid JSON output?

- A) Approach 1 because prompts are more direct
- B) Approach 2 because tool schemas enforce structure and guarantee valid JSON
- C) Both are equally reliable
- D) Neither approach guarantees valid JSON

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Tool schemas enforce structure at the model/API level. The model cannot return invalid JSON when using tools. Prompts can be ignored or misinterpreted. Option A underestimates reliability differences. Options C and D are false.

</details>

---

### Question 42
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Hard

You're implementing a self-review mechanism: Agent A generates content, then the same agent (in the same session) reviews its own output.

What's the fundamental limitation of this approach?

- A) It's redundant; the model shouldn't need to review its own work
- B) The model lacks independence; it tends to defend prior choices rather than critically evaluate them
- C) This is an optimal approach; no limitations
- D) The review will take longer than the initial generation

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Models exhibit confirmation bias when reviewing their own outputs. They tend to rationalize choices rather than critically evaluate. Option A ignores the value of review. Option C underestimates cognitive bias. Option D is timing-related, not a fundamental limitation.

</details>

---

### Question 43
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Medium

A tool returns an error: "Invalid API key." Your retry-with-error-feedback pattern is:

```
1. Call tool
2. If error: pass error message to model
3. Model modifies parameters and retries
```

What's the problem with this approach?

- A) The model can't learn from errors; it will retry identically
- B) Some errors (like "Invalid API key") are not recoverable by parameter changes; the prompt should guide the model to escalate instead
- C) Retries always succeed on the second attempt
- D) Error feedback isn't useful to models

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Not all errors are recoverable. Permission/authentication errors require escalation, not retry. The model needs guidance on which errors warrant retry vs escalation. Option A is false (models do learn from errors). Option C is false. Option D is false.

</details>

---

### Question 44
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Hard

You're deciding between standard API calls and the batch API for a data processing pipeline. The batch API offers 50% cost savings but requires submitting jobs for 24-hour processing windows.

When should you use the batch API?

- A) Always, because of the cost savings
- B) Never, because of the 24-hour latency
- C) When you have non-urgent, bulk processing tasks that can tolerate 24-hour latency
- D) Only for tasks that require very high accuracy

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** Batch API suits non-urgent, bulk operations where latency is acceptable. Examples: daily report generation, overnight processing. Options A/B ignore the latency/cost trade-off. Option D doesn't relate to batch API's design.

</details>

---

### Question 45
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Medium

You're using the batch API with custom_id fields to track results. What's the benefit of custom_id?

- A) It encrypts the request for security
- B) It allows you to correlate batch results with your original requests without querying by timestamp
- C) It ensures the batch API processes requests in that order
- D) It automatically retries failed requests

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** custom_id is a user-provided identifier that links batch results to original requests. This enables reliable result tracking without timestamp matching. Option A is wrong (batch doesn't encrypt). Option C is wrong (batch doesn't guarantee order). Option D is wrong (retry logic is separate).

</details>

---

### Question 46
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Easy

You're designing a JSON schema for a tool that extracts customer information. A field should:
- Be provided when available, but omitted if unknown
- Be a string when present

How should you define it in JSON Schema?

- A) `{"type": "string"}` (required by default)
- B) `{"type": ["string", "null"]}` (allow null)
- C) `{"type": "string", "nullable": true}` (nullable keyword)
- D) Don't include required array for optional fields

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** In JSON Schema, `{"type": ["string", "null"]}` allows the field to be either a string or null, and the field can be omitted from the required array. Option A makes it required. Option C uses incorrect syntax (nullable is a keyword but type: ["string", "null"] is the proper pattern). Option D is vague.

</details>

---

### Question 47
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Medium

You want to ensure an AI agent always uses one of three strategies: "escalate", "retry", or "manual_review". How should you enforce this in the output schema?

- A) Use enum constraint: `{"type": "string", "enum": ["escalate", "retry", "manual_review"]}`
- B) Document it in the prompt and hope the model follows
- C) Create three separate tools and use tool_choice="forced"
- D) Use a pattern regex: `{"type": "string", "pattern": "(escalate|retry|manual_review)"}`

<details>
<summary>Show Answer</summary>

**Correct Answer: A)**

**Explanation:** The enum constraint is the standard, reliable way to enforce discrete choices in JSON Schema. The model cannot return other values. Option B relies on soft guidance. Option C is overcomplicated. Option D (pattern) is less strict than enum.

</details>

---

### Question 48
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Hard

You're implementing a multi-pass review system where:
1. Agent A generates content
2. Agent B reviews it (isolated session)
3. Agent C reviews B's critique (isolated from both A and B)

What's the architectural advantage and what's the risk?

- A) Advantage: Triple review improves quality. Risk: Exponential time cost
- B) Advantage: Independent perspectives prevent groupthink. Risk: Agents might disagree on fundamental issues without context to resolve
- C) This is inefficient; use one agent with better prompting instead
- D) No risks; more reviews always improve output

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Independent reviews provide diverse perspectives and prevent bias/confirmation loops. The trade-off is potential disagreement requiring human resolution. Option A is true but incomplete (doesn't address the real risk). Option C dismisses valuable architectural benefits. Option D ignores real orchestration challenges.

</details>

---

### Question 49
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Medium

A prompt instructs: "If the user asks about pricing, always respond with our current rates." This is later found to produce inaccurate pricing information.

What's the root cause, and what's the fix?

- A) The instruction is too rigid; make it more flexible
- B) The model is hallucinating pricing data instead of using a tool; add a tool for fetching current rates and use tool_choice="forced"
- C) The model is interpreting old pricing from training data; this is unsolvable
- D) The user is asking trick questions

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Prompts can't reliably provide current, accurate data—the model hallucinates. Tools with real data sources prevent this. Option A doesn't address the hallucination problem. Option C is defeatist (tools solve this). Option D is off-topic.

</details>

---

### Question 50
**Domain:** Prompt Engineering & Structured Output | **Difficulty:** Hard

You need to extract structured data from 50,000 documents. You could use:

**Approach 1:** Standard API with real-time calls
**Approach 2:** Batch API with structured output (JSON schema in tool_use)

Which approach and why?

- A) Approach 1 because it's simpler
- B) Approach 2 because batch API + tool_use ensures structured output at 50% cost with 24-hour latency
- C) They're equivalent; choose based on speed preference
- D) Neither approach supports structured output in batch mode

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Batch API with tool_use achieves the key goals: cost savings (50%), structured output (tool schemas), and acceptable latency (24hr for batch processing). Option A ignores cost/latency. Option C doesn't account for cost difference. Option D is false.

</details>

---

## Domain 5: Context Management & Reliability (15% — 9 questions)

### Question 51
**Domain:** Context Management & Reliability | **Difficulty:** Easy

You're debugging an agent's performance degradation. The agent had 4000 tokens of context early in its session, and now has only 500 tokens after 20 interactions.

What likely happened, and what's the fix?

- A) Tokens are being consumed by tool outputs; increase the model's max_tokens limit
- B) Conversation history is accumulating; implement context summarization or windowing to reduce history
- C) The model is leaking memory; restart the process
- D) This is normal; agents always lose context over time

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Conversation history accumulates over interactions, consuming context. Summarization or windowing (keeping only recent messages) solves this. Option A doesn't address context consumption. Option C is unnecessary. Option D is false; context loss is preventable.

</details>

---

### Question 52
**Domain:** Context Management & Reliability | **Difficulty:** Medium

You have a 200KB knowledge base and want to include it in prompt context. The context window is 200K tokens. What's the risk?

- A) No risk; the KB fits comfortably
- B) No room for user queries or tool outputs; the KB consumes too much context for a functional agent
- C) The KB will be compressed automatically
- D) Tokens and bytes are the same; 200KB = 200K tokens

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** A context window must reserve space for queries, reasoning, and tool outputs. Filling it entirely with static KB leaves no room for agent operation. Option A ignores practical space needs. Option C is false (no automatic compression). Option D conflates bytes and tokens.

</details>

---

### Question 53
**Domain:** Context Management & Reliability | **Difficulty:** Hard

You're implementing prompt caching to optimize repeated processing. Your setup:
- System prompt (static): "You are a code reviewer..."
- User prompt (variable): Different code samples

How should you structure caching for maximum efficiency?

- A) Cache both system and user prompts
- B) Cache only the system prompt and large static context; let user prompts stay uncached
- C) Don't cache; caching adds latency
- D) Cache everything except the system prompt

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Caching the static system prompt and reusing it across requests (with variable user prompts) maximizes cache hit rates. Caching variable content (user prompts) reduces hit efficiency. Option A wastes cache on non-reusable content. Option C is false (caching reduces API costs after 2-3 requests). Option D is backward.

</details>

---

### Question 54
**Domain:** Context Management & Reliability | **Difficulty:** Medium

You're choosing between claude-3.5-sonnet and claude-3-haiku for an agent that processes customer support tickets.

**Sonnet:** High reasoning, ~200K context window, higher cost
**Haiku:** Lower reasoning, ~200K context window, 1/5 the cost

Which should you choose and why?

- A) Always Sonnet; it's the best model
- B) Always Haiku; it's the cheapest
- C) Haiku if reasoning requirements are low; Sonnet if complex decision-making is needed
- D) They're equivalent; cost alone should determine choice

<details>
<summary>Show Answer</summary>

**Correct Answer: C)**

**Explanation:** Model choice depends on task complexity. Simple classification? Haiku. Complex analysis? Sonnet. Cost matters but shouldn't override capability needs. Options A and B are too absolute. Option D ignores capability differences.

</details>

---

### Question 55
**Domain:** Context Management & Reliability | **Difficulty:** Medium

An agent encounters a tool error: "Rate limit exceeded." The current retry strategy is: "Immediately retry the same request."

Why is this suboptimal, and what's a better approach?

- A) Retries never work; add human escalation instead
- B) Immediate retries will likely hit the same limit; use exponential backoff with increasing delays
- C) The strategy is fine; rate limits are temporary
- D) Disable the tool permanently

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Exponential backoff (delay before retry, increasing on subsequent attempts) respects rate limit recovery time. Immediate retries fail. Option A abandons retry entirely. Option C is naive. Option D is too severe.

</details>

---

### Question 56
**Domain:** Context Management & Reliability | **Difficulty:** Hard

You're designing escalation thresholds for an agent. It has three escalation levels:

1. **Retry with modified parameters** (auto)
2. **Human review** (if auto-retry fails 3x)
3. **Abort and report** (if human review unavailable)

Is this a good escalation strategy? What's missing?

- A) Yes, this is complete and optimal
- B) Good structure, but missing: error classification (retryable vs permanent errors determine escalation path)
- C) The threshold of 3 retries is arbitrary; increase it to 10
- D) Escalation strategies don't matter; agents should handle everything automatically

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Error classification is critical. A "permanent" error (auth failure) shouldn't trigger retries; it should escalate immediately. A "transient" error (timeout) warrants retry. The strategy above doesn't distinguish. Option A is incomplete. Option C is arbitrary. Option D ignores resilience principles.

</details>

---

### Question 57
**Domain:** Context Management & Reliability | **Difficulty:** Easy

When implementing human-in-the-loop in an agent, what's the best place to insert the approval gate?

- A) Before the agent starts (approval to proceed)
- B) After the agent generates an action plan (approval before execution)
- C) After execution (retrospective approval)
- D) Humans should never be in the loop

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Approving the plan before execution prevents mistakes from taking effect. Option A is too early (before the agent has a plan). Option C is too late (damage is done). Option D dismisses human oversight's value.

</details>

---

### Question 58
**Domain:** Context Management & Reliability | **Difficulty:** Medium

You're orchestrating a multi-agent handoff: Agent A processes a support ticket, then hands it to Agent B for resolution.

How should you structure the handoff to ensure no context is lost?

- A) Agent A completes its task; Agent B starts fresh with only the original ticket
- B) Agent A outputs its analysis; Agent B begins in a new fork_session with the analysis as input
- C) Keep both agents in the same session to share context
- D) Manually copy context between agent sessions

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Agent B needs A's analysis but runs in isolation (fork_session) to maintain independence. Passing output (not full history) preserves context while enabling independent reasoning. Option A loses A's work. Option C prevents isolation. Option D is manual and error-prone.

</details>

---

### Question 59
**Domain:** Context Management & Reliability | **Difficulty:** Hard

You're implementing structured logging for an agent system with multiple subagents. Each subagent produces logs; you need to correlate them for debugging.

What metadata should you include in each log entry?

- A) Just the log message; simplicity is key
- B) Timestamp, agent_id, session_id, task_id, and error details for correlation and auditing
- C) agent_id only; other info is redundant
- D) Full context of the agent's state (too much data, but complete)

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** This set of metadata enables tracing any log back to its source agent, session, and task. It's comprehensive without being excessive. Option A is too minimal. Option C (agent_id alone) doesn't enable correlation across systems. Option D is inefficient.

</details>

---

### Question 60
**Domain:** Context Management & Reliability | **Difficulty:** Hard

You're designing a retry strategy for an agent that calls a payment processing API. The API returns transient errors (timeouts) and permanent errors (invalid card).

What's the optimal retry strategy?

- A) Retry all errors up to 5 times with exponential backoff
- B) Classify errors: Retry transient errors with exponential backoff (max 3x); escalate permanent errors immediately to human review
- C) Never retry; escalate everything to humans
- D) Retry indefinitely until success

<details>
<summary>Show Answer</summary>

**Correct Answer: B)**

**Explanation:** Intelligent retries require error classification. Transient errors (timeout, connection reset) warrant retry; permanent errors (invalid card, auth failure) require escalation. Option A retries non-recoverable errors wastefully. Option C is overly conservative. Option D is dangerous (infinite loops, wasted resources).

</details>

---

## Answer Key & Scoring Guide

### Scoring
- **Passing Score:** 720/1000 (43 out of 60 questions correct = 72%)
- **Each question:** 1000 ÷ 60 = ~16.67 points

### Performance Interpretation
| Score | Interpretation |
|-------|---|
| 43-50 (71-84%) | PASS - Meets minimum competency |
| 51-54 (85-90%) | STRONG PASS - Above average competency |
| 55-60 (91-100%) | EXCELLENT - Expert-level mastery |
| <43 (<72%) | FAIL - Requires additional study |

### Domain Performance Analysis
After completing the test, analyze your domain-specific scores:

| Domain | Questions | Target Score to Pass |
|--------|-----------|---------------------|
| Agentic Architecture & Orchestration (27%) | 1-16 | ≥11 |
| Tool Design & MCP Integration (18%) | 17-27 | ≥8 |
| Claude Code Configuration (20%) | 28-39 | ≥9 |
| Prompt Engineering & Structured Output (20%) | 40-50 | ≥9 |
| Context Management & Reliability (15%) | 51-60 | ≥6 |

---

## Study Recommendations

**For weak domains:**
1. Review the failed questions and their explanations
2. Study the topic coverage in your exam prep course materials
3. Implement the concepts in a small practice project
4. Retake practice questions in that domain weekly

**For preparation:**
- Take this full test under timed conditions (90-120 minutes)
- Review all explanations, especially for questions you got right (to confirm your understanding)
- Focus on "Hard" difficulty questions if you're averaging >85%
- Build small projects applying each domain's concepts
- Join study groups to discuss edge cases and architectural trade-offs

**Additional resources:**
- Official Claude documentation (claude.ai/docs)
- Claude Code CLI tutorials
- MCP specification (modelcontextprotocol.io)
- Anthropic's prompt engineering guide

---

## Question Difficulty Reference

### Easy (20%) — Questions 1, 11, 17, 22, 27, 28, 34, 39, 46, 51, 57 (+1 more for 12 total)

### Medium (50%) — Questions 2, 3, 5, 6, 8, 10, 13, 15, 18, 19, 21, 23, 24, 26, 29, 30, 32, 33, 35, 37, 40, 41, 43, 45, 47, 49, 52, 54, 55, 58 (+5 more for 30 total)

### Hard (30%) — Questions 4, 7, 9, 12, 14, 16, 20, 25, 31, 36, 38, 42, 44, 48, 50, 53, 56, 59, 60 (+1 more for 18 total)

---

*Last updated: March 2026 | For exam format updates, consult official Anthropic certification guidelines*
