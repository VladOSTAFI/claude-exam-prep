import type { Quiz } from "@/types/quiz";

const quiz: Quiz = {
  slug: "tool-design-mcp",
  title: "Tool Design & MCP Integration",
  questions: [
    {
      id: "q1",
      prompt:
        "A stdio MCP server developer adds `console.log('Server ready')` to confirm the server started. What problem does this cause?",
      choices: [
        { id: "a", text: "The log message will appear in the Claude Desktop UI, which is confusing but not harmful." },
        { id: "b", text: "It writes to stdout, which is the JSON-RPC channel in stdio mode, corrupting the protocol stream and breaking the server." },
        { id: "c", text: "Node.js buffers stdout differently than stderr, causing intermittent delays." },
        { id: "d", text: "It triggers a PreToolUse hook that blocks the server initialization." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module quotes directly from the official docs: 'Never use `console.log()`, as it writes to standard output (stdout) by default. Writing to stdout will corrupt the JSON-RPC messages and break your server.' Diagnostics must go to `console.error()` (stderr) instead.",
    },
    {
      id: "q2",
      prompt:
        "Your agent needs read-only access to a service catalog that never changes during a session. How should you expose this data via MCP?",
      choices: [
        { id: "a", text: "As a `read_catalog` tool — tools are the universal MCP primitive for data access." },
        { id: "b", text: "As a Resource addressable by URI (e.g., `catalog://services`) — read-only context belongs in resources, not tools." },
        { id: "c", text: "As a Prompt template — prompts can carry static content the agent loads on demand." },
        { id: "d", text: "Embedded in the system prompt — static data is best placed in the system message to avoid extra round trips." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's decision tree states: 'If the agent just needs to read a catalog/schema, expose it as a resource, not a tool. Tools imply action.' Resources are read-only, addressable by URI, and semantically communicate that no side effects occur.",
    },
    {
      id: "q3",
      prompt:
        "A tool returns the error string `'Payment failed'` when the upstream payment API is temporarily down. Why is this inadequate?",
      choices: [
        { id: "a", text: "The string exceeds the maximum error length allowed by the MCP spec." },
        { id: "b", text: "The agent cannot determine whether to retry, escalate, or correct its input — it needs `errorCategory` and `isRetryable`." },
        { id: "c", text: "Error strings must be JSON-formatted; plain text is not a valid content type." },
        { id: "d", text: "The error should be thrown as an exception rather than returned as tool content." },
      ],
      correctChoiceId: "b",
      explanation:
        "Transient failures (like a 503 from an upstream API) are retryable, but the agent cannot know this from a generic string. The module requires structured errors with `errorCategory` ('transient' in this case), `isRetryable: true`, and a descriptive message so the agent can make an informed decision.",
    },
    {
      id: "q4",
      prompt:
        "You have two MCP servers — one from Asana and one from Jira — both exposing a tool named `search`. What is the risk and the correct fix?",
      choices: [
        { id: "a", text: "No risk — the MCP runtime automatically prefixes tools with the server name at dispatch time." },
        { id: "b", text: "The agent may pick the wrong `search` tool. Fix: namespace both tools (e.g., `asana_search`, `jira_search`)." },
        { id: "c", text: "Duplicate tool names are rejected by the MCP spec; the second server will fail to register." },
        { id: "d", text: "The risk is minimal since the agent uses the tool description, not the name, for routing." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module states: 'The agent cannot reliably disambiguate two tools with the same name. Always prefix with the source system.' Although descriptions help, identical names create ambiguity that cannot be fully resolved through descriptions alone.",
    },
    {
      id: "q5",
      prompt:
        "A new project requires a remote, multi-tenant MCP deployment. Which transport should you use?",
      choices: [
        { id: "a", text: "SSE (Server-Sent Events) — widely supported and simpler to implement than newer transports." },
        { id: "b", text: "stdio — always the most reliable MCP transport regardless of deployment model." },
        { id: "c", text: "Streamable HTTP — it replaced SSE in the MCP spec on 2025-03-26 and is supported from TS SDK v1.10.0." },
        { id: "d", text: "WebSocket — provides bidirectional streaming required for multi-tenant architectures." },
      ],
      correctChoiceId: "c",
      explanation:
        "SSE was deprecated in the MCP spec update of 2025-03-26 and choosing it for a new server is explicitly listed as a wrong answer in the module. Streamable HTTP is the correct transport for remote servers, and the TypeScript SDK has supported it since v1.10.0 (April 17, 2025). stdio is for local processes only.",
    },
    {
      id: "q6",
      prompt:
        "According to the module, what is the actual mechanism by which the model decides which tool to call?",
      choices: [
        { id: "a", text: "The tool's name and JSON schema — the description is metadata only." },
        { id: "b", text: "An embedding similarity match between the user request and the input schema." },
        { id: "c", text: "The tool description text — descriptions are the routing mechanism." },
        { id: "d", text: "The order in which tools are registered with the server." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's mental model is explicit: 'A tool description is the routing mechanism — the model picks tools based on description text alone. Bad descriptions = wrong tool calls.' Names and schemas matter, but the description is what drives routing.",
    },
    {
      id: "q7",
      prompt:
        "A teammate proposes shipping 18 fine-grained tools so the agent has 'maximum flexibility.' What does the module recommend instead, and why?",
      choices: [
        { id: "a", text: "Ship the 18 tools — more options give the agent finer control over each step." },
        { id: "b", text: "Aim for 4–5 well-described tools — fewer routing decisions and shorter loops produce better behavior." },
        { id: "c", text: "Ship exactly 10 tools — the MCP spec caps tool count at 10 per server." },
        { id: "d", text: "Split the 18 tools across multiple MCP servers so each server stays small." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's rule of thumb is: 'aim for 4–5 well-described tools per agent, not 18 fine-grained ones. Fewer tools means fewer routing decisions and shorter loops.' The 18-tool answer is explicitly listed in the exam-traps table.",
    },
    {
      id: "q8",
      prompt:
        "Which of the following is NOT one of the five elements the module says a good tool description should contain?",
      choices: [
        { id: "a", text: "What it does (one-line purpose)." },
        { id: "b", text: "What it returns (shape and example)." },
        { id: "c", text: "Estimated execution time and cost in tokens." },
        { id: "d", text: "When to use vs. similar tools (disambiguation)." },
      ],
      correctChoiceId: "c",
      explanation:
        "The 'Description anatomy' section lists exactly five elements: purpose, return shape, input format with example, edge cases, and when-to-use vs. similar tools. Execution time and token cost are not part of the recommended description structure.",
    },
    {
      id: "q9",
      prompt:
        "A refund request exceeds the company's refund-without-approval limit and the tool refuses it. Which error category should the tool return?",
      choices: [
        { id: "a", text: "transient — the agent can retry after a backoff." },
        { id: "b", text: "validation — the agent should correct its input and retry." },
        { id: "c", text: "permission — the agent should escalate to a human." },
        { id: "d", text: "business — a rule violation that is not retryable; escalate." },
      ],
      correctChoiceId: "d",
      explanation:
        "The module's error-categories table maps 'rule violation (e.g., refund > limit)' to the `business` category, marked as not retryable and requiring escalation. `permission` is for unauthorized callers, not policy violations.",
    },
    {
      id: "q10",
      prompt:
        "Where should secrets like `WEATHER_API_KEY` live for an MCP server registered in `.mcp.json`?",
      choices: [
        { id: "a", text: "Hard-coded inline inside `.mcp.json` so the configuration is fully reproducible across machines." },
        { id: "b", text: "In environment variables that `.mcp.json` references (e.g., `${WEATHER_API_KEY}`); never inline." },
        { id: "c", text: "In a `secrets` block at the top level of `.mcp.json`, which is automatically gitignored." },
        { id: "d", text: "Inside the system prompt so the agent can pass them to tools as needed." },
      ],
      correctChoiceId: "b",
      explanation:
        "The configuration table in the module is explicit: server registry goes in `.mcp.json` (committed), and secrets go in env vars referenced from `.mcp.json` — never inline. User-specific config lives in `~/.claude.json`.",
    },
    {
      id: "q11",
      prompt:
        "An MCP tool calls an upstream API that returns 503 due to a brief network blip. According to the module, how should the structured error be shaped?",
      choices: [
        { id: "a", text: "`errorCategory: 'permission'`, `isRetryable: false` — 5xx errors are unauthorized by default." },
        { id: "b", text: "`errorCategory: 'transient'`, `isRetryable: true`, with a `retryAfterMs` hint." },
        { id: "c", text: "`errorCategory: 'business'`, `isRetryable: true` — upstream failures violate business rules." },
        { id: "d", text: "Throw an exception so the runtime surfaces a stack trace to the agent." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's good example for an upstream 503 returns `errorCategory: 'transient'`, `isRetryable: true`, and `retryAfterMs: 2000`. The error-categories table maps network blips, rate limits, and 5xx to `transient` (retryable with backoff).",
    },
    {
      id: "q12",
      prompt:
        "Which MCP primitive is best described as 'a reusable message template the agent can invoke,' such as `incident-triage(severity, service)`?",
      choices: [
        { id: "a", text: "Tool" },
        { id: "b", text: "Resource" },
        { id: "c", text: "Prompt" },
        { id: "d", text: "Sampling" },
      ],
      correctChoiceId: "c",
      explanation:
        "The MCP-primitives table defines a Prompt as 'a reusable template the agent can invoke,' with `incident-triage(severity, service)` as the canonical example. Tools have side effects and Resources are read-only data addressable by URI.",
    },
    {
      id: "q13",
      prompt:
        "Following the module's decision tree, how do you classify a function that mutates state by sending an email?",
      choices: [
        { id: "a", text: "Resource — emails are addressable by URI (mailto://)." },
        { id: "b", text: "Tool — it has side effects (writes/sends/mutates)." },
        { id: "c", text: "Prompt — the email body is a reusable template." },
        { id: "d", text: "Sampling — email delivery requires the server to sample the model." },
      ],
      correctChoiceId: "b",
      explanation:
        "The decision tree's first branch asks 'Does it have side effects (writes, sends, mutates)?' If yes, it is a Tool. `send_email` is given as one of the canonical Tool examples in the primitives table.",
    },
    {
      id: "q14",
      prompt:
        "An agent has `list_users()`, `list_events()`, and `create_event()`. The module describes this as an anti-pattern. What is the recommended consolidation?",
      choices: [
        { id: "a", text: "Merge all three into a single `manage_calendar(action, args)` dispatcher tool." },
        { id: "b", text: "Replace them with a single `schedule_event(user, time)` tool." },
        { id: "c", text: "Keep them but namespace each (e.g., `cal_list_users`)." },
        { id: "d", text: "Convert all three to resources to eliminate routing decisions." },
      ],
      correctChoiceId: "b",
      explanation:
        "The tool-consolidation table lists exactly this case: `list_users()` + `list_events()` + `create_event()` should consolidate into `schedule_event(user, time)`. The goal is fewer, more semantically meaningful tools.",
    },
    {
      id: "q15",
      prompt:
        "Why does the module say SSE is the wrong choice for a brand-new MCP server?",
      choices: [
        { id: "a", text: "SSE has never been part of the MCP spec." },
        { id: "b", text: "SSE was deprecated by the MCP spec on 2025-03-26 and replaced by Streamable HTTP." },
        { id: "c", text: "SSE only works with Python servers, not TypeScript." },
        { id: "d", text: "SSE requires WebSocket fallback in browsers, doubling deployment complexity." },
      ],
      correctChoiceId: "b",
      explanation:
        "The transports table and exam-traps table both state that SSE was replaced by Streamable HTTP in MCP spec 2025-03-26, and 'Choosing SSE for a new MCP server is a wrong answer.' Streamable HTTP has been in the TS SDK since v1.10.0.",
    },
    {
      id: "q16",
      prompt:
        "Which line in a stdio MCP server is safe and which corrupts the protocol?",
      choices: [
        { id: "a", text: "`console.log('starting')` is safe; `console.error('starting')` corrupts the protocol." },
        { id: "b", text: "Both `console.log` and `console.error` corrupt the protocol — use the SDK logger." },
        { id: "c", text: "`console.error('starting')` is safe (stderr); `console.log('starting')` corrupts the protocol (stdout)." },
        { id: "d", text: "Neither is unsafe — the SDK intercepts both to route them away from JSON-RPC." },
      ],
      correctChoiceId: "c",
      explanation:
        "In stdio mode, stdout is the JSON-RPC channel. `console.log` writes to stdout and corrupts the protocol; `console.error` writes to stderr and is safe for diagnostics. The module's good/bad example pair shows exactly this distinction.",
    },
    {
      id: "q17",
      prompt:
        "Which TypeScript SDK version first added support for the Streamable HTTP transport, according to the module?",
      choices: [
        { id: "a", text: "v0.9.0, released January 2025." },
        { id: "b", text: "v1.0.0, released alongside the original MCP launch." },
        { id: "c", text: "v1.10.0, released April 17, 2025." },
        { id: "d", text: "v2.0.0, released after the SSE deprecation." },
      ],
      correctChoiceId: "c",
      explanation:
        "The transports table is explicit: 'Streamable HTTP ... TS SDK supports it from v1.10.0 (Apr 17, 2025).' This pairs with the MCP spec deprecation of SSE on 2025-03-26.",
    },
    {
      id: "q18",
      prompt:
        "In Build A, the demo server is constructed with which capability declaration?",
      choices: [
        { id: "a", text: "`{ capabilities: { resources: {}, prompts: {} } }`" },
        { id: "b", text: "`{ capabilities: { tools: {} } }`" },
        { id: "c", text: "`{ capabilities: { sampling: {}, tools: {} } }`" },
        { id: "d", text: "`{ capabilities: 'all' }`" },
      ],
      correctChoiceId: "b",
      explanation:
        "Build A constructs the Server with `{ name: 'demo', version: '0.1.0' }` and `{ capabilities: { tools: {} } }` because it only exposes a single `word_count` tool. Resources and prompts are added later in Build C.",
    },
    {
      id: "q19",
      prompt:
        "A user asks the agent to look up an employee whose exact ID is `EMP-1234`. The agent has both `search_employees` and `get_employee`. Which tool should fire, given the module's example descriptions?",
      choices: [
        { id: "a", text: "`search_employees` — it is the more general tool and always preferable." },
        { id: "b", text: "`get_employee` — the description disambiguates: use it 'when you already have an exact ID.'" },
        { id: "c", text: "Both, in parallel — fan-out queries reduce ambiguity." },
        { id: "d", text: "Neither — exact-ID lookups should be exposed as a resource (e.g., `employee://EMP-1234`)." },
      ],
      correctChoiceId: "b",
      explanation:
        "The example description's 'When to use vs. `get_employee`' line is the disambiguation: `search_employees` for partial/fuzzy lookup, `get_employee` for exact IDs. This is precisely why the module insists on a 'when to use vs. similar tools' line in every description.",
    },
    {
      id: "q20",
      prompt:
        "User-specific MCP configuration that should NOT be committed to a shared repo belongs in which file, per the module?",
      choices: [
        { id: "a", text: "`.mcp.json` at the project root." },
        { id: "b", text: "`~/.claude.json` (machine-local)." },
        { id: "c", text: "`package.json` under an `mcp` field." },
        { id: "d", text: "An `.env` file checked into the repo." },
      ],
      correctChoiceId: "b",
      explanation:
        "The configuration table separates concerns: server registry (committed) goes in `.mcp.json`, secrets go in env vars referenced from `.mcp.json`, and user-specific config lives in `~/.claude.json` (machine-local). Committing an `.env` defeats the purpose of env-var indirection.",
    },
  ],
};

export default quiz;
