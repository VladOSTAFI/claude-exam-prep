# Module 4 — Tool Design & MCP Integration

> **Domain weight: 18%.**
> Estimated effort: ~2 hrs reading + 3 hrs hands-on (the biggest hands-on gap for most candidates).

---

## Why this domain matters

The exam tests **MCP server construction** and **tool design** at a level that's hard to fake from theory alone. If you've never built and shipped a stdio MCP server, you'll lose points on the trap questions about `console.log`, error categories, and the SSE → Streamable HTTP transition.

The mental model: **a tool description is the routing mechanism** — the model picks tools based on description text alone. Bad descriptions = wrong tool calls.

---

## Learning objectives

- Write tool descriptions the agent uses correctly without ambiguity.
- Design MCP error responses with structured categories the agent can act on.
- Build, run, and debug a TypeScript MCP server with stdio transport.
- Distinguish **tools** (actions) from **resources** (read-only context) from **prompts** (templates).
- Choose between **stdio** and **Streamable HTTP** transports per deployment scenario.

---

## Tool descriptions = the router

The model picks tools based on the description, not the name. A weak description means the agent will call the wrong tool, hallucinate arguments, or get stuck in a loop.

### Description anatomy

A good tool description includes:

1. **What it does** — one-line purpose
2. **What it returns** — shape and example
3. **Input format** — with at least one example
4. **Edge cases** — common pitfalls
5. **When to use vs. similar tools** — disambiguation

```ts
{
  name: "search_employees",
  description: `
    Search for employees by name, email, or employee ID.

    Returns: an array of { id, name, email, department, manager_id }.
    Returns an empty array if no matches.

    Input examples:
      { query: "alice@acme.com" }      // exact email
      { query: "Alice", limit: 5 }     // name prefix
      { query: "EMP-1234" }            // employee ID

    When to use vs. \`get_employee\`:
      - Use \`search_employees\` for partial/fuzzy lookup.
      - Use \`get_employee\` when you already have an exact ID.
  `.trim(),
  input_schema: { /* ... */ }
}
```

---

## Tool consolidation

| Anti-pattern | Better |
|---|---|
| `list_users()` + `list_events()` + `create_event()` | `schedule_event(user, time)` |
| `list_orders()` + `get_order()` + `update_order_status()` | `update_order_by_query(query, status)` |

**Rule of thumb:** aim for **4–5 well-described tools** per agent, not 18 fine-grained ones. Fewer tools means fewer routing decisions and shorter loops.

---

## Namespacing

Overlapping concepts across servers must be prefixed:

```
✅ asana_search, jira_search, github_search
❌ search (from asana), search (from jira)
```

The agent cannot reliably disambiguate two tools with the same name. Always prefix with the source system.

---

## MCP primitives — tools, resources, prompts

| Primitive | What it is | Example |
|---|---|---|
| **Tool** | An action with side effects | `create_invoice`, `transfer_funds`, `send_email` |
| **Resource** | Read-only context, addressable by URI | `catalog://services`, `schema://users-table` |
| **Prompt** | A reusable template the agent can invoke | `incident-triage(severity, service)` |

> **Exam trap:** if the agent just needs to **read** a catalog/schema, expose it as a **resource**, not a tool. Tools imply action.

---

## Structured errors

Generic strings like `"Operation failed"` are useless to the agent. Return structured errors so the agent can decide what to do.

```ts
// ✅ GOOD — agent can act on category and isRetryable
return {
  isError: true,
  content: [{
    type: "text",
    text: JSON.stringify({
      errorCategory: "transient",   // transient | validation | business | permission
      isRetryable: true,
      message: "Upstream API returned 503; retry after 2s.",
      retryAfterMs: 2000,
    }),
  }],
};

// ❌ BAD — agent has no signal what to do
return { isError: true, content: [{ type: "text", text: "Failed" }] };
```

### Error categories

| Category | Meaning | Retryable? |
|---|---|---|
| `transient` | Network blip, rate limit, 5xx | **Yes** (with backoff) |
| `validation` | Bad input from agent | **Sometimes** (after correction) |
| `business` | Rule violation (e.g., refund > limit) | **No** — escalate |
| `permission` | Unauthorized | **No** — escalate |

---

## Transports: stdio vs. Streamable HTTP

| Transport | Use for | Notes |
|---|---|---|
| **stdio** | Local processes (Claude Desktop, CLI) | Default for desktop. **Never `console.log`** — corrupts JSON-RPC. Use `console.error`. |
| **Streamable HTTP** | Remote servers, multi-tenant deployments | Replaced SSE in MCP spec **2025-03-26**. TS SDK supports it from **v1.10.0 (Apr 17, 2025)**. |

> **Exam trap:** SSE is **deprecated**. Choosing SSE for a new MCP server is a wrong answer.

### The `console.log` trap

In stdio mode, **stdout is the JSON-RPC channel**. Anything you write to stdout corrupts the protocol stream and breaks the server.

```ts
// ❌ BAD — corrupts the protocol
console.log("Server starting...");

// ✅ GOOD — diagnostics go to stderr
console.error("Server starting...");
```

This is verbatim from the official docs:
> *"For STDIO-based servers: Never use `console.log()`, as it writes to standard output (stdout) by default. Writing to stdout will corrupt the JSON-RPC messages and break your server."*

---

## `.mcp.json` configuration

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["./mcp-servers/weather/dist/index.js"],
      "env": {
        "WEATHER_API_KEY": "${WEATHER_API_KEY}"
      }
    },
    "asana": {
      "command": "npx",
      "args": ["-y", "@asana/mcp-server"],
      "env": {
        "ASANA_TOKEN": "${ASANA_TOKEN}"
      }
    }
  }
}
```

| Concern | Where it goes |
|---|---|
| Server registry (committed) | `.mcp.json` |
| Secrets | Env vars referenced from `.mcp.json` (never inline) |
| User-specific config | `~/.claude.json` (machine-local) |

---

## Reading queue

1. [Writing effective tools for AI agents](https://www.anthropic.com/engineering/writing-tools-for-agents) — Sept 2025; the canonical post
2. [MCP — build a server (TypeScript)](https://modelcontextprotocol.io/docs/develop/build-server)
3. [Streamable HTTP transport spec](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
4. [TypeScript SDK README](https://github.com/modelcontextprotocol/typescript-sdk)
5. [Reference servers](https://github.com/modelcontextprotocol/servers) — read the filesystem or fetch server for idioms
6. Skilljar — *Model Context Protocol: Advanced Topics* (sampling, notifications, production deployment)

---

## Hands-on exercise — three escalating builds

### Build A — Hello tool (45 min)

```bash
mkdir mcp-demo && cd mcp-demo
npm init -y
npm i @modelcontextprotocol/sdk zod
```

```json
// package.json
{ "type": "module" }
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "outDir": "dist"
  }
}
```

```ts
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server(
  { name: "demo", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const WordCountInput = z.object({ text: z.string() });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "word_count",
    description: "Count whitespace-separated words in the given text.",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
  }],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === "word_count") {
    const { text } = WordCountInput.parse(req.params.arguments);
    const count = text.trim().split(/\s+/).filter(Boolean).length;
    return { content: [{ type: "text", text: String(count) }] };
  }
  throw new Error(`Unknown tool: ${req.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);

// IMPORTANT — never console.log() on stdio.
console.error("MCP demo server listening on stdio");
```

### Build B — Real API + structured errors (60 min)

Add a `get_weather(city)` tool that calls a real weather API. Implement the four error categories:

```ts
function structuredError(
  category: "transient" | "validation" | "business" | "permission",
  message: string,
  isRetryable = false
) {
  return {
    isError: true,
    content: [{
      type: "text",
      text: JSON.stringify({ errorCategory: category, isRetryable, message }),
    }],
  };
}
```

Test how the agent reacts to each category. Confirm it retries on `transient + isRetryable: true` and escalates on `business`.

### Build C — Resource + prompt (60 min)

Add:

- A **resource** at URI `catalog://services` returning a markdown list.
- A **prompt** template `incident-triage(severity, service)`.

```ts
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{
    uri: "catalog://services",
    name: "Service catalog",
    mimeType: "text/markdown",
  }],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => ({
  contents: [{
    uri: req.params.uri,
    mimeType: "text/markdown",
    text: "# Services\n- payments\n- notifications\n- search",
  }],
}));
```

---

## Self-check

- [ ] I can write a tool description that includes purpose, return shape, an input example, edge cases, and a "when to use vs. X" line.
- [ ] I never use `console.log` in a stdio server.
- [ ] My errors carry an `errorCategory` and an `isRetryable` flag.
- [ ] I expose a resource (not a tool) when the agent just needs to *read* a catalog/schema.
- [ ] I namespace overlapping tools across multiple MCP servers.
- [ ] I know SSE was replaced by Streamable HTTP and which SDK version added it.

---

## Exam traps to reject

| Tempting wrong answer | Why it's wrong |
|---|---|
| "Ship 18 fine-grained tools so the agent has maximum flexibility" | Consolidate to 4–5; fewer routing decisions = better behavior |
| "Return `'Error: failed'` strings — the model will figure it out" | Structured errors with category + retryable |
| "Put status messages on stdout in a stdio server for visibility" | Corrupts JSON-RPC; use stderr |
| "Use SSE transport for new MCP servers" | Deprecated since 2025-03-26 |
| "Expose a `read_user_profile` tool when the data is read-only context" | That's a resource, not a tool |
| "Two tools called `search` from different servers — the agent will pick the right one" | It won't; namespace them |

---

## Decision tree: tool vs. resource vs. prompt

```
Does it have side effects (writes, sends, mutates)?
├─ Yes → Tool
└─ No → Is it addressable read-only data?
        ├─ Yes → Resource (URI)
        └─ No → Is it a reusable message template?
                └─ Yes → Prompt
```

---

## Production checklist

- [ ] Each tool description includes purpose, return shape, input example, edge cases, disambiguation
- [ ] Tool count ≤ 5 per agent (consolidate where possible)
- [ ] Cross-server tools are namespaced with a system prefix
- [ ] All errors return `errorCategory` + `isRetryable` + `message`
- [ ] Read-only data exposed as resources, not tools
- [ ] Stdio servers log to stderr only
- [ ] `.mcp.json` references env vars; secrets are never inline
- [ ] Streamable HTTP for remote servers, never SSE
