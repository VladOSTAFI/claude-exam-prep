# Module 1: Agentic Architecture & Orchestration

**Exam Weight: 27% | 7 Task Statements**

Agentic architecture represents the core capability of Claude when deployed as an autonomous system. This module covers the patterns, tools, and techniques required to design reliable multi-step workflows where Claude drives task execution through iterative decision-making.

---

## Task 1.1: Design and Implement Agentic Loops for Autonomous Task Execution

### Overview
The agentic loop is the fundamental pattern for autonomous execution. Unlike traditional request-response interactions, agentic loops allow Claude to decide what actions to take, observe results, and plan next steps iteratively.

### The Agentic Loop Lifecycle

The loop follows this sequence:

1. **Send Request to Claude** - Include tools definition and current conversation context
2. **Inspect Stop Reason** - Examine the `stop_reason` field to determine next action
3. **Execute Tools if Needed** - If `stop_reason` is "tool_use", call the requested tools
4. **Return Results to Context** - Append tool results to conversation history
5. **Repeat** - Send updated context back to Claude; model reasons about results and decides next action
6. **Terminate** - When `stop_reason` is "end_turn", the agent completes its task

### Stop Reason Interpretation

- **"tool_use"** - Claude wants to call one or more tools. Extract tool calls from the response and execute them.
- **"end_turn"** - Claude has completed its reasoning and has no further tool calls. Extract final response text from the last content block.

### Model-Driven Decision-Making

The key insight: **Claude decides what to do next based on tool results**, not pre-configured decision trees. This enables:

- Adaptive task execution (different paths based on discoveries)
- Graceful error handling (retrying with adjusted parameters)
- Open-ended problem solving (no predetermined workflow)

**Anti-patterns to avoid:**

- Parsing natural language signals ("if text contains 'done'")
- Hard iteration caps without condition checks (always run exactly 5 times)
- Checking assistant text for completion indicators (unreliable)
- Pre-computed branching logic instead of letting model reason

### Code Example: Basic Agentic Loop

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface TextBlock {
  type: "text";
  text: string;
}

type ContentBlock = ToolUseBlock | TextBlock;

interface Message {
  content: ContentBlock[];
  stop_reason: "end_turn" | "tool_use" | "stop_sequence" | "max_tokens";
}

const tools = [
  {
    name: "search",
    description: "Search for information",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "analyze",
    description: "Analyze search results",
    input_schema: {
      type: "object" as const,
      properties: {
        content: {
          type: "string",
          description: "Content to analyze",
        },
      },
      required: ["content"],
    },
  },
];

// Mock tool execution functions
function executeTool(
  name: string,
  input: Record<string, unknown>
): string {
  if (name === "search") {
    return `Search results for "${input.query}": Found 5 relevant articles about ${input.query}`;
  }
  if (name === "analyze") {
    return `Analysis complete: The content discusses key themes and provides actionable insights`;
  }
  return "Tool not found";
}

async function runAgent(initialPrompt: string): Promise<void> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: initialPrompt,
    },
  ];

  let iteration = 0;
  const maxIterations = 10; // Safety cap, but don't rely on it

  while (iteration < maxIterations) {
    iteration++;
    console.log(`\n=== Iteration ${iteration} ===`);

    const response = (await client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 4096,
      tools: tools,
      messages: messages,
    })) as Message;

    // Check stop reason
    if (response.stop_reason === "end_turn") {
      // Extract final response
      const textBlock = response.content.find(
        (block) => block.type === "text"
      ) as TextBlock | undefined;
      if (textBlock) {
        console.log("\nFinal Response:", textBlock.text);
      }
      break;
    }

    if (response.stop_reason === "tool_use") {
      // Process tool calls
      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use"
      ) as ToolUseBlock[];

      // Add assistant response to messages
      messages.push({
        role: "assistant",
        content: response.content,
      });

      // Execute tools and collect results
      const toolResults: Anthropic.MessageParam = {
        role: "user",
        content: toolUseBlocks.map((toolUse) => {
          console.log(`Executing tool: ${toolUse.name}`, toolUse.input);
          const result = executeTool(toolUse.name, toolUse.input);
          console.log(`Tool result:`, result);

          return {
            type: "tool_result" as const,
            tool_use_id: toolUse.id,
            content: result,
          };
        }),
      };

      // Append tool results to conversation
      messages.push(toolResults);
    }
  }

  if (iteration >= maxIterations) {
    console.log("Max iterations reached");
  }
}

// Usage
runAgent(
  "Research the latest developments in AI safety and provide a summary"
);
```

### Key Principles

1. **Stop reason is canonical** - Always check `stop_reason`, never make assumptions
2. **Tool results must be appended** - Preserving the full conversation history enables reasoning
3. **Let the model decide** - Trust Claude's judgment on whether more tools are needed
4. **Graceful termination** - The loop terminates naturally when Claude reaches "end_turn"

### Best Practices

- Keep tool definitions clear and specific
- Return structured tool results when possible
- Log iterations for observability (but not for decision logic)
- Handle tool execution errors gracefully, returning error details to the agent
- Don't artificially limit iterations; let the task complexity determine loop length

---

## Task 1.2: Orchestrate Multi-Agent Systems with Coordinator-Subagent Patterns

### Overview
Multi-agent systems decompose complex tasks across specialized agents. The **coordinator-subagent pattern** ensures observability and control through a single coordinator managing inter-agent communication.

### Hub-and-Spoke Architecture

```
                    ┌─────────────┐
                    │ Coordinator │
                    └──────┬──────┘
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────▼────┐   ┌───▼────┐   ┌──▼─────┐
         │Subagent1│   │Subagent2│  │Subagent3│
         │Research │   │ Analysis│   │ Synthesis│
         └────▲────┘   └───▲────┘   └──▲─────┘
              │             │             │
              └─────────────┼─────────────┘
                      (isolated contexts)
```

**Key architectural properties:**

- **Single point of control** - Coordinator decides which subagents to invoke
- **Isolated contexts** - Each subagent operates with explicit context, no automatic inheritance
- **Explicit communication** - All inter-agent data flows through the coordinator
- **Observable** - Full audit trail of task decomposition and delegation

### Why Not Direct Subagent Calls?

Without a coordinator:
- Subagents might call each other, creating circular dependencies
- Observability is lost (you don't see all communication)
- Task decomposition logic is scattered across agents
- Difficult to reuse subagents across different workflows

### Coordinator Responsibilities

1. **Task Decomposition** - Break complex requests into focused subtasks
2. **Selective Delegation** - Choose which subagents are needed for this task
3. **Context Preparation** - Prepare focused context (not dumping everything)
4. **Result Aggregation** - Collect, synthesize, and validate results
5. **Iterative Refinement** - Make follow-up requests based on intermediate results

### Anti-Pattern: Overly Narrow Decomposition

**Problem:** Breaking tasks into too many tiny steps slows execution and increases ambiguity.

```typescript
// ❌ Too granular
const tasks = [
  "Read the first sentence",
  "Read the second sentence",
  "Identify nouns",
  "Identify verbs",
  "Extract sentiment"
];

// ✅ Appropriate granularity
const tasks = [
  "Extract key entities and their relationships",
  "Analyze sentiment and tone",
  "Generate summary"
];
```

### Code Example: Coordinator-Subagent Pattern

```typescript
import Anthropic from "@anthropic-ai/sdk";

interface SubagentResponse {
  findings: string;
  confidence: number;
}

interface AggregatedResults {
  research: SubagentResponse;
  analysis: SubagentResponse;
  synthesis: string;
}

async function callSubagent(
  client: Anthropic,
  role: string,
  context: string
): Promise<SubagentResponse> {
  const response = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 2048,
    system: `You are a ${role} agent. Provide focused analysis on the assigned topic.
             Return your findings as clear, structured text. End with a confidence rating (0-1).`,
    messages: [
      {
        role: "user",
        content: context,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === "text");
  const text = textContent && "text" in textContent ? textContent.text : "";

  // Simple parsing (in production, use structured outputs)
  const confidenceMatch = text.match(/confidence[:\s]+([0-9.]+)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;

  return {
    findings: text,
    confidence: confidence,
  };
}

async function coordinatorAgent(
  userRequest: string
): Promise<AggregatedResults> {
  const client = new Anthropic();

  console.log("Coordinator: Received request:", userRequest);

  // Step 1: Decompose task
  console.log("Coordinator: Decomposing task...");
  const decompositionResponse = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 1024,
    system:
      "You are a task coordinator. Analyze the request and decide which subagents to invoke: Research, Analysis, or Synthesis.",
    messages: [
      {
        role: "user",
        content: `Request: ${userRequest}\n\nDecide which subagents are needed and what specific context to provide each.`,
      },
    ],
  });

  const decompositionText =
    decompositionResponse.content.find((block) => block.type === "text") &&
    "text" in decompositionResponse.content.find((block) => block.type === "text")
      ? (decompositionResponse.content.find((block) => block.type === "text") as any)
          .text
      : "";

  console.log("Coordinator: Decomposition plan:", decompositionText);

  // Step 2: Delegate to subagents
  console.log("Coordinator: Delegating to subagents...");

  const researchContext = `Original request: ${userRequest}

  Your role: Research agent
  Task: Find relevant information, background, and data that addresses this request.
  Provide your key findings and rate your confidence in the information.`;

  const analysisContext = `Original request: ${userRequest}

  Your role: Analysis agent
  Task: Examine the implications, patterns, and deeper insights related to this request.
  Provide your analytical conclusions and rate your confidence.`;

  const [researchResult, analysisResult] = await Promise.all([
    callSubagent(client, "Research", researchContext),
    callSubagent(client, "Analysis", analysisContext),
  ]);

  console.log("Coordinator: Received subagent responses");

  // Step 3: Aggregate and synthesize
  console.log("Coordinator: Synthesizing results...");

  const synthesisResponse = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 2048,
    system:
      "You are a synthesis agent. Integrate the research and analysis findings into a cohesive response.",
    messages: [
      {
        role: "user",
        content: `Original request: ${userRequest}

Research findings:
${researchResult.findings}

Analysis findings:
${analysisResult.findings}

Integrate these findings into a comprehensive response that addresses the original request.`,
      },
    ],
  });

  const synthesisText =
    synthesisResponse.content.find((block) => block.type === "text") &&
    "text" in synthesisResponse.content.find((block) => block.type === "text")
      ? (synthesisResponse.content.find((block) => block.type === "text") as any)
          .text
      : "";

  return {
    research: researchResult,
    analysis: analysisResult,
    synthesis: synthesisText,
  };
}

// Usage
coordinatorAgent("What are the key challenges in scaling machine learning systems?")
  .then((results) => {
    console.log("Final Results:", JSON.stringify(results, null, 2));
  });
```

### Best Practices

1. **Keep subagent scope focused** - Each should excel at one type of task
2. **Pass complete context** - Don't force subagents to infer information
3. **Validate intermediate results** - Coordinator can re-delegate if quality is low
4. **Log all communication** - For audit trails and debugging
5. **Design for parallelization** - Invoke independent subagents concurrently

---

## Task 1.3: Configure Subagent Invocation, Context Passing, and Spawning

### Overview
The Agent SDK provides the `Task` tool for programmatically spawning subagents. Proper configuration ensures subagents have necessary context while maintaining isolation.

### The Task Tool

The `Task` tool invokes another agent with explicit configuration:

```typescript
{
  type: "tool_use",
  name: "Task",
  input: {
    description: "What this subagent should do",
    agents: ["agent_name"],
    // or agentDefinition for inline agents
  }
}
```

### Requirements

**Critical:** To spawn subagents, the coordinator's `allowedTools` must include `"Task"`:

```typescript
const coordinatorTools = [
  {
    name: "Task",
    description: "Spawn a subagent to handle a specific task",
    // ... tool definition
  },
  // other tools
];

const coordinatorConfig = {
  name: "coordinator",
  model: "claude-opus-4-1-20250805",
  tools: coordinatorTools,
  allowedTools: ["Task"], // Must explicitly allow Task
};
```

### Context Passing: No Automatic Inheritance

**Key principle:** Subagents do NOT automatically inherit the coordinator's conversation history. Context must be explicitly provided.

```typescript
// ❌ Wrong: assuming subagent sees coordinator's context
coordinator.spawn("subagent", "analyze this");

// ✅ Correct: explicitly providing complete context
coordinator.spawn("subagent", {
  description: "Analyze the following document",
  context: {
    document: "...", // Include full document
    requirements: [...], // Include requirements
    coordinator_findings: "...", // If relevant
  },
});
```

### AgentDefinition Configuration

Define subagents inline with `AgentDefinition`:

```typescript
interface AgentDefinition {
  name: string; // Unique identifier
  description: string; // What this agent does
  systemPrompt?: string; // Custom system behavior
  model?: string; // Model override
  tools?: Tool[]; // Limited toolset
  allowedTools?: string[]; // Whitelist of allowed tools
}

const researchAgent: AgentDefinition = {
  name: "researcher",
  description:
    "Searches for and synthesizes information from multiple sources",
  systemPrompt: `You are an expert researcher. Your role is to find relevant information,
    evaluate source credibility, and present findings with clear citations.
    Focus on accuracy and completeness.`,
  tools: [searchTool, fetchTool], // Limited to relevant tools
  allowedTools: ["search", "fetch"],
};

const analysisAgent: AgentDefinition = {
  name: "analyst",
  description:
    "Performs deep analytical work on provided information",
  systemPrompt: `You are an expert analyst. Your role is to examine information deeply,
    identify patterns, extract insights, and provide actionable conclusions.
    Be skeptical of assumptions.`,
  tools: [dataProcessingTool], // Different toolset
  allowedTools: ["process_data"],
};
```

### fork_session for Divergent Exploration

The `fork_session` capability allows exploring multiple approaches in parallel:

```typescript
// In coordinator context:
const parallelExploration = await client.messages.create({
  model: "claude-opus-4-1-20250805",
  max_tokens: 2048,
  system: "You are a task coordinator.",
  messages: [
    {
      role: "user",
      content: `We need to analyze this data from three different perspectives.
               Fork the session to explore:
               1. Statistical analysis path
               2. Machine learning path
               3. Domain expert interpretation path

               Each path should be independent.`,
    },
  ],
  tools: [
    {
      name: "fork_session",
      description:
        "Create an independent session exploring a divergent approach",
      input_schema: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "What this fork should explore",
          },
          context: {
            type: "object",
            description: "Context to carry into the fork",
          },
        },
        required: ["description"],
      },
    },
  ],
});
```

### Code Example: Complete Subagent Configuration

```typescript
import Anthropic from "@anthropic-ai/sdk";

interface SubagentTask {
  description: string;
  context: Record<string, unknown>;
  agentDefinition: {
    name: string;
    description: string;
    systemPrompt?: string;
  };
}

async function spawnResearchSubagent(
  client: Anthropic,
  topic: string,
  specificRequirements: string[]
): Promise<string> {
  const agentDefinition = {
    name: "research_agent",
    description:
      "Conducts thorough research on assigned topics, compiling verified information",
    systemPrompt: `You are a meticulous research agent. Your task:
1. Find authoritative sources on the assigned topic
2. Extract key findings and supporting evidence
3. Identify gaps in information
4. Present findings with clear reasoning

Be thorough. Verify information. Cite sources when possible.`,
  };

  const taskInput: SubagentTask = {
    description: `Research the following topic thoroughly: ${topic}

    Specific requirements:
    ${specificRequirements.map((r) => `- ${r}`).join("\n")}

    Provide structured findings with supporting evidence.`,
    context: {
      topic: topic,
      requirements: specificRequirements,
      format_preference: "structured_findings",
      expected_sections: [
        "overview",
        "key_findings",
        "supporting_evidence",
        "gaps_identified",
        "confidence_level",
      ],
    },
    agentDefinition: agentDefinition,
  };

  // In a real implementation, this would call the Task tool
  // and handle the response appropriately
  console.log("Spawning research subagent with context:", taskInput);

  // Mock response
  return `Research findings on ${topic}: [Subagent would return detailed findings here]`;
}

async function coordinatorWithSubagents(
  mainObjective: string
): Promise<void> {
  const client = new Anthropic();

  console.log("Coordinator: Starting task decomposition");

  const subagentTasks = [
    {
      topic: "Technical feasibility",
      requirements: [
        "Current technological state",
        "Infrastructure requirements",
        "Implementation timeline",
      ],
    },
    {
      topic: "Market viability",
      requirements: [
        "Market size and growth",
        "Competitive landscape",
        "Revenue potential",
      ],
    },
    {
      topic: "Risk assessment",
      requirements: [
        "Technical risks",
        "Market risks",
        "Regulatory risks",
        "Mitigation strategies",
      ],
    },
  ];

  console.log("Coordinator: Spawning parallel research subagents");

  // Spawn subagents in parallel
  const results = await Promise.all(
    subagentTasks.map((task) =>
      spawnResearchSubagent(client, task.topic, task.requirements)
    )
  );

  console.log("Coordinator: Received all subagent findings");
  console.log("Results:", results);

  // Aggregate results
  console.log("Coordinator: Aggregating and synthesizing findings...");

  const synthesisPrompt = `Based on the following research findings:
${results.map((r, i) => `\nResearch ${i + 1}:\n${r}`).join("\n")}

Provide an integrated analysis that synthesizes these findings into actionable recommendations.`;

  const synthesis = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: synthesisPrompt,
      },
    ],
  });

  const synthesisText =
    synthesis.content.find((block) => block.type === "text") &&
    "text" in synthesis.content.find((block) => block.type === "text")
      ? (synthesis.content.find((block) => block.type === "text") as any).text
      : "";

  console.log("Final synthesis:", synthesisText);
}

// Usage
coordinatorWithSubagents("Evaluate feasibility of entering the European market");
```

### Key Rules for Context Passing

1. **Be explicit** - Include all data a subagent might need
2. **Include metadata** - Format expectations, constraints, constraints
3. **Avoid ambiguity** - Subagents can't ask clarifying questions of coordinator
4. **Structure data** - Use consistent formats (JSON, markdown sections)
5. **Include examples** - Show expected output format if relevant

### Best Practices

- Document exactly what each subagent expects in its `description`
- Use custom `systemPrompt` to set tone and approach
- Restrict `tools` and `allowedTools` to only what subagent needs
- Include complete findings in prompts, not references to external data
- Design subagents to output structured data (JSON, markdown) for easy aggregation

---

## Task 1.4: Implement Multi-Step Workflows with Enforcement and Handoff Patterns

### Overview
Complex workflows often require deterministic guarantees that certain steps happen in correct order with validation. This task covers patterns for enforcing compliance and structuring handoffs between workflow stages.

### Programmatic Enforcement vs Prompt-Based Guidance

**Prompt-based guidance** relies on model compliance:

```typescript
system: `Please validate the data before processing.
         Check for:
         1. Required fields present
         2. Data types correct
         3. Values within expected ranges`,
```

**Limitation:** Non-zero failure rate. Claude might miss requirements or misinterpret them.

**Programmatic enforcement** uses code to guarantee compliance:

```typescript
function processData(data: Record<string, unknown>): void {
  // Enforce prerequisites
  if (!data.name || typeof data.name !== "string") {
    throw new Error("Required field 'name' missing or invalid");
  }
  if (!data.email || !isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }
  if (typeof data.age !== "number" || data.age < 0 || data.age > 150) {
    throw new Error("Age must be a valid number between 0 and 150");
  }

  // If we reach here, all prerequisites passed
  performProcessing(data);
}
```

**Principle:** Use programmatic enforcement when failures have significant consequences. Use prompts for guidance on open-ended decisions.

### Multi-Step Workflow with Prerequisites

```typescript
interface WorkflowStep {
  name: string;
  validate: () => boolean; // Prerequisite gate
  execute: () => Promise<void>;
  onFailure?: () => void;
}

async function executeWorkflowWithEnforcement(
  steps: WorkflowStep[]
): Promise<void> {
  for (const step of steps) {
    console.log(`Validating prerequisites for: ${step.name}`);

    // Enforce prerequisites
    if (!step.validate()) {
      console.error(`Prerequisites failed for ${step.name}`);
      if (step.onFailure) {
        step.onFailure();
      }
      throw new Error(`Cannot proceed: ${step.name} prerequisites not met`);
    }

    console.log(`Executing: ${step.name}`);
    await step.execute();
    console.log(`Completed: ${step.name}`);
  }
}
```

### Structured Handoff Protocols

Handoffs occur when tasks move between agents or workflow stages. Structured protocols ensure complete information transfer:

```typescript
interface HandoffProtocol {
  fromStage: string;
  toStage: string;
  summary: string; // What was accomplished
  blockers: string[]; // Unresolved issues
  assumptions: string[]; // Key assumptions made
  metadata: Record<string, unknown>; // Stage-specific data
  readiness_gates: {
    [key: string]: boolean;
  };
}

function createHandoff(
  fromStage: string,
  findings: string[],
  blockers: string[]
): HandoffProtocol {
  return {
    fromStage: fromStage,
    toStage: "next_stage", // Determined by workflow
    summary: `Completed ${fromStage}: ${findings.join("; ")}`,
    blockers: blockers,
    assumptions: [],
    metadata: {
      timestamp: new Date().toISOString(),
      stage_duration_ms: 0, // Would be populated in real scenario
    },
    readiness_gates: {
      data_quality_verified: true,
      blockers_documented: true,
      next_stage_prepared: false,
    },
  };
}
```

### Code Example: Multi-Step Workflow with Enforcement

```typescript
interface DataRecord {
  id: string;
  name: string;
  email: string;
  age: number;
  category: "A" | "B" | "C";
}

interface WorkflowContext {
  data: DataRecord;
  validations: string[];
  errors: string[];
  stage: string;
}

const ValidationRules = {
  validateEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  validateAge: (age: number): boolean => {
    return age >= 18 && age <= 150;
  },
  validateName: (name: string): boolean => {
    return name.length > 0 && name.length < 100;
  },
};

async function multiStepWorkflow(data: DataRecord): Promise<WorkflowContext> {
  const context: WorkflowContext = {
    data: data,
    validations: [],
    errors: [],
    stage: "initialization",
  };

  // Step 1: Validate Input
  console.log("Step 1: Validating input data");
  context.stage = "validation";

  if (!ValidationRules.validateName(data.name)) {
    context.errors.push("Invalid name format");
  }
  if (!ValidationRules.validateEmail(data.email)) {
    context.errors.push("Invalid email format");
  }
  if (!ValidationRules.validateAge(data.age)) {
    context.errors.push("Age out of valid range (18-150)");
  }

  // Enforce: Can't proceed if validation failed
  if (context.errors.length > 0) {
    throw new Error(`Validation failed: ${context.errors.join("; ")}`);
  }
  context.validations.push("Input validation passed");

  // Step 2: Process with Model (conditional on validation)
  console.log("Step 2: AI-driven enrichment");
  context.stage = "enrichment";

  const client = new Anthropic();
  const enrichmentResponse = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 512,
    system: `You are a data enrichment agent. Given valid customer data,
             classify them into business categories and suggest next steps.
             Only provide analysis; don't modify the data.`,
    messages: [
      {
        role: "user",
        content: `Customer data (already validated):
                 Name: ${data.name}
                 Email: ${data.email}
                 Age: ${data.age}

                 Classify this customer and suggest engagement strategy.`,
      },
    ],
  });

  const enrichmentText =
    enrichmentResponse.content.find((block) => block.type === "text") &&
    "text" in enrichmentResponse.content.find((block) => block.type === "text")
      ? (enrichmentResponse.content.find((block) => block.type === "text") as any)
          .text
      : "";

  context.validations.push("Enrichment completed");

  // Step 3: Prepare Handoff
  console.log("Step 3: Preparing handoff to next stage");
  context.stage = "handoff_preparation";

  const handoff: HandoffProtocol = {
    fromStage: "processing",
    toStage: "storage",
    summary: `Processed customer record for ${data.name}. Enrichment: ${enrichmentText.substring(0, 100)}...`,
    blockers: [],
    assumptions: ["Customer provided accurate information"],
    metadata: {
      record_id: data.id,
      enrichment_notes: enrichmentText,
      timestamp: new Date().toISOString(),
    },
    readiness_gates: {
      data_validated: true,
      enrichment_complete: true,
      next_stage_prepared: true,
    },
  };

  console.log("Handoff ready:", handoff);

  return context;
}

// Usage with error handling
multiStepWorkflow({
  id: "cust_123",
  name: "John Doe",
  email: "john@example.com",
  age: 35,
  category: "A",
})
  .then((result) => {
    console.log("Workflow completed successfully:", result.validations);
  })
  .catch((error) => {
    console.error("Workflow failed:", error.message);
  });
```

### Best Practices

1. **Validate before delegation** - Don't let invalid data propagate
2. **Document assumptions** - Include in handoff protocol
3. **Fail fast** - Catch issues early rather than deep in the workflow
4. **Log all transitions** - For debugging and compliance
5. **Include remediation** - Tell next stage what to do if they find issues

---

## Task 1.5: Apply Agent SDK Hooks for Tool Call Interception and Data Normalization

### Overview
SDK hooks intercept Claude's interactions with tools, enabling deterministic compliance enforcement, data normalization, and policy enforcement that prompt instructions cannot guarantee.

### Hook Patterns: PostToolUse

The `PostToolUse` hook fires after a tool executes and before Claude processes the result. Use it to:

- **Normalize data** - Convert tool results to consistent format
- **Validate results** - Reject invalid outputs
- **Filter sensitive data** - Redact PII from results before model sees them
- **Transform data** - Convert between formats

```typescript
type PostToolUseHook = (
  toolName: string,
  toolInput: Record<string, unknown>,
  toolResult: string
) => string; // Return modified result
```

### Hook Patterns: Pre-Tool-Call Interception

Before tools execute, intercept outgoing calls to:

- **Block forbidden actions** - Prevent tool calls that violate policy
- **Validate inputs** - Ensure tool calls have correct parameters
- **Log for audit** - Record all tool invocations
- **Route calls** - Implement conditional tool availability

```typescript
type PreToolUseHook = (
  toolName: string,
  toolInput: Record<string, unknown>
) => boolean | { blocked: true; reason: string };
```

### Hooks vs Prompts: Guaranteed vs Probabilistic Compliance

**Prompt instructions** (probabilistic):

```typescript
system: `Never share any API keys or credentials in responses.
         Always redact sensitive data.
         Filter out personally identifiable information.`,
```

Problem: Claude might forget, misinterpret, or prioritize responsiveness over caution.

**Hooks** (deterministic):

```typescript
const redactHook: PostToolUseHook = (toolName, toolInput, result) => {
  // Guaranteed removal of sensitive patterns
  let redacted = result;

  // Block API keys (any 32+ alphanumeric sequence)
  redacted = redacted.replace(/\b[a-zA-Z0-9]{32,}\b/g, "[REDACTED_KEY]");

  // Block email addresses
  redacted = redacted.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[REDACTED_EMAIL]");

  // Block SSNs
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_SSN]");

  return redacted;
};
```

**Rule:** Use hooks when failures have compliance or security implications.

### Code Example: PostToolUse for Data Normalization

```typescript
import Anthropic from "@anthropic-ai/sdk";

interface NormalizationConfig {
  [toolName: string]: (result: string) => string;
}

const normalizationHooks: NormalizationConfig = {
  // Normalize database query results to consistent format
  query_database: (result: string): string => {
    try {
      // Attempt to parse as JSON
      const parsed = JSON.parse(result);

      // Normalize to standard format
      return JSON.stringify({
        status: "success",
        rowCount: Array.isArray(parsed) ? parsed.length : 0,
        data: parsed,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Fallback for non-JSON results
      return JSON.stringify({
        status: "success",
        raw_output: result,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Normalize API responses
  fetch_external_api: (result: string): string => {
    try {
      const response = JSON.parse(result);

      // Extract only relevant fields
      return JSON.stringify({
        status: response.status || response.statusCode,
        body: response.data || response.body || response,
        headers: response.headers
          ? Object.keys(response.headers).reduce(
              (acc: Record<string, string>, key: string) => {
                // Keep only safe headers
                if (
                  !["authorization", "api-key", "x-api-key"].includes(
                    key.toLowerCase()
                  )
                ) {
                  acc[key] = response.headers[key];
                }
                return acc;
              },
              {}
            )
          : {},
        normalized_at: new Date().toISOString(),
      });
    } catch {
      return result;
    }
  },

  // Normalize file operations
  read_file: (result: string): string => {
    // Ensure consistent line endings
    const normalized = result.replace(/\r\n/g, "\n");

    // Return metadata along with content
    return JSON.stringify({
      content: normalized,
      line_count: normalized.split("\n").length,
      size_bytes: normalized.length,
      normalized_at: new Date().toISOString(),
    });
  },
};

interface ToolCallValidation {
  allowed: boolean;
  reason?: string;
}

const preCallValidations: Record<
  string,
  (input: Record<string, unknown>) => ToolCallValidation
> = {
  // Validate delete operations
  delete_record: (input: Record<string, unknown>): ToolCallValidation => {
    if (!input.id) {
      return {
        allowed: false,
        reason: "delete_record requires 'id' parameter",
      };
    }

    // Prevent deletion of system records
    const id = String(input.id);
    if (id.startsWith("SYS_")) {
      return {
        allowed: false,
        reason: "Cannot delete system records",
      };
    }

    return { allowed: true };
  },

  // Validate data modifications
  update_record: (input: Record<string, unknown>): ToolCallValidation => {
    if (!input.id || !input.updates) {
      return {
        allowed: false,
        reason: "update_record requires 'id' and 'updates' parameters",
      };
    }

    // Ensure updates is an object
    if (typeof input.updates !== "object") {
      return {
        allowed: false,
        reason: "'updates' must be an object",
      };
    }

    return { allowed: true };
  },

  // Validate sensitive operations
  write_to_audit_log: (
    input: Record<string, unknown>
  ): ToolCallValidation => {
    if (!input.action || !input.details) {
      return {
        allowed: false,
        reason: "Audit log requires 'action' and 'details'",
      };
    }

    // Validate action is known
    const validActions = [
      "create",
      "read",
      "update",
      "delete",
      "export",
      "access_granted",
    ];
    if (!validActions.includes(String(input.action))) {
      return {
        allowed: false,
        reason: `Unknown action. Must be one of: ${validActions.join(", ")}`,
      };
    }

    return { allowed: true };
  },
};

async function executeWithHooks(
  client: Anthropic,
  userPrompt: string,
  tools: Anthropic.Tool[]
): Promise<void> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: userPrompt,
    },
  ];

  let iteration = 0;

  while (iteration < 10) {
    iteration++;

    const response = await client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 2048,
      tools: tools,
      messages: messages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && "text" in textBlock) {
        console.log("Response:", textBlock.text);
      }
      break;
    }

    if (response.stop_reason === "tool_use") {
      messages.push({
        role: "assistant",
        content: response.content,
      });

      const toolUseBlocks = response.content.filter(
        (b) => b.type === "tool_use"
      );
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        if (toolUse.type !== "tool_use") continue;

        console.log(`Tool call: ${toolUse.name}`, toolUse.input);

        // Pre-call validation hook
        const validation =
          preCallValidations[toolUse.name]?.(
            toolUse.input as Record<string, unknown>
          ) || { allowed: true };

        if (!validation.allowed) {
          console.error(`Tool blocked: ${validation.reason}`);
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Error: Tool call blocked - ${validation.reason}`,
            is_error: true,
          });
          continue;
        }

        // Execute tool (mock)
        let result = `Result from ${toolUse.name}`;

        // Post-call normalization hook
        if (normalizationHooks[toolUse.name]) {
          result = normalizationHooks[toolUse.name](result);
          console.log("Normalized result:", result);
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      messages.push({
        role: "user",
        content: toolResults,
      });
    }
  }
}

// Usage
const tools: Anthropic.Tool[] = [
  {
    name: "query_database",
    description: "Execute a database query",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "delete_record",
    description: "Delete a record by ID",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    },
  },
];

executeWithHooks(new Anthropic(), "Query the user database and show me results", tools);
```

### Data Normalization Best Practices

1. **Validate before normalization** - Check structure exists before transforming
2. **Preserve raw data** - Keep original in metadata if useful for debugging
3. **Handle errors gracefully** - Return original if normalization fails
4. **Log transformations** - For audit and debugging
5. **Test edge cases** - Hooks affect all tool results; test thoroughly

### Compliance Hooks Best Practices

1. **Whitelist over blacklist** - `allow_if_matches_pattern` is better than `block_if_contains`
2. **Be specific** - Generic patterns miss edge cases
3. **Log blocks** - Always log when actions are blocked for audit
4. **Test with adversarial inputs** - Ensure patterns can't be bypassed
5. **Review regularly** - Compliance requirements evolve

---

## Task 1.6: Design Task Decomposition Strategies for Complex Workflows

### Overview
Task decomposition is the art of breaking complex problems into manageable pieces. Different approaches suit different problem types.

### Two Decomposition Patterns

#### Pattern 1: Fixed Sequential Pipelines (Prompt Chaining)

Use when steps are predetermined and don't depend on discoveries.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Step 1    │───▶│   Step 2    │───▶│   Step 3    │
│  Extract    │    │  Analyze    │    │  Summarize  │
│  Information│    │  Patterns   │    │  Findings   │
└─────────────┘    └─────────────┘    └─────────────┘
```

**When to use:**
- Steps have clear, predetermined sequence
- Each step's input is well-defined
- Success is deterministic (pass/fail)
- No discovery that would change later steps

**Example:**
```typescript
// Prompt chaining for document processing
const extractionResponse = await client.messages.create({
  messages: [{ role: "user", content: document }],
  system: "Extract structured data from this document",
});

const analysisResponse = await client.messages.create({
  messages: [{ role: "user", content: extractionResponse.content[0].text }],
  system: "Analyze the extracted data for patterns",
});

const summaryResponse = await client.messages.create({
  messages: [{ role: "user", content: analysisResponse.content[0].text }],
  system: "Create executive summary of findings",
});
```

#### Pattern 2: Dynamic Adaptive Decomposition

Use when the path depends on discoveries. The agent plans next steps based on current findings.

```
                    ┌─────────────────┐
                    │   Analyze Task  │
                    │  Create Plan    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
         ┌──────────│  Execute Step 1 │──────────┐
         │          └─────────────────┘          │
         │                                        │
    Was Step 1                             What did we
    successful?                            discover?
         │                                        │
         ├─ Failure ──────────────────────────┐   │
         │                                     │   │
         │   ┌──────────────┐                 │   │
         │   │ Adjust Plan  │                 │   │
         │   │ & Retry      │                 │   │
         │   └──────┬───────┘                 │   │
         │          │                         │   │
         └──────────┼──────────────────────┬──┘   │
                    │                      │      │
                    │       ┌──────────────┘      │
                    │       │                     │
                    ▼       ▼                     ▼
               ┌─────────────────────┐    ┌──────────────┐
               │ Execute Step 2      │    │ Refine Plan  │
               │ (based on outcome)  │    │ New Strategy │
               └─────────────────────┘    └──────────────┘
```

**When to use:**
- Problem structure emerges during execution
- Results of one step influence subsequent steps
- Adaptive strategies are more efficient
- Unexpected issues require pivoting

**Example:**

```typescript
// Dynamic decomposition for investigation
async function investigativeDecomposition(topic: string): Promise<string> {
  const client = new Anthropic();
  let findings = "";

  // Step 1: Initial exploration
  let response = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Begin investigating: ${topic}
                 First, identify the main areas that need exploration.
                 What are the key unknowns?`,
      },
    ],
  });

  findings += response.content
    .filter((b) => b.type === "text")
    .map((b) => ("text" in b ? b.text : ""))
    .join("\n");

  // Step 2: Plan investigation based on findings
  response = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Based on these initial findings:
                 ${findings}

                 Create a detailed investigation plan.
                 What specific sub-questions should we answer?
                 In what order?`,
      },
    ],
  });

  findings += "\n" + response.content
    .filter((b) => b.type === "text")
    .map((b) => ("text" in b ? b.text : ""))
    .join("\n");

  // Step 3: Execute plan with adaptive refinement
  response = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Based on your investigation plan, execute it step by step.
                 As you answer each question, assess if you need to adjust
                 the plan based on what you discover.

                 Original plan and findings:
                 ${findings}`,
      },
    ],
  });

  return response.content
    .filter((b) => b.type === "text")
    .map((b) => ("text" in b ? b.text : ""))
    .join("\n");
}
```

### Decomposition by Problem Structure

#### Code Review: Multi-Pass Approach

```
┌──────────────────┐
│ Per-File Analysis │ ──┐
│ - Logic bugs     │   │
│ - Style issues   │   │
└──────────────────┘   │
                       ├──▶ ┌──────────────────┐
┌──────────────────┐   │    │ Cross-File       │
│ Per-File Analysis │ ──┤    │ Analysis         │
│ - Logic bugs     │   │    │ - Dependencies   │
│ - Style issues   │   │    │ - Architecture   │
└──────────────────┘   │    └──────────────────┘
                       │           │
         ┌─────────────┘           │
         │                         ▼
         │                    ┌──────────────┐
         └───────────────────▶│   Synthesis  │
                              │ - Summary    │
                              │ - Priorities │
                              └──────────────┘
```

```typescript
async function codeReviewDecomposition(
  files: string[],
  code: Map<string, string>
): Promise<void> {
  const client = new Anthropic();
  const fileReviews: Map<string, string> = new Map();

  // Phase 1: Per-file analysis (parallelizable)
  console.log("Phase 1: Analyzing individual files...");
  const perFileReviews = await Promise.all(
    files.map((file) =>
      client.messages.create({
        model: "claude-opus-4-1-20250805",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Review this file for logic bugs and style issues:

File: ${file}
${code.get(file)}

Focus on:
1. Correctness of logic
2. Edge cases
3. Code clarity
4. Style consistency`,
          },
        ],
      })
    )
  );

  // Store individual reviews
  files.forEach((file, i) => {
    const text = perFileReviews[i].content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n");
    fileReviews.set(file, text);
  });

  // Phase 2: Cross-file analysis
  console.log("Phase 2: Analyzing cross-file concerns...");

  const crossFileContext = Array.from(fileReviews.entries())
    .map(([file, review]) => `${file}:\n${review}`)
    .join("\n\n");

  const crossFileResponse = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Given these per-file reviews:
${crossFileContext}

Now analyze cross-file concerns:
1. Dependencies between files
2. Architecture consistency
3. Data flow across modules
4. Potential integration issues`,
      },
    ],
  });

  // Phase 3: Synthesis
  console.log("Phase 3: Synthesizing recommendations...");

  const synthesisResponse = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Based on individual file reviews and cross-file analysis:

Individual issues:
${crossFileContext}

Cross-file concerns:
${crossFileResponse.content
  .filter((b) => b.type === "text")
  .map((b) => ("text" in b ? b.text : ""))
  .join("\n")}

Provide:
1. Executive summary (3-5 key issues)
2. Priority order (critical, important, nice-to-have)
3. Recommended fixes`,
      },
    ],
  });

  console.log(
    "Code Review Complete:",
    synthesisResponse.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n")
  );
}
```

### Best Practices for Decomposition

1. **Map structure first** - Understand problem before decomposing
2. **Minimize dependencies** - Decompose so parts can work independently
3. **Make each piece self-contained** - Include all context needed
4. **Use adaptive patterns for discovery** - Let findings guide next steps
5. **Combine approaches** - Use fixed + adaptive in same workflow

---

## Task 1.7: Manage Session State, Resumption, and Forking

### Overview
Sessions persist agent state across interactions, enabling long-running tasks and complex workflows. This task covers resumption for continuation and forking for parallel exploration.

### Session Fundamentals

A **session** maintains:
- Conversation history (messages)
- Tool definitions
- Agent state between interactions
- Optional named identifier

### Named Session Resumption with --resume

**Named sessions** allow pausing work and returning to it later:

```bash
# Start a named session
claude -n my-research "Research climate change impacts on agriculture"

# Later, resume the same session
claude --resume my-research "Continue with economic impacts"

# The agent sees the full history and continues from where it left off
```

### Programmatic Session Management

```typescript
interface SessionConfig {
  sessionName?: string;
  resumeMode?: boolean;
  onResumeNotify?: string; // Tell agent what changed since last interaction
}

async function createOrResumeSession(
  config: SessionConfig,
  initialPrompt: string
): Promise<void> {
  const client = new Anthropic();

  let userMessage = initialPrompt;

  // If resuming, inform agent about changes
  if (config.resumeMode && config.onResumeNotify) {
    userMessage = `[Session resumed] ${config.onResumeNotify}

Continue working on the previous task. Context from prior interactions is available above.

${initialPrompt}`;
  }

  const response = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  console.log(
    "Response:",
    response.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n")
  );
}
```

### When to Resume vs Fresh Start

| Scenario | Resume | Fresh | Reason |
|----------|--------|-------|--------|
| Continuing same task | ✓ | ✗ | Preserves context and progress |
| Task changed significantly | ✗ | ✓ | Old context confuses model |
| Need parallel explorations | ✗ | ✗ | Use fork_session instead |
| Long-running task | ✓ | ✗ | Avoids context duplication |
| Debugging failed approach | ✓ | ✓ | Either works; resume faster |

### fork_session for Parallel Exploration

`fork_session` creates an independent branch from current state, allowing parallel investigation of different approaches:

```typescript
interface ForkedSession {
  sessionId: string;
  description: string;
  context: Map<string, unknown>;
}

async function forkAndExplore(
  parentSessionContext: string,
  approaches: string[]
): Promise<Map<string, string>> {
  const client = new Anthropic();
  const results = new Map<string, string>();

  const forkPromises = approaches.map((approach) =>
    client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `[Forked from parent session]

Context from parent investigation:
${parentSessionContext}

Now explore this approach independently:
${approach}

This is a parallel exploration; findings don't affect the parent session.`,
        },
      ],
    })
  );

  const responses = await Promise.all(forkPromises);

  approaches.forEach((approach, i) => {
    const result = responses[i].content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n");
    results.set(approach, result);
  });

  return results;
}
```

### Informing Resumed Sessions About Changes

**Critical:** When resuming, explicitly tell the agent what has changed:

```typescript
interface ResumeNotification {
  changedFiles?: string[];
  newRequirements?: string[];
  failedApproaches?: string[];
  externalContext?: string;
}

function createResumeNotification(changes: ResumeNotification): string {
  let notification = "[Session Resumed - Important Context Updates]\n\n";

  if (changes.changedFiles && changes.changedFiles.length > 0) {
    notification += `Modified files since last session:\n`;
    changes.changedFiles.forEach((f) => {
      notification += `- ${f}\n`;
    });
    notification += "\n";
  }

  if (changes.newRequirements && changes.newRequirements.length > 0) {
    notification += `New requirements added:\n`;
    changes.newRequirements.forEach((r) => {
      notification += `- ${r}\n`;
    });
    notification += "\n";
  }

  if (changes.failedApproaches && changes.failedApproaches.length > 0) {
    notification += `Approaches that failed (don't repeat):\n`;
    changes.failedApproaches.forEach((a) => {
      notification += `- ${a}\n`;
    });
    notification += "\n";
  }

  if (changes.externalContext) {
    notification += `External context:\n${changes.externalContext}\n`;
  }

  return notification;
}

// Usage
const resumeNotif = createResumeNotification({
  changedFiles: ["src/api.ts", "docs/requirements.md"],
  newRequirements: [
    "Must support OAuth2 authentication",
    "Performance must handle 1000 concurrent users",
  ],
  failedApproaches: [
    "JWT tokens were rejected by legacy system",
    "Caching strategy at DB layer caused conflicts",
  ],
  externalContext:
    "Customer urgently needs this by Friday. Also they mentioned using AWS instead of GCP.",
});

console.log(resumeNotif);
```

### Code Example: Complete Session Management

```typescript
import Anthropic from "@anthropic-ai/sdk";

interface SessionManager {
  createSession(name: string, initialPrompt: string): Promise<void>;
  resumeSession(name: string, newPrompt: string): Promise<void>;
  forkSession(
    parentDescription: string,
    forkDescription: string
  ): Promise<string>;
  listSessions(): Promise<string[]>;
}

class SimpleSessionManager implements SessionManager {
  private sessions: Map<string, Anthropic.MessageParam[]> = new Map();
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async createSession(name: string, initialPrompt: string): Promise<void> {
    console.log(`Creating session: ${name}`);

    if (this.sessions.has(name)) {
      throw new Error(`Session ${name} already exists`);
    }

    const messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: initialPrompt,
      },
    ];

    this.sessions.set(name, messages);

    await this.executeWithHistory(name);
  }

  async resumeSession(name: string, newPrompt: string): Promise<void> {
    console.log(`Resuming session: ${name}`);

    if (!this.sessions.has(name)) {
      throw new Error(`Session ${name} not found`);
    }

    const messages = this.sessions.get(name)!;

    // Add new user message
    messages.push({
      role: "user",
      content: newPrompt,
    });

    await this.executeWithHistory(name);
  }

  async forkSession(
    parentDescription: string,
    forkDescription: string
  ): Promise<string> {
    const forkName = `fork_${Date.now()}`;
    console.log(`Forking new session: ${forkName}`);

    const forkMessages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: `[Forked Session]
Parent context: ${parentDescription}
Explore this approach independently: ${forkDescription}`,
      },
    ];

    this.sessions.set(forkName, forkMessages);
    await this.executeWithHistory(forkName);

    return forkName;
  }

  private async executeWithHistory(sessionName: string): Promise<void> {
    const messages = this.sessions.get(sessionName)!;

    const response = await this.client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 2048,
      messages: messages,
    });

    // Add response to history
    messages.push({
      role: "assistant",
      content: response.content,
    });

    // Log response
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n");

    console.log(`\n[${sessionName}]`);
    console.log(text);
  }

  async listSessions(): Promise<string[]> {
    return Array.from(this.sessions.keys());
  }
}

// Usage example
async function demonstrateSessionManagement(): Promise<void> {
  const manager = new SimpleSessionManager();

  // Create initial research session
  await manager.createSession(
    "feature-research",
    "Research best practices for implementing user authentication in web applications"
  );

  console.log("\n--- Sessions so far ---");
  console.log(await manager.listSessions());

  // Resume with new information
  await manager.resumeSession(
    "feature-research",
    "Now focus specifically on OAuth2 implementation for our use case"
  );

  // Fork to explore alternative
  const forkId = await manager.forkSession(
    "OAuth2 research in feature-research",
    "Explore JWT-based authentication as an alternative"
  );

  console.log("\n--- Final sessions ---");
  console.log(await manager.listSessions());
}

demonstrateSessionManagement();
```

### Session State Best Practices

1. **Use named sessions for long-running projects** - Enables pausing and resuming
2. **Always notify on resume** - Tell agent what changed
3. **Use fork_session for parallel exploration** - Don't pollute main session with experiments
4. **Log session decisions** - Record why you chose to resume vs fork vs restart
5. **Clean up old sessions** - Archive completed work to maintain clarity

---

## Key Exam Tips

### High-Probability Focus Areas

1. **Agentic Loop Mechanics** (Task 1.1)
   - Stop reason interpretation ("tool_use" vs "end_turn")
   - Anti-patterns: parsing NL signals, hard iteration caps
   - Why appending results to context is essential
   - **Exam likely includes:** scenario where you identify what happens at each iteration

2. **Coordinator-Subagent Pattern** (Task 1.2)
   - Subagents have isolated context (no automatic inheritance)
   - Hub-and-spoke architecture advantages
   - Risks of overly granular decomposition
   - **Exam likely includes:** comparing architectures or identifying why direct subagent calls fail

3. **Context Passing** (Task 1.3)
   - Explicit context required; no automatic sharing
   - Tool must be in `allowedTools`
   - Structured data formats for metadata
   - **Exam likely includes:** scenarios where subagent lacks information

4. **Programmatic Enforcement** (Task 1.4 & 1.5)
   - When to use hooks vs prompts
   - Hooks provide guarantees; prompts are probabilistic
   - **Exam likely includes:** choosing enforcement mechanism for compliance requirement

5. **Decomposition Patterns** (Task 1.6)
   - Fixed pipelines (prompt chaining) vs adaptive (investigation)
   - Selecting decomposition strategy based on problem type
   - **Exam likely includes:** which pattern for given scenario

6. **Session Management** (Task 1.7)
   - Resume vs fork vs fresh start decision trees
   - Importance of notifying on resume about changes
   - **Exam likely includes:** when to use each approach

### Exam Question Types to Expect

- **Scenario-based:** "Given this workflow requirement, which pattern should you use?"
- **Anti-pattern identification:** "Which of these implementations has a flaw?"
- **Architecture design:** "Design a system for [complex task]"
- **Code analysis:** "What's wrong with this agent implementation?"
- **Decision logic:** "When would you choose X over Y?"

### Common Exam Traps

1. **Forgetting to check stop_reason** - Assuming tool_use always succeeds
2. **Automatic context inheritance** - Assuming subagents see coordinator history
3. **Prompt-based guarantees** - Trusting prompts for deterministic compliance
4. **Over-decomposition** - Breaking tasks into too many steps
5. **Wrong resumption approach** - Not notifying agent about changes

---

## Study Checklist

### Conceptual Understanding

- [ ] I understand the agentic loop lifecycle and can explain each phase
- [ ] I can identify stop_reason values and what each means
- [ ] I know why appending tool results to context is essential for reasoning
- [ ] I can explain the hub-and-spoke architecture and its benefits
- [ ] I understand why subagents have isolated context (no inheritance)
- [ ] I know when to use coordinator-subagent vs direct delegation
- [ ] I can explain the difference between fixed and adaptive decomposition
- [ ] I understand hooks (PostToolUse) and when to use them vs prompts
- [ ] I know the difference between guaranteed (hooks) and probabilistic (prompts) compliance
- [ ] I can explain resume vs fork vs fresh start scenarios
- [ ] I understand why notifying resumed agents about changes is critical

### Implementation Skills

- [ ] I can write a basic agentic loop with proper stop_reason handling
- [ ] I can implement a coordinator that spawns multiple subagents in parallel
- [ ] I can configure subagents with explicit context and restricted tools
- [ ] I can create a multi-step workflow with enforcement gates
- [ ] I can implement a PostToolUse hook for data normalization
- [ ] I can implement a pre-call validation hook to block forbidden actions
- [ ] I can decompose a complex task using fixed pipeline pattern
- [ ] I can decompose a complex task using adaptive investigation pattern
- [ ] I can manage sessions with proper resumption notifications
- [ ] I can design a fork_session exploration strategy

### Code Examples (Reproduce from Memory)

- [ ] Basic agentic loop with tool execution
- [ ] Coordinator-subagent pattern with parallel delegation
- [ ] Multi-step workflow with validation gates
- [ ] PostToolUse hook for data normalization
- [ ] Pre-call hook for policy enforcement
- [ ] Session management with resume and fork

### Architecture Design

- [ ] I can design a system for a complex multi-agent task
- [ ] I can identify when coordinator-subagent pattern is needed
- [ ] I can explain trade-offs between decomposition strategies
- [ ] I can design appropriate session management for long-running tasks
- [ ] I can identify anti-patterns in given architecture proposals

### Exam Readiness

- [ ] I've reviewed all 7 task statements thoroughly
- [ ] I understand the relationships between tasks (how they build on each other)
- [ ] I can distinguish between similar patterns (e.g., fork vs resume)
- [ ] I can solve at least 3 practice scenarios for each task statement
- [ ] I feel confident explaining any concept to someone else
- [ ] I've practiced writing code examples under time pressure

---

## Quick Reference: Decision Trees

### When to Choose Decomposition Pattern

```
Is the workflow structure
predetermined?
├─ YES → Fixed Sequential Pipeline (prompt chaining)
│        - Each step's input is known
│        - Step order won't change
│        - Use for: sequential processing, data pipelines
│
└─ NO → Adaptive Decomposition
         - Structure emerges from discoveries
         - Step order depends on results
         - Use for: investigation, problem-solving
```

### When to Use Hooks vs Prompts

```
Is this a compliance/security requirement
where failure has serious consequences?
├─ YES → Use Hooks (PostToolUse, Pre-call)
│        - Deterministic guarantee needed
│        - Failure rate must be zero
│        - Examples: blocking APIs, redacting PII
│
└─ NO → Use Prompts
         - Probabilistic guidance acceptable
         - Success rate is good enough
         - Examples: tone, style, approach
```

### Session Management Decision Tree

```
What's the situation?
├─ Continuing same task
│  └─ Use: --resume with notification
├─ Exploring alternative approach
│  └─ Use: fork_session
├─ Task fundamentally changed
│  └─ Use: Fresh start
└─ Multiple parallel paths
   └─ Use: fork_session for each
```

