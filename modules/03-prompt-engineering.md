# Module 3 — Prompt Engineering & Structured Output

> **Domain weight: 20%.**
> Estimated effort: ~2.5 hrs reading + 1 hr hands-on.

---

## Why this domain matters

Production LLM systems live or die on **structured output**. The exam tests whether you can guarantee the model produces parseable, valid JSON, recover gracefully from failures, and design schemas that don't force the model to hallucinate.

Most wrong answers in this domain involve **forcing the model to fill in fields it shouldn't** (over-required schemas, enums without escape hatches) or **trusting the wrong stop signal**.

---

## Learning objectives

- Pick correctly between `tool_choice: auto` / `any` / specific-tool.
- Design JSON schemas with proper enum fallbacks, nullable fields, and required-only-when-truly-required.
- Distinguish **syntax errors** (eliminated by `tool_use`) from **semantic errors** (require validation/retry).
- Apply iterative refinement patterns: examples > prose, test-driven iteration, batched vs. sequential fixes.
- Understand `stop_reason` values and what each implies for control flow.

---

## `tool_choice` — pick the right one

| Setting | Behavior | When to use |
|---|---|---|
| `tool_choice: { type: "auto" }` | Model decides whether to call a tool | General assistants |
| `tool_choice: { type: "any" }` | Model **must** call *some* tool but picks which | When any tool action is required |
| `tool_choice: { type: "tool", name: "X" }` | Model **must** call this specific tool | Force structured JSON output |
| `tool_choice: { type: "none" }` | Model cannot use tools | Pure text generation in a tool-equipped session |

**The most common exam scenario:** "We need guaranteed JSON output that conforms to a schema."
**Correct answer:** `tool_choice: { type: "tool", name: "..." }` — this is the canonical way to force structured output. The model fills the tool's input schema; your code reads it.

---

## `stop_reason` — what each value means

| Value | Meaning | Action |
|---|---|---|
| `end_turn` | Model finished naturally | You're done; return result |
| `tool_use` | Model wants to call a tool | Execute tool, append result, continue loop |
| `max_tokens` | Output was **truncated** | This is a failure mode; retry with more tokens or chunk the work |
| `stop_sequence` | A custom stop sequence was hit | Handle per your design |

> **Exam trap:** `stop_reason: "max_tokens"` is **not success**. The response is truncated and likely invalid JSON. Treat it as an error and retry.

---

## JSON schema design

### Enum design — always include an escape hatch

```json
// ❌ BAD — model will pick a wrong category to comply
{
  "type": "object",
  "properties": {
    "currency": { "type": "string", "enum": ["USD", "EUR", "GBP"] }
  }
}

// ✅ GOOD — honest fallback
{
  "type": "object",
  "properties": {
    "currency":       { "type": "string", "enum": ["USD", "EUR", "GBP", "other"] },
    "currency_other": { "type": ["string", "null"] }
  }
}
```

For classification tasks, include `"unclear"` as a valid value:

```json
{
  "confidence": { "type": "string", "enum": ["high", "medium", "low", "unclear"] }
}
```

### Nullable fields

Use a type union, not optionality-by-omission:

```json
// ✅ Explicit nullability
{ "middle_name": { "type": ["string", "null"] } }
```

### `required` — be conservative

```json
// ❌ BAD — forces hallucination when fields are missing
{ "required": ["name", "email", "phone", "address", "company", "title"] }

// ✅ GOOD — only fields that MUST always be present
{ "required": ["name"] }
```

> **Rule:** if a field can legitimately be missing in the source data, it should not be `required`. Over-requiring forces the model to fabricate.

---

## Syntax errors vs. semantic errors

| Error type | Eliminated by | How to handle |
|---|---|---|
| **Syntax** (malformed JSON, wrong types) | `tool_use` + schema | The SDK/server enforces this — you don't see syntax errors |
| **Semantic** (wrong values, hallucinated entities, missed details) | Validation + retry | Validate the parsed output and re-prompt with the validation error |

```ts
// Validation-retry pattern
async function extractInvoice(text: string, attempts = 3) {
  let lastError: string | undefined;

  for (let i = 0; i < attempts; i++) {
    const response = await claude.messages.create({
      model: "claude-sonnet-4-6",
      tools: [extractInvoiceTool],
      tool_choice: { type: "tool", name: "extract_invoice" },
      messages: [
        { role: "user", content: text },
        ...(lastError ? [{ role: "user", content: `Validation error: ${lastError}. Please correct.` }] : []),
      ],
    });

    const result = response.content.find(c => c.type === "tool_use")?.input;
    const validation = invoiceSchema.safeParse(result);

    if (validation.success) return validation.data;
    lastError = validation.error.message;
  }

  throw new Error(`Extraction failed after ${attempts} attempts: ${lastError}`);
}
```

---

## Iterative refinement patterns

These come up in scenario questions about "how do you improve a prompt that's failing".

| Pattern | Rule |
|---|---|
| **Examples > prose** | 2–3 concrete I/O pairs beat 10 lines of description |
| **Test-driven iteration** | Share failures, not "fix it"; let the model see the wrong output |
| **Batch interacting fixes** | If two issues are related, fix them in one iteration |
| **Separate independent fixes** | If issues are independent, separate iterations are easier to debug |
| **Interview pattern** | Ask the model what *it* would change; surfaces hidden assumptions |

### Few-shot example structure

```xml
<example>
  <input>Acme Corp invoice #4421 dated 2026-04-12 for €1,250</input>
  <output>{
    "vendor": "Acme Corp",
    "invoice_number": "4421",
    "date": "2026-04-12",
    "currency": "EUR",
    "total": 1250
  }</output>
</example>
```

### XML tags Claude is trained to attend to

`<input>`, `<output>`, `<thinking>`, `<example>`, `<context>`, `<system>`, `<instructions>` — using these consistently improves attention.

---

## Reading queue

1. [Tool use](https://platform.claude.com/docs/en/build-with-claude/tool-use) — full read; `tool_choice`, schema, `stop_reason`
2. [Extended thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) — when it helps; not a substitute for independent review
3. [Cookbook — extracting structured JSON](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/extracting_structured_json.ipynb)
4. [Cookbook — prompt caching](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/prompt_caching.ipynb)
5. [Prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) — XML tags, prefilling, examples
6. Skilljar — *AI Capabilities and Limitations* (the "honest unclear" pattern)

---

## Hands-on exercise

Write a TypeScript function `extractInvoiceFields(text: string)` that:

- Uses `tool_choice: { type: "tool", name: "extract_invoice" }` to force structured output.
- Schema includes:
  - `vendor` (string)
  - `total` (number)
  - `currency` (enum: USD/EUR/GBP/other)
  - `currency_other` (nullable string)
  - `confidence` (enum: high/medium/unclear)
- On `confidence: "unclear"`, retries with a clarifying message including the original text and the partial extraction.
- On schema validation failure, retries with the validation error appended.

```ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const InvoiceSchema = z.object({
  vendor: z.string(),
  total: z.number(),
  currency: z.enum(["USD", "EUR", "GBP", "other"]),
  currency_other: z.string().nullable(),
  confidence: z.enum(["high", "medium", "unclear"]),
});

const extractInvoiceTool = {
  name: "extract_invoice",
  description: "Extract structured fields from invoice text.",
  input_schema: {
    type: "object",
    properties: {
      vendor: { type: "string" },
      total: { type: "number" },
      currency: { type: "string", enum: ["USD", "EUR", "GBP", "other"] },
      currency_other: { type: ["string", "null"] },
      confidence: { type: "string", enum: ["high", "medium", "unclear"] },
    },
    required: ["vendor", "total", "currency", "confidence"],
  },
};
```

---

## Self-check

- [ ] I can choose between `auto` / `any` / specific tool given a scenario.
- [ ] I never force enums without an `"other"` or `"unclear"` escape hatch.
- [ ] I know `tool_use` eliminates JSON syntax errors but not semantic correctness.
- [ ] I prefer 2–3 examples over a long prose description.
- [ ] I batch interacting fixes; I separate independent fixes.
- [ ] I treat `stop_reason: "max_tokens"` as a failure, not success.

---

## Exam traps to reject

| Tempting wrong answer | Why it's wrong |
|---|---|
| "Add few-shot examples to enforce the model always calls tool A before tool B" | Use programmatic prerequisites; ordering isn't reliably enforced via examples |
| "Use `tool_choice: auto` when you need guaranteed JSON output" | Use `{ type: "tool", name: "..." }` |
| "Mark all fields as required so the model fills them all" | Forces hallucination on missing data |
| "Treat `stop_reason: max_tokens` as success" | Response was truncated |
| "Re-prompt with 'try harder' on schema failure" | Include the actual validation error |
| "Trust extended thinking traces as the final answer" | Thinking traces are not load-bearing for correctness |

---

## Quick reference

| Need | Use |
|---|---|
| Guaranteed JSON output | `tool_choice: { type: "tool", name: "X" }` |
| Force *any* tool but let model pick | `tool_choice: { type: "any" }` |
| Optional field | `["string", "null"]`, NOT just omitting from `required` |
| Classification with possible "I don't know" | Add `"unclear"` to enum |
| Open category | Add `"other"` to enum + `_other` text field |
| Recovering from semantic errors | Validate output, retry with error in message |
