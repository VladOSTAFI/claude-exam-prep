# Module 2: Tool Design & MCP Integration

**Exam Weight: 18% | 5 Task Statements | Estimated Study Time: 4-5 hours**

---

## Overview

This module covers the critical architectural decisions around tool design, MCP server integration, and agent tool distribution. Tools are the primary mechanism through which Claude interacts with external systems, and poor tool design leads to misrouting, errors, and inefficient agent behavior. This module focuses on making tools work reliably at scale.

---

## Task 2.1: Design Effective Tool Interfaces with Clear Descriptions and Boundaries

### Core Concept

**Tool descriptions are the primary mechanism LLMs use for tool selection.** Claude analyzes descriptions to decide which tool to invoke. Ambiguous or overlapping descriptions cause the wrong tool to be selected, leading to routing failures and wasted API calls.

### Key Principles

#### 1. Tool Descriptions Must Be Unambiguous
The description is the entire decision point. It must distinguish the tool from others with similar names or purposes.

**Problem Example:**
```json
{
  "name": "analyze_content",
  "description": "Analyzes content"
}
```

This description doesn't explain what type of content, when to use this vs other analysis tools, or what the output represents.

**Better Example:**
```json
{
  "name": "analyze_content",
  "description": "Analyzes textual content for sentiment, topics, and key entities. Use this for unstructured text analysis like emails, reviews, or chat messages. Returns sentiment score (-1 to 1), identified topics (list), and named entities. Do NOT use for structured data or document metadata extraction."
}
```

#### 2. Include Input Formats and Example Queries
Developers must understand what inputs the tool accepts and in what format.

**Example Tool Definition:**

```json
{
  "name": "search_database",
  "description": "Searches product database by category and price range. Returns matching products with name, SKU, price, and availability. Requires exact category name from predefined list: 'Electronics', 'Clothing', 'Books', 'Home'. Optional price_max parameter (number, USD). Example queries: 'Find all Electronics under $100', 'What Books are available?'",
  "input_schema": {
    "type": "object",
    "properties": {
      "category": {
        "type": "string",
        "description": "Exact category name: Electronics, Clothing, Books, or Home",
        "enum": ["Electronics", "Clothing", "Books", "Home"]
      },
      "price_max": {
        "type": "number",
        "description": "Maximum price in USD (optional). Only applies to Electronics and Home categories.",
        "minimum": 0
      }
    },
    "required": ["category"]
  }
}
```

#### 3. Explain Edge Cases and Boundaries
Clearly state what the tool does NOT do and when NOT to use it.

**Example Edge Cases Section in Description:**

```
"description": "Retrieves user profile information from the CRM system. Returns name, email, account status, and last login date. DOES NOT return purchase history (use get_purchase_history for that). DOES NOT return personal contact preferences stored separately (use get_contact_preferences). Will return 'inactive' for deactivated accounts. Returns null for fields that have never been set. Maximum query rate: 100 calls per minute."
```

#### 4. Tool Naming Impact on Selection
Overlapping or generic names cause misrouting. Tool names should be specific and distinct.

**Problem Naming:**
- `analyze` - too generic
- `get_info` - overlaps with many tools
- `process` - unclear purpose

**Better Naming:**
- `analyze_sentiment` - specific action and domain
- `get_customer_contact_info` - explicit data type
- `process_payment_request` - specific operation

### System Prompt Wording Impact

The system prompt affects tool selection by establishing context for when tools should be used.

**Example System Prompt Impact:**

```
Poor System Prompt:
"You have access to tools. Use them when needed."

Better System Prompt:
"For customer inquiries, always check the CRM first using get_customer_info.
For order questions, use get_order_status, not search_database.
For technical issues, escalate to support_ticket, do not attempt to resolve using documentation_search."
```

### Best Practices

1. **One tool, one purpose**: Each tool should have a single, well-defined responsibility
2. **Descriptive names match descriptions**: The name should give away the purpose
3. **Explicit boundaries**: State what the tool does NOT do
4. **Include constraints**: Rate limits, maximum results, required vs optional parameters
5. **Provide examples**: Show expected queries and outputs
6. **Use enums for categories**: When tools accept specific values, use enums in the schema

### Common Failure Patterns

| Problem | Symptom | Solution |
|---------|---------|----------|
| Overlapping descriptions | Tool misrouting to wrong function | Rename tools, add exclusionary language to descriptions |
| Generic names | Ambiguity between similar tools | Use qualifiers: `analyze_sentiment` not `analyze` |
| Missing edge cases | Tool used incorrectly for unsupported cases | Explicitly state limitations and edge cases |
| Unclear input format | Incorrect parameters passed | Include example queries and enum values |
| No boundaries explained | Tool used for wrong purpose | Add "DO NOT use this for..." statements |

---

## Task 2.2: Implement Structured Error Responses for MCP Tools

### Core Concept

**MCP tools must return structured error information**, not just failure messages. Claude needs to understand the error category to decide whether to retry, escalate, or inform the user.

### MCP isError Flag Pattern

Every tool response should indicate success or failure using the `isError` flag.

**Basic MCP Response Structure:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "Operation result or error details"
    }
  ],
  "isError": false
}
```

**Success Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "User profile retrieved successfully. Name: John Doe, Email: john@example.com, Status: Active"
    }
  ],
  "isError": false
}
```

**Error Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Database connection timeout. This is a transient error. Please retry in 5 seconds."
    }
  ],
  "isError": true
}
```

### Error Categories and Handling

Not all errors are equal. Claude needs to understand the error type to respond appropriately.

#### 1. Transient Errors (Retryable)
Temporary failures that may succeed on retry.

**Examples:** Network timeouts, rate limiting, temporary service unavailability

**Response Pattern:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "ERROR [Transient]: Database service temporarily unavailable. Error Code: DB_TIMEOUT. Retryable: true. Retry after 3 seconds."
    }
  ],
  "isError": true
}
```

**Claude Behavior:** Waits and retries the operation

#### 2. Validation Errors (Non-Retryable, User Action Required)
Invalid input that requires user correction.

**Examples:** Invalid email format, missing required parameter, out-of-range value

**Response Pattern:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "ERROR [Validation]: Invalid phone number format. Expected: +1XXXXXXXXXX or (XXX) XXX-XXXX. Received: '123'. Retryable: false."
    }
  ],
  "isError": true
}
```

**Claude Behavior:** Reports error to user and asks for correction

#### 3. Business Rule Errors (Non-Retryable, Expected Outcome)
Operation failed due to business logic, not a system failure.

**Examples:** Insufficient account balance, duplicate record, permission denied, resource not found

**Response Pattern:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "ERROR [Business Rule]: Cannot process refund. Order is outside 30-day return window (Order date: 2024-06-01, Current date: 2025-01-15). Retryable: false. Contact support for exceptions."
    }
  ],
  "isError": true
}
```

**Claude Behavior:** Explains situation to user, suggests alternatives

#### 4. Permission Errors (Non-Retryable, Access Issue)
User lacks required permissions for operation.

**Examples:** Insufficient privileges, authentication required, resource access denied

**Response Pattern:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "ERROR [Permission]: User does not have permission to access admin_reports. Required role: Admin. Current role: Analyst. Retryable: false. Contact admin@company.com to request access."
    }
  ],
  "isError": true
}
```

**Claude Behavior:** Explains permission issue and suggests escalation

### Structured Error Metadata

Return detailed error information to enable Claude to make appropriate decisions.

**TypeScript Example - Error Response Structure:**

```typescript
interface ToolError {
  errorCategory: 'transient' | 'validation' | 'business' | 'permission' | 'system';
  isRetryable: boolean;
  errorCode: string;
  humanMessage: string;
  technicalDetails?: string;
  suggestedAction?: string;
  retryAfterSeconds?: number;
}

function formatErrorResponse(error: ToolError): MCP_Response {
  const errorString = [
    `ERROR [${error.errorCategory.toUpperCase()}]`,
    error.humanMessage,
    `Code: ${error.errorCode}`,
    `Retryable: ${error.isRetryable}`,
    error.suggestedAction && `Suggested action: ${error.suggestedAction}`,
    error.retryAfterSeconds && `Retry after: ${error.retryAfterSeconds}s`,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    content: [{ type: 'text', text: errorString }],
    isError: true,
  };
}

// Example usage
const dbTimeout: ToolError = {
  errorCategory: 'transient',
  isRetryable: true,
  errorCode: 'DB_TIMEOUT',
  humanMessage: 'Database connection timeout',
  technicalDetails: 'Connection pool exhausted, waiting for available connection',
  retryAfterSeconds: 5,
};

console.log(formatErrorResponse(dbTimeout));
// Output:
// ERROR [TRANSIENT] | Database connection timeout | Code: DB_TIMEOUT | Retryable: true | Retry after: 5s
```

### Distinguishing Valid Empty Results from Errors

A tool returning no results is NOT an error—it's a valid outcome.

**Problem Response:**
```json
{
  "content": [{ "type": "text", "text": "ERROR: No users found matching criteria" }],
  "isError": true
}
```

**Correct Response:**
```json
{
  "content": [{ "type": "text", "text": "Search completed successfully. No users found matching criteria: department=Engineering AND location=Remote." }],
  "isError": false
}
```

### Why Uniform Error Responses Fail

**Bad Practice:**
```json
{
  "content": [{ "type": "text", "text": "Operation failed" }],
  "isError": true
}
```

Claude cannot determine:
- Should this be retried?
- Is this the user's fault or the system's?
- What action should be taken?
- Should the user be informed?

### Best Practices

1. **Always use isError flag correctly**: Distinguish success from failure
2. **Include error categories**: Transient, validation, business, permission
3. **Mark retryability explicitly**: `isRetryable: true/false`
4. **Provide human-readable messages**: For user communication
5. **Include error codes**: For debugging and documentation
6. **Suggest actions**: Tell Claude how to recover or escalate
7. **Set retry delays**: For transient errors, specify backoff time

---

## Task 2.3: Distribute Tools Appropriately Across Agents and Configure Tool Choice

### Core Concept

**Tool selection reliability degrades with quantity.** An agent with 18 tools will misroute more often than an agent with 4-5 tools. Additionally, agents should only have access to tools relevant to their role.

### Tool Quantity Impact on Reliability

Research and empirical data show clear degradation:

| Tool Count | Routing Accuracy | Misroute Rate | Recommendation |
|-----------|-----------------|---------------|----------------|
| 3-5 tools | 95-98% | 2-5% | Optimal |
| 6-10 tools | 85-92% | 8-15% | Acceptable with discipline |
| 11-15 tools | 75-85% | 15-25% | Problematic |
| 16+ tools | 60-75% | 25-40% | High failure rate |

**Example Degradation:**

An agent with 18 tools including:
- `search_database`, `search_documentation`, `search_customer_records`
- `analyze_data`, `analyze_content`, `analyze_logs`
- `create_ticket`, `create_order`, `create_report`

When asked "analyze customer sentiment," the agent may:
- Choose `analyze_content` (possibly correct)
- Choose `analyze_data` (if customer data is framed as data)
- Choose `analyze_logs` (incorrect)
- Miss that it should use `search_customer_records` first

**Same agent with 4 role-specific tools:**
- `search_customer_records`
- `analyze_customer_sentiment`
- `create_support_ticket`
- `get_customer_metrics`

Selection is unambiguous. The correct tool is obvious.

### Role-Based Tool Scoping

Each agent should only have tools for its specialization.

**Example: Customer Support Agent**

✅ Correct Tools:
```json
{
  "agent": "customer_support",
  "tools": [
    "get_customer_info",
    "get_order_status",
    "create_support_ticket",
    "search_knowledge_base",
    "get_refund_policy"
  ]
}
```

❌ Problematic Tools:
```json
{
  "agent": "customer_support",
  "tools": [
    "get_customer_info",
    "get_order_status",
    "create_support_ticket",
    "search_knowledge_base",
    "get_refund_policy",
    "update_inventory",      // Not customer support
    "process_payment",        // Finance/payments team
    "create_marketing_campaign", // Marketing team
    "run_analytics_report",   // Data analytics
    "deploy_to_production"    // DevOps
  ]
}
```

### Tool Choice Options: auto, any, forced

MCP and Claude API support different `tool_choice` configurations for different scenarios.

#### 1. tool_choice: "auto" (Default)
Claude decides whether to use tools at all.

**Use Case:** General-purpose agents that may not need tools for every query

**Example:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "messages": [{ "role": "user", "content": "What is the capital of France?" }],
  "tools": [
    {
      "name": "search_database",
      "description": "Searches product database"
    }
  ],
  "tool_choice": "auto"
}
```

Claude may respond directly without using the tool (correct behavior).

#### 2. tool_choice: "any"
Claude must use at least one tool (if provided) but can choose which one.

**Use Case:** Agents that should always attempt tool use for data gathering

**Example:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "messages": [{ "role": "user", "content": "Get my account balance" }],
  "tools": [
    {
      "name": "get_account_balance",
      "description": "Returns current account balance"
    }
  ],
  "tool_choice": "any"
}
```

Claude will always invoke a tool, ensuring real-time data retrieval instead of hallucinating a balance.

#### 3. Forced Tool Selection
Claude must use a specific tool.

**Use Case:** Workflows where a specific tool must run regardless of query content

**Example (Anthropic Format):**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "messages": [{ "role": "user", "content": "Check if order #12345 is in stock" }],
  "tools": [
    {
      "name": "check_inventory",
      "description": "Checks stock levels"
    },
    {
      "name": "get_order_details",
      "description": "Retrieves order information"
    }
  ],
  "tool_choice": {
    "type": "tool",
    "name": "check_inventory"
  }
}
```

Claude will invoke `check_inventory` specifically.

### Strategies for Reducing Tool Overload

#### Strategy 1: Split Generic Tools into Specialized Ones

**Before (5 overlapping tools causing misrouting):**
```json
{
  "tools": [
    {
      "name": "search",
      "description": "Search for information"
    },
    {
      "name": "analyze",
      "description": "Analyze information"
    },
    {
      "name": "retrieve",
      "description": "Retrieve data"
    },
    {
      "name": "process",
      "description": "Process information"
    },
    {
      "name": "generate",
      "description": "Generate output"
    }
  ]
}
```

**After (specialized, non-overlapping tools):**
```json
{
  "tools": [
    {
      "name": "search_customer_records",
      "description": "Search customer database by name, email, or account ID"
    },
    {
      "name": "analyze_purchase_history",
      "description": "Analyze past purchases for patterns and preferences"
    },
    {
      "name": "calculate_customer_lifetime_value",
      "description": "Calculate CLV based on purchase history and demographics"
    },
    {
      "name": "generate_personalized_recommendation",
      "description": "Generate product recommendations based on customer analysis"
    }
  ]
}
```

#### Strategy 2: Restrict Subagent Tool Sets

In agentic workflows, each subagent gets only its domain tools.

**Example Multi-Agent Architecture:**

```typescript
interface Agent {
  name: string;
  role: string;
  tools: Tool[];
  toolChoice: 'auto' | 'any' | { type: 'tool'; name: string };
}

const customerServiceAgent: Agent = {
  name: 'CustomerServiceAgent',
  role: 'Customer Support',
  tools: [
    { name: 'get_customer_info', description: '...' },
    { name: 'get_order_status', description: '...' },
    { name: 'create_support_ticket', description: '...' },
  ],
  toolChoice: 'auto',
};

const orderAgent: Agent = {
  name: 'OrderAgent',
  role: 'Order Management',
  tools: [
    { name: 'get_order_details', description: '...' },
    { name: 'update_order_status', description: '...' },
    { name: 'process_order_cancellation', description: '...' },
    { name: 'calculate_shipping', description: '...' },
  ],
  toolChoice: 'auto',
};

const billingAgent: Agent = {
  name: 'BillingAgent',
  role: 'Billing & Payments',
  tools: [
    { name: 'get_invoice', description: '...' },
    { name: 'process_refund', description: '...' },
    { name: 'get_payment_history', description: '...' },
    { name: 'update_billing_address', description: '...' },
  ],
  toolChoice: 'auto',
};
```

#### Strategy 3: Provide Constrained Cross-Role Tools

When agents need cross-domain access, make tools specific to the interaction.

**Example: Customer Service Agent Needs Billing Access**

Instead of giving full billing tool access:
```json
{
  "name": "get_billing_info",
  "description": "Get customer billing information for customer support context"
}
```

Create a constrained version:
```json
{
  "name": "get_customer_billing_summary",
  "description": "Get customer's current balance and next payment date. Use only for context in customer support conversations. Does NOT allow refunds or payment processing (use escalate_to_billing agent for that)."
}
```

### Tool Choice Configuration Best Practices

| Scenario | tool_choice | Rationale |
|----------|------------|-----------|
| General assistant, queries may not need tools | `auto` | Allows natural conversation without forced tool use |
| Agent that MUST use tools to get fresh data | `any` | Ensures real-time data retrieval |
| Specific workflow requiring exact tool | `{ type: 'tool', name: '...' }` | Guarantees specific operation |
| Data retrieval agent | `any` | Always attempt to fetch current data |
| Analysis agent with optional tools | `auto` | Use tools if beneficial |
| Integration agent | `any` | Always attempt integration actions |

### Common Mistakes and Fixes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Agent with 25+ tools | High misrouting rate | Split into specialized subagents |
| Generic tool names | Ambiguous selection | Rename to specific purpose |
| No tool_choice configuration | Default to `auto` may miss data | Set `tool_choice: "any"` for data agents |
| Giving admin tools to user-facing agents | Security risk + misrouting | Restrict tools to agent role |
| Tools outside agent specialization | Wrong tool selection | Scope tools to agent domain |

---

## Task 2.4: Integrate MCP Servers into Claude Code and Agent Workflows

### Core Concept

**MCP (Model Context Protocol) servers expose tools and resources to Claude.** MCP integration happens at project or user level, making tools available to Claude Code and agents. Tools from all connected MCP servers are available simultaneously.

### MCP Server Scoping: Project vs User Level

#### Project-Level Configuration (.mcp.json)
Tools available to this project only, stored in version control.

**Location:** `{project_root}/.mcp.json`

**Use Case:** Project-specific tools, shared across team, version controlled

**Example .mcp.json:**
```json
{
  "mcpServers": {
    "internal-api": {
      "command": "node",
      "args": ["./mcp-servers/internal-api/server.js"],
      "env": {
        "API_KEY": "${INTERNAL_API_KEY}",
        "API_ENDPOINT": "https://internal-api.company.com"
      }
    },
    "project-database": {
      "command": "python",
      "args": ["./mcp-servers/db/server.py"],
      "env": {
        "DB_CONNECTION_STRING": "${PROJECT_DB_URI}"
      }
    }
  }
}
```

#### User-Level Configuration (~/.claude.json)
Tools available to all projects, stored locally (not in version control).

**Location:** `~/.claude.json` (user's home directory)

**Use Case:** Personal tools, local development, credentials not shared with team

**Example ~/.claude.json:**
```json
{
  "mcpServers": {
    "github-personal": {
      "command": "node",
      "args": ["/Users/dev/mcp-servers/github/server.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_PERSONAL_TOKEN}"
      }
    },
    "local-filesystem": {
      "command": "python",
      "args": ["/Users/dev/mcp-servers/fs/server.py"],
      "env": {
        "BASE_PATH": "/Users/dev/projects"
      }
    },
    "anthropic-docs": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/docs-mcp"]
    }
  }
}
```

### Environment Variable Expansion for Credentials

MCP configurations use `${VAR_NAME}` syntax for environment variable expansion, allowing credentials to be injected at runtime.

**Example With Environment Variables:**

```json
{
  "mcpServers": {
    "database": {
      "command": "python",
      "args": ["./mcp-servers/db/main.py"],
      "env": {
        "DB_HOST": "db.company.com",
        "DB_PORT": "5432",
        "DB_NAME": "production_db",
        "DB_USER": "${DB_USER}",
        "DB_PASSWORD": "${DB_PASSWORD}",
        "DB_SSL_CERT": "${DB_SSL_CERT_PATH}"
      }
    },
    "external-api": {
      "command": "node",
      "args": ["./mcp-servers/api/index.js"],
      "env": {
        "API_KEY": "${EXTERNAL_API_KEY}",
        "API_SECRET": "${EXTERNAL_API_SECRET}",
        "WEBHOOK_URL": "${WEBHOOK_ENDPOINT}"
      }
    }
  }
}
```

**Setting Environment Variables:**

```bash
# Set for current session
export DB_USER="dbuser"
export DB_PASSWORD="dbpass123"
export EXTERNAL_API_KEY="key_abc123"

# Run Claude Code (MCP servers read these variables)
claude --config .mcp.json

# Or set in .env file (read by Claude Code)
# .env file (NEVER commit this):
# DB_USER=dbuser
# DB_PASSWORD=dbpass123
# EXTERNAL_API_KEY=key_abc123
```

### Tools Available Simultaneously

When multiple MCP servers are configured, all their tools are available to Claude at the same time.

**Example Multi-Server Setup:**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/github-mcp"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/slack-mcp"],
      "env": { "SLACK_BOT_TOKEN": "${SLACK_TOKEN}" }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/filesystem-mcp"]
    }
  }
}
```

**Available Tools (all at once):**
- From github: `search_issues`, `create_issue`, `comment_on_issue`, `get_pull_request`, etc.
- From slack: `post_message`, `read_channel`, `list_channels`, `create_message_thread`, etc.
- From filesystem: `read_file`, `write_file`, `list_directory`, `search_files`, etc.

Claude can seamlessly use tools across servers in a single interaction:
1. Use `search_issues` to find GitHub issue
2. Use `post_message` to notify Slack channel
3. Use `read_file` to check local configuration

### MCP Resources for Exposing Content Catalogs

MCP Resources expose content collections that Claude can browse and reference.

**Resource Types:**
- Document collections (docs, wikis, knowledge bases)
- Configuration catalogs
- Schema repositories
- Policy documents

**Example Resource Definition (TypeScript):**

```typescript
interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  contents?: string;
}

// MCP Server exposing documentation
const docsResource: Resource = {
  uri: 'docs://anthropic/claude-api',
  name: 'Claude API Documentation',
  description: 'Official Claude API reference and guides',
  mimeType: 'text/markdown'
};

const toolsResource: Resource = {
  uri: 'docs://company/tools-catalog',
  name: 'Company Tools Catalog',
  description: 'All available internal tools with descriptions and examples',
  mimeType: 'text/markdown'
};
```

**Claude reads resources with:**
```
"I need to review the available tools from the company tools catalog.
Claude will automatically access docs://company/tools-catalog resource
and use it to understand what tools are available."
```

### Choosing Community vs Custom MCP Servers

#### Community MCP Servers (Pre-built)

**Advantages:**
- Ready to use
- Maintained by Anthropic or community
- Well-documented
- Tested across many users

**Example Community Servers:**
- `@anthropic-ai/github-mcp` - GitHub integration
- `@anthropic-ai/slack-mcp` - Slack integration
- `@anthropic-ai/docs-mcp` - Documentation search
- `@anthropic-ai/web-mcp` - Web scraping and fetching

**Configuration:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/github-mcp"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

#### Custom MCP Servers (Organization-specific)

**Advantages:**
- Tailored to specific needs
- Control over tool behavior
- Can integrate proprietary systems
- Version controlled in your repo

**Basic Custom MCP Server Example (Node.js):**

```typescript
// mcp-servers/custom-crm/server.ts
import Anthropic from '@anthropic-ai/sdk';

const server = new Anthropic.Server({
  name: 'custom-crm',
  version: '1.0.0',
});

// Register tools
server.tool('get_customer', {
  description: 'Get customer information by ID',
  inputSchema: {
    type: 'object' as const,
    properties: {
      customer_id: {
        type: 'string',
        description: 'Unique customer identifier',
      },
    },
    required: ['customer_id'],
  },
  handler: async (input: { customer_id: string }) => {
    // Call internal CRM API
    const response = await fetch(
      `https://crm.company.com/api/customers/${input.customer_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CRM_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Customer not found. Status: ${response.status}`,
          },
        ],
        isError: true,
      };
    }

    const customer = await response.json();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(customer, null, 2),
        },
      ],
      isError: false,
    };
  },
});

// Register resources
server.resource('crm://schema/customer', {
  description: 'Customer data schema',
  mimeType: 'application/json',
  handler: async () => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          id: 'string',
          name: 'string',
          email: 'string',
          status: 'active|inactive|suspended',
        }),
      },
    ],
  }),
});

// Start server
server.start();
```

**Project Configuration Using Custom Server:**

```json
{
  "mcpServers": {
    "custom-crm": {
      "command": "npx",
      "args": ["ts-node", "./mcp-servers/custom-crm/server.ts"],
      "env": {
        "CRM_API_KEY": "${CRM_API_KEY}",
        "CRM_ENDPOINT": "https://crm.company.com"
      }
    }
  }
}
```

### Best Practices for MCP Integration

1. **Use project-level .mcp.json for team tools**: Version controlled, consistent
2. **Use ~/.claude.json for personal/local tools**: Not shared, credentials safe
3. **Environment variables for secrets**: Never hardcode credentials
4. **Clear tool descriptions**: Essential for tool selection
5. **Expose resources for catalogs**: Make knowledge discoverable
6. **Test MCP connections**: Ensure tools are accessible
7. **Document custom servers**: Include usage examples
8. **Monitor tool performance**: Track MCP server latency
9. **Version your servers**: Tag releases, manage updates
10. **Error handling in servers**: Return structured errors (from Task 2.2)

---

## Task 2.5: Select and Apply Built-in Tools Effectively

### Core Concept

Claude Code provides built-in tools for common operations. Understanding when to use each tool, and how they interact, is critical for efficient codebase analysis and modification.

### Built-in Tool Overview

| Tool | Purpose | Best For | Not For |
|------|---------|----------|---------|
| **Grep** | Content search with regex | Finding code patterns, locating usage | Filename matching |
| **Glob** | File path pattern matching | Finding files by name/extension | Content search |
| **Read** | Read complete file contents | Understanding full file structure | Large files (limit to sections) |
| **Write** | Create or overwrite files | Creating new files | Modifying existing files |
| **Edit** | Targeted modifications | Changing specific sections | When you haven't read the file first |
| **Bash** | Execute shell commands | Running tests, builds, git operations | Complex file operations (use Read/Write/Edit instead) |

### Grep: Content Search with Regex

**Purpose:** Search for patterns in file contents

**Best Used For:**
- Finding function definitions: `function\s+myFunc\(`
- Locating all imports: `^import\s+`
- Finding error messages: `throw new Error`
- Tracking variable usage: `myVariable\s*[=\(]`

**Example 1: Find All TODO Comments**

```bash
# Search for TODO comments
grep -r "TODO" --include="*.js" src/
# or with Grep tool:
# Pattern: "TODO"
# Path: src/
# Type: "js"
```

**Example 2: Find Function Definitions**

```
Pattern: "async\s+function\s+\w+\s*\("
Output mode: "content"
Type: "ts"
Context: -B 2 -A 5
```

Returns functions with 2 lines before and 5 after for context.

**Example 3: Track Variable Usage Across Codebase**

```
Pattern: "^\s*const\s+apiKey\s*="
Output mode: "files_with_matches"
Path: "src/"
```

Finds all files where `apiKey` is declared.

### Glob: File Path Pattern Matching

**Purpose:** Find files matching path patterns

**Best Used For:**
- Finding all files of a type: `**/*.ts`
- Locating specific directories: `src/**/components/**`
- Finding config files: `**/package.json`
- Matching nested patterns: `src/**/*.test.ts`

**Example 1: Find All TypeScript Files**

```
Pattern: "**/*.ts"
```

**Example 2: Find All Test Files in Nested Structure**

```
Pattern: "src/**/*.test.ts"
```

**Example 3: Find All Config Files**

```
Pattern: "**/config/**/*.json"
```

**Example 4: Find Files in Specific Directory**

```
Pattern: "src/components/**/*.tsx"
```

### When to Use Each Tool

#### Workflow: Understanding a New Codebase

**Step 1: Locate relevant files**
```
Use Glob: "src/**/*.service.ts"
Result: List of service files
```

**Step 2: Understand file structure**
```
Use Read: Read full service file to understand class structure
```

**Step 3: Find usage patterns**
```
Use Grep: "CustomerService" to find where it's imported
Output mode: files_with_matches
```

**Step 4: Understand how it's used**
```
Use Read: Read files that import CustomerService
```

**Step 5: Track specific function usage**
```
Use Grep: "createCustomer\s*\(" to find where function is called
```

#### Workflow: Modifying a File

**Correct Order:**

```
1. Read the file first (REQUIRED)
   Read: /path/to/file.ts

2. Use Edit for targeted changes
   Edit: Replace old_string with new_string

3. If Edit fails (not unique), use Read + Write
   Read: /path/to/file.ts
   Write: /path/to/file.ts (with full modified content)
```

**Example Edit Usage:**

```
File content:
  function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

Old string: "sum + item.price"
New string: "sum + (item.price * item.quantity)"
```

**Example Read + Write Fallback:**

When Edit fails because the string isn't unique:

```typescript
// Read the file
const content = await read('/path/to/file.ts');

// Modify the entire content
const modified = content
  .replace(/old_pattern/g, 'new_pattern')
  .replace(/another_pattern/g, 'new_value');

// Write back the complete file
await write('/path/to/file.ts', modified);
```

### Multi-Tool Analysis Patterns

#### Pattern 1: Tracing Function Usage Across Modules

Task: "I need to understand how the `fetchUser` function is used throughout the codebase"

**Step 1:** Find where function is defined
```
Grep: "^export.*function fetchUser\s*\("
Type: "ts"
Output mode: "files_with_matches"
```

**Step 2:** Find all imports of fetchUser
```
Grep: "import.*fetchUser"
Type: "ts"
Output mode: "files_with_matches"
```

**Step 3:** Find all function calls
```
Grep: "fetchUser\s*\("
Type: "ts"
Output mode: "content"
Context: -B 2 -A 3
```

**Step 4:** Read implementation details
```
Read: /path/to/file/with/fetchUser/definition
```

**Step 5:** Analyze usage patterns
```
Read: /path/to/files/that/import/fetchUser
(Read each file to understand context)
```

#### Pattern 2: Finding and Understanding Wrapper Functions

Task: "Locate wrapper modules and understand how they delegate to underlying libraries"

**Step 1:** Find wrapper patterns
```
Grep: "export.*function.*\([^)]*\).*\{[^}]*require\|import"
Multiline: true
Type: "ts"
Output mode: "files_with_matches"
```

**Step 2:** Locate the files
```
Glob: "src/wrappers/**/*.ts"
```

**Step 3:** Read wrapper files to see delegation
```
Read: /src/wrappers/api-wrapper.ts
(Look for how it calls underlying library)
```

**Step 4:** Find underlying library calls
```
Grep: "axios\.|fetch\(|request\("
Path: "src/wrappers/api-wrapper.ts"
Output mode: "content"
```

**Step 5:** Understand full wrapper behavior
```
Read: /src/wrappers/api-wrapper.ts (complete understanding)
Read: /src/services/that/use/api-wrapper.ts (usage context)
```

#### Pattern 3: Configuration Analysis

Task: "Find all configuration files and understand what's configurable"

**Step 1:** Locate config files
```
Glob: "**/config/**/*.{json,ts,js}"
```

**Step 2:** Find environment-based configs
```
Glob: "**/.env*"
```

**Step 3:** Read main config file
```
Read: /src/config/default.json
```

**Step 4:** Find where configs are used
```
Grep: "config\\.get|process\\.env"
Type: "ts"
Output mode: "files_with_matches"
```

**Step 5:** Understand config injection
```
Read: /src/config/loader.ts (how configs are loaded)
Read: /src/main.ts (how configs are passed around)
```

### Best Practices for Tool Selection

1. **Always Read before Edit**: Edit requires knowing exact content
2. **Use Grep for patterns, Glob for filenames**: Don't mix them
3. **Combine tools methodically**: Grep → Read → Edit/Write flow
4. **Check context with -B/-A flags**: Understand surrounding code
5. **Use output_mode correctly**:
   - `files_with_matches` when you need file list
   - `content` when you need actual matches
6. **Prefer Edit over Write for modifications**: Cleaner diffs
7. **Set reasonable limits**: Use `head_limit` for large searches
8. **Build understanding incrementally**: Don't try to understand everything at once

### Common Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Grep with overly broad pattern | Too many false matches | Add context and make pattern specific |
| Using Glob for content search | Won't find content matches | Use Grep instead |
| Edit without reading first | Will fail with "not unique" | Always Read first |
| Read entire large file at once | Memory and context waste | Use offset/limit parameters |
| Using Bash for file operations | Fragile, platform-dependent | Use Read/Write/Edit tools |
| Ignoring Grep multiline mode | Can't find patterns spanning lines | Set `multiline: true` when needed |
| Not using output_mode correctly | Getting wrong format | Use `files_with_matches` for lists, `content` for details |

---

## Key Exam Tips

### Tool Design (Task 2.1)
- **Descriptions are decision points**: Every tool must have a clear, unambiguous description explaining what it does, when to use it, and what it does NOT do
- **Names matter**: Specific tool names prevent misrouting better than generic ones
- **Include examples**: Show Claude what inputs look like and what outputs to expect
- **State boundaries**: Explicitly say what the tool does NOT do

### Error Handling (Task 2.2)
- **Always use isError flag**: True for failures, false for success (including empty results)
- **Categorize errors**: Transient, validation, business, or permission
- **Make errors actionable**: Include suggested next steps and error codes
- **Retry guidance**: Specify `isRetryable` and `retryAfterSeconds` for transient errors
- **Distinguish valid empty from errors**: No results is success, not failure

### Tool Distribution (Task 2.3)
- **Fewer is better**: 4-5 specialized tools outperform 18 generic tools
- **Role-based scoping**: Only give agents tools they need for their role
- **Use tool_choice strategically**: `auto` for optional tools, `any` for data requirements, forced for specific workflows
- **Split overlapping tools**: Break generic tools into specialized ones
- **Cross-role access**: Create constrained versions, not full access

### MCP Integration (Task 2.4)
- **Project vs user config**: .mcp.json for team tools, ~/.claude.json for personal
- **Environment variables**: Use ${VAR} for credentials, never hardcode
- **All tools available simultaneously**: Configure multiple servers, use any tool in any request
- **Resources for catalogs**: Expose content collections as MCP resources
- **Community vs custom**: Use community servers where available, custom for proprietary systems

### Built-in Tools (Task 2.5)
- **Grep for content, Glob for filenames**: Different purposes, use correctly
- **Read before Edit**: Edit requires knowing exact content
- **Use Edit for modifications**: Cleaner than Write for changes
- **Read + Write as fallback**: When Edit fails (non-unique string)
- **Incremental analysis**: Combine tools methodically to build understanding

---

## Study Checklist

### Understanding (Can you explain these?)
- [ ] Why tool descriptions affect routing accuracy more than tool names
- [ ] How error categories (transient, validation, business, permission) guide Claude's responses
- [ ] Why agent performance degrades with 15+ tools vs 4-5 tools
- [ ] The difference between project-level (.mcp.json) and user-level (~/.claude.json) MCP configuration
- [ ] When to use Grep vs Glob vs Read
- [ ] Why Edit requires Read first

### Application (Can you do these?)
- [ ] Write clear, unambiguous tool descriptions with examples and boundaries
- [ ] Design structured error responses with appropriate categorization
- [ ] Plan tool distribution for a multi-agent system (scope tools by role)
- [ ] Configure MCP servers with environment variables for credentials
- [ ] Use Read → Edit → Verify flow for file modifications
- [ ] Combine Grep + Read + Edit to understand and modify code patterns

### Problem-Solving (Can you recognize and fix these?)
- [ ] Identify overlapping tool descriptions and rename them
- [ ] Recognize misrouting problems and fix by specializing tools
- [ ] Spot agents with too many unrelated tools and redistribute
- [ ] Identify agents with unclear error handling and add error categories
- [ ] Recognize when custom MCP servers are needed vs community servers
- [ ] Debug tool selection issues by improving descriptions

### Real-World Scenarios
- [ ] Design tools for a customer support system (scoped, clear boundaries)
- [ ] Configure MCP servers for secure credential handling
- [ ] Plan agent specialization and tool distribution for enterprise system
- [ ] Refactor overgeneralized agent tools into specialized ones
- [ ] Implement error handling for tools with transient/permanent failure modes
- [ ] Use built-in tools to trace function usage across 50-file module

### Practice Questions
1. You have 25 tools in one agent. Routing is failing 30% of the time. What's the architectural issue and how do you fix it?
2. A tool returns "ERROR: Operation failed" with isError=true. What's missing and how should the error be structured?
3. A custom API tool needs database credentials. Where should you store them and how should the config reference them?
4. Two tools "analyze_data" and "analyze_content" have overlapping purposes. How do you disambiguate them?
5. An agent needs to fetch data from 10 external APIs via MCP servers. How should tool access be configured?
6. You need to find how the `getUserRole()` function is used across a 200-file codebase. What tool sequence?
7. You modify a file with Edit but get "not unique substring error". What's your fallback approach?
8. A transient database error should retry, but a permission error should not. How do you ensure this?

---

## Code Reference: Complete Examples

### Example 1: Complete Tool Definition with All Best Practices

```json
{
  "name": "search_customer_database",
  "description": "Search for customers by name, email, phone, or customer ID. Returns matching customer records with ID, name, email, phone, account status, and creation date. Use this for customer lookups in support interactions. DOES NOT include purchase history (use get_purchase_history) or payment methods (use get_payment_methods). Maximum 20 results per query. Exact match for email/phone, substring match for names.",
  "input_schema": {
    "type": "object",
    "properties": {
      "search_type": {
        "type": "string",
        "enum": ["name", "email", "phone", "customer_id"],
        "description": "Type of search to perform. Use 'customer_id' for exact matches, others for flexible matching."
      },
      "search_value": {
        "type": "string",
        "description": "Value to search for. For emails: exact match required. For names: substring match. For phone: partial match OK."
      },
      "max_results": {
        "type": "integer",
        "description": "Maximum results to return (1-20, default 10). Use lower values for more targeted results.",
        "minimum": 1,
        "maximum": 20,
        "default": 10
      },
      "include_inactive": {
        "type": "boolean",
        "description": "Include deactivated accounts in results (default: false). Use true only when specifically investigating account status.",
        "default": false
      }
    },
    "required": ["search_type", "search_value"]
  }
}
```

### Example 2: MCP Error Response Structure (TypeScript)

```typescript
interface ToolError {
  errorCategory: 'transient' | 'validation' | 'business' | 'permission' | 'system';
  isRetryable: boolean;
  errorCode: string;
  humanMessage: string;
  technicalDetails?: string;
  suggestedAction?: string;
  retryAfterSeconds?: number;
}

function createErrorResponse(error: ToolError): MCPResponse {
  const parts = [
    `ERROR [${error.errorCategory}]`,
    error.humanMessage,
    `Code: ${error.errorCode}`,
    `Retryable: ${error.isRetryable}`,
  ];

  if (error.suggestedAction) {
    parts.push(`Action: ${error.suggestedAction}`);
  }
  if (error.retryAfterSeconds) {
    parts.push(`Retry after: ${error.retryAfterSeconds}s`);
  }

  return {
    content: [
      {
        type: 'text',
        text: parts.join(' | '),
      },
    ],
    isError: true,
  };
}

// Usage
const validationError: ToolError = {
  errorCategory: 'validation',
  isRetryable: false,
  errorCode: 'INVALID_EMAIL',
  humanMessage: 'Email address format invalid',
  suggestedAction: 'Verify email format (user@domain.com)',
};

return createErrorResponse(validationError);
// Output:
// ERROR [validation] | Email address format invalid | Code: INVALID_EMAIL | Retryable: false | Action: Verify email format (user@domain.com)
```

### Example 3: Multi-Agent Architecture with Tool Distribution

```typescript
interface AgentConfig {
  agentId: string;
  name: string;
  role: string;
  systemPrompt: string;
  tools: string[];
  toolChoice: 'auto' | 'any' | { type: 'tool'; name: string };
}

const agents: AgentConfig[] = [
  {
    agentId: 'support-agent',
    name: 'Customer Support Specialist',
    role: 'Customer Support',
    systemPrompt: `You are a customer support specialist. Help customers with account questions and issues.
Always check customer status first using get_customer_info.
For refunds, use request_refund. For complex issues, escalate to supervisor.`,
    tools: [
      'get_customer_info', // Customer lookup
      'get_order_status', // Order tracking
      'get_contact_preferences', // Communication preferences
      'request_refund', // Refund requests
      'create_support_ticket', // Escalations
      'get_faq', // Knowledge base
    ],
    toolChoice: 'auto',
  },
  {
    agentId: 'order-agent',
    name: 'Order Fulfillment Manager',
    role: 'Order Management',
    systemPrompt: `You are an order fulfillment manager. Process orders and manage shipping.
Always verify inventory before confirming orders.
Use calculate_shipping for shipping quotes.`,
    tools: [
      'get_order_details', // Order lookup
      'update_order_status', // Status updates
      'check_inventory', // Stock checking
      'process_order_cancellation', // Cancellations
      'calculate_shipping', // Shipping quotes
      'generate_shipping_label', // Label creation
    ],
    toolChoice: 'any', // Always check order details
  },
  {
    agentId: 'billing-agent',
    name: 'Billing Specialist',
    role: 'Billing & Payments',
    systemPrompt: `You are a billing specialist. Handle invoices, payments, and refunds.
For payment processing, verify customer identity first.
Never process refunds over $1000 without supervisor approval.`,
    tools: [
      'get_invoice', // Invoice retrieval
      'process_payment', // Payment processing
      'process_refund', // Refund processing
      'get_payment_history', // Payment lookup
      'update_billing_address', // Address updates
      'get_billing_summary', // Account summary
    ],
    toolChoice: 'auto',
  },
];

// Tool set sizes: 6, 6, 6 tools each (optimal)
// Minimal overlap (only support agent needs escalation)
// Each agent has tools for their domain only
```

### Example 4: MCP Configuration with Environment Variables

```json
{
  "mcpServers": {
    "internal-database": {
      "command": "python",
      "args": ["./mcp-servers/database/main.py"],
      "env": {
        "DB_HOST": "db.internal.company.com",
        "DB_PORT": "5432",
        "DB_NAME": "production",
        "DB_USER": "${DB_USER}",
        "DB_PASSWORD": "${DB_PASSWORD}",
        "DB_TIMEOUT": "30",
        "DB_POOL_SIZE": "10",
        "DB_SSL": "true"
      }
    },
    "github-enterprise": {
      "command": "node",
      "args": ["./mcp-servers/github/server.js"],
      "env": {
        "GITHUB_ENTERPRISE_URL": "https://github.company.com",
        "GITHUB_TOKEN": "${GITHUB_ENTERPRISE_TOKEN}",
        "GITHUB_ORG": "company-org"
      }
    },
    "slack-workspace": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/slack-mcp"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_APP_TOKEN": "${SLACK_APP_TOKEN}",
        "SLACK_SIGNING_SECRET": "${SLACK_SIGNING_SECRET}"
      }
    },
    "anthropic-docs": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/docs-mcp"]
    }
  ]
}
```

### Example 5: Effective Codebase Analysis Workflow

```bash
# Task: Understand how the payment processing system works

# Step 1: Find payment-related files
# glob --pattern "src/**/*payment*.ts"
# Result: src/payment/processor.ts, src/payment/gateway.ts, src/services/payment-service.ts

# Step 2: Understand entry point
# read /src/payment/processor.ts
# (Read full file to understand class structure)

# Step 3: Find all payment method usages
# grep --pattern "processPayment\s*\(" --path "src" --type "ts" --output_mode "files_with_matches"
# Result: src/api/orders.ts, src/workflow/checkout.ts, src/admin/refunds.ts

# Step 4: Understand how it's used in orders API
# read /src/api/orders.ts
# (See how processPayment is called in context)

# Step 5: Find if there's error handling
# grep --pattern "catch|try|processPayment.*Error" --path "src/api" --type "ts" --output_mode "content" -A 3 -B 3
# (See error handling patterns around payment calls)

# Step 6: Find gateway integration
# grep --pattern "import.*gateway|require.*gateway" --path "src" --type "ts" --output_mode "files_with_matches"
# Result: src/payment/gateway.ts

# Step 7: Read gateway implementation
# read /src/payment/gateway.ts
# (Understand how external payment provider is integrated)

# Step 8: Check for configuration
# glob --pattern "**/config/**payment*.json"
# read /config/payment-config.json
# (Understand payment settings)

# Now you understand:
# - How payments are initiated (orders.ts)
# - How they're processed (processor.ts)
# - How they integrate with external provider (gateway.ts)
# - What configuration is needed (config files)
```

---

## Summary

Module 2 covers the architectural foundations of effective tool design and integration:

1. **Tool descriptions** are the primary decision mechanism—make them unambiguous with examples and boundaries
2. **Error responses** must be structured with categories, retryability, and actionable guidance
3. **Tool distribution** should follow role-based scoping with 4-5 tools per agent, not 18+
4. **MCP integration** handles server configuration, credentials, and resource exposure
5. **Built-in tools** (Grep, Glob, Read, Edit, Write) have specific purposes—use the right tool for the task

The key to success is understanding that **tools are the interface between Claude and systems**, and poor tool design leads to cascading failures in tool selection, error handling, and overall agent reliability.

Master these five tasks, and you'll be equipped to design reliable agent systems at scale.
