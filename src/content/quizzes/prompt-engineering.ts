import type { Quiz } from "@/types/quiz";

const quiz: Quiz = {
  slug: "prompt-engineering",
  title: "Prompt Engineering & Structured Output",
  questions: [
    {
      id: "q1",
      prompt:
        "You need to guarantee that Claude always returns a JSON object conforming to a specific schema. Which `tool_choice` setting achieves this?",
      choices: [
        { id: "a", text: "`{ type: \"auto\" }` — the model is smart enough to produce JSON without enforcement." },
        { id: "b", text: "`{ type: \"any\" }` — forces the model to call some tool, ensuring structured output." },
        { id: "c", text: "`{ type: \"tool\", name: \"my_tool\" }` — forces the model to call this specific tool, filling its input schema." },
        { id: "d", text: "`{ type: \"none\" }` — disables tool use and relies on a prefilled JSON template." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module identifies `tool_choice: { type: \"tool\", name: \"...\" }` as 'the canonical way to force structured output.' The model fills the tool's input schema, and your code reads it. `auto` is for general assistants; `any` forces a tool call but lets the model pick which one, so the output schema is not guaranteed.",
    },
    {
      id: "q2",
      prompt:
        "A response returns with `stop_reason: \"max_tokens\"`. How should your code treat this?",
      choices: [
        { id: "a", text: "Return the response to the user — the model finished as much as it could." },
        { id: "b", text: "Treat it as success if the JSON is parseable; only fail if parsing throws." },
        { id: "c", text: "Treat it as a failure mode: the response is truncated and likely invalid. Retry with more tokens or smaller chunks." },
        { id: "d", text: "Append a continuation message asking the model to finish the response." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module states: '`stop_reason: max_tokens` is not success. The response is truncated and likely invalid JSON.' The correct action is to treat it as an error and retry — either by increasing `max_tokens` or by decomposing the work into smaller pieces.",
    },
    {
      id: "q3",
      prompt:
        "You are designing a schema for currency extraction. The source documents may contain currencies not in your predefined list. What is the correct schema design pattern?",
      choices: [
        { id: "a", text: "Use a strict enum `[\"USD\", \"EUR\", \"GBP\"]` — reject the output if an unknown currency appears." },
        { id: "b", text: "Use a free-form string field — let the model write whatever currency it finds." },
        { id: "c", text: "Use enum `[\"USD\", \"EUR\", \"GBP\", \"other\"]` with a companion nullable `currency_other` string field." },
        { id: "d", text: "Mark the currency field as optional so the model can omit it when uncertain." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's enum design rule says: always include an escape hatch ('other' or 'unclear'). Without it, the model is forced to pick an incorrect category to comply with the enum, introducing fabrication. The companion `currency_other` field captures the actual value when 'other' is selected.",
    },
    {
      id: "q4",
      prompt:
        "A prompt iteration is failing in two unrelated ways: (1) wrong date format and (2) missing vendor name. How should you apply the iterative refinement principle?",
      choices: [
        { id: "a", text: "Fix both issues in one prompt iteration — batching all fixes keeps the process efficient." },
        { id: "b", text: "Fix them in separate iterations — independent issues should be debugged separately to isolate causality." },
        { id: "c", text: "Add more examples covering both issues in a single pass — examples always beat iterative editing." },
        { id: "d", text: "Use the interview pattern first: ask the model what it would change about the prompt." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's iterative refinement rule is: 'Separate independent fixes — if issues are independent, separate iterations are easier to debug.' Batching interacting fixes is recommended when two issues are related. Here, date format and vendor extraction are unrelated, so separate iterations preserve causality.",
    },
    {
      id: "q5",
      prompt:
        "Using `tool_use` with a schema eliminates which type of errors, but does NOT eliminate which type?",
      choices: [
        { id: "a", text: "Eliminates semantic errors (wrong values); does not eliminate syntax errors (malformed JSON)." },
        { id: "b", text: "Eliminates syntax errors (malformed JSON, wrong types); does not eliminate semantic errors (wrong values, hallucinated entities)." },
        { id: "c", text: "Eliminates both syntax and semantic errors when the schema is sufficiently specific." },
        { id: "d", text: "Eliminates neither — `tool_use` only changes how output is surfaced, not its correctness." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's error taxonomy is clear: tool_use + schema enforcement eliminates syntax errors (the SDK/server rejects malformed output), but semantic errors (wrong values, hallucinated data, missed nuances) still require validation and retry logic in your application code.",
    },
    {
      id: "q6",
      prompt:
        "You are building a general assistant that should answer questions in plain text but may optionally use a calculator tool when math is involved. Which `tool_choice` is most appropriate?",
      choices: [
        { id: "a", text: "`{ type: \"auto\" }` — let the model decide whether to call a tool." },
        { id: "b", text: "`{ type: \"any\" }` — guarantees a tool is always invoked." },
        { id: "c", text: "`{ type: \"tool\", name: \"calculator\" }` — force calculator on every turn." },
        { id: "d", text: "`{ type: \"none\" }` — block all tool calls regardless of question." },
      ],
      correctChoiceId: "a",
      explanation:
        "The module's table maps `tool_choice: { type: \"auto\" }` directly to 'General assistants' where the model decides whether to call a tool. `any` would force unnecessary tool calls; the specific-tool form would force the calculator even on non-math questions; `none` would prevent useful tool use.",
    },
    {
      id: "q7",
      prompt:
        "Your extraction pipeline runs in a tool-equipped session, but on certain turns you want pure text output and no tool calls. Which setting expresses this?",
      choices: [
        { id: "a", text: "`{ type: \"auto\" }` and hope the model doesn't pick a tool." },
        { id: "b", text: "Remove the tools array on those turns only." },
        { id: "c", text: "`{ type: \"none\" }` — the model cannot use tools on that turn." },
        { id: "d", text: "`{ type: \"any\" }` with an empty tools list." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's tool_choice table lists `{ type: \"none\" }` with the explicit use case 'Pure text generation in a tool-equipped session.' This is the canonical way to suppress tool use without restructuring the request.",
    },
    {
      id: "q8",
      prompt:
        "When designing a JSON schema, how should you express that a `middle_name` field may legitimately be missing for some people?",
      choices: [
        { id: "a", text: "Omit `middle_name` from the `required` array and document that absence means missing." },
        { id: "b", text: "Use a type union: `{ \"middle_name\": { \"type\": [\"string\", \"null\"] } }`." },
        { id: "c", text: "Add `middle_name` to `required` and tell the model to use an empty string when missing." },
        { id: "d", text: "Use a sentinel value like `\"N/A\"` inside a strict string enum." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's nullable-fields rule says: 'Use a type union, not optionality-by-omission.' Explicit nullability via `[\"string\", \"null\"]` makes missingness a first-class value the model can emit honestly, instead of being forced to invent or rely on omission ambiguity.",
    },
    {
      id: "q9",
      prompt:
        "An over-required schema declares `required: [\"name\", \"email\", \"phone\", \"address\", \"company\", \"title\"]`. What is the primary failure mode this introduces?",
      choices: [
        { id: "a", text: "Slower responses due to schema validation overhead." },
        { id: "b", text: "Higher token cost from emitting all fields." },
        { id: "c", text: "Hallucination — the model fabricates values for fields that aren't present in the source." },
        { id: "d", text: "Truncation — the response is more likely to hit `max_tokens`." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module is explicit: 'Over-requiring forces the model to fabricate.' If a field can legitimately be missing in the source, marking it required forces the model to invent a plausible-looking value to satisfy the schema, which is the canonical hallucination trigger in extraction tasks.",
    },
    {
      id: "q10",
      prompt:
        "For a sentiment classification task, the module recommends including `\"unclear\"` in the enum. Why?",
      choices: [
        { id: "a", text: "Because Claude is trained to prefer the `\"unclear\"` token whenever possible." },
        { id: "b", text: "To give the model an honest fallback so it doesn't pick a wrong category to comply with the enum." },
        { id: "c", text: "Because schema validators reject responses that don't include every enum value." },
        { id: "d", text: "To increase semantic diversity in training data." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's 'honest unclear' pattern (also referenced in the Skilljar reading) is about giving the model an escape hatch. Without `\"unclear\"`, the model is forced to commit to high/medium/low even when the input is genuinely ambiguous, which produces confident-but-wrong classifications.",
    },
    {
      id: "q11",
      prompt:
        "A teammate suggests improving a struggling extraction prompt by adding ten more lines of prose describing the desired behavior. What does the module recommend instead?",
      choices: [
        { id: "a", text: "Switch to extended thinking and trust the thinking trace." },
        { id: "b", text: "Add 2–3 concrete input/output examples — examples beat prose." },
        { id: "c", text: "Mark every field as required so the model takes the prompt more seriously." },
        { id: "d", text: "Use `tool_choice: any` to force more decisive output." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's iterative refinement table states the rule directly: 'Examples > prose — 2–3 concrete I/O pairs beat 10 lines of description.' Concrete demonstrations anchor the model far more reliably than additional descriptive text.",
    },
    {
      id: "q12",
      prompt:
        "A schema validation fails. Which retry message is most consistent with the module's guidance?",
      choices: [
        { id: "a", text: "'Please try harder this time.'" },
        { id: "b", text: "'The previous output was wrong. Re-read the document carefully.'" },
        { id: "c", text: "'Validation error: <actual zod/JSON-schema error message>. Please correct.'" },
        { id: "d", text: "'Switch to a slower, more careful mode for the next attempt.'" },
      ],
      correctChoiceId: "c",
      explanation:
        "The validation-retry pattern in the module appends the literal validation error to the next user message ('Validation error: ${lastError}. Please correct.'). The exam-traps table also explicitly rejects 'Re-prompt with try harder on schema failure' — the actual error is what makes the retry useful.",
    },
    {
      id: "q13",
      prompt:
        "Which XML tag is NOT in the set the module says Claude is trained to attend to?",
      choices: [
        { id: "a", text: "`<example>`" },
        { id: "b", text: "`<thinking>`" },
        { id: "c", text: "`<json>`" },
        { id: "d", text: "`<instructions>`" },
      ],
      correctChoiceId: "c",
      explanation:
        "The module lists the trained-attention tags as `<input>`, `<output>`, `<thinking>`, `<example>`, `<context>`, `<system>`, and `<instructions>`. `<json>` is not in that set; structured output is achieved via tool_use schemas, not a special XML wrapper.",
    },
    {
      id: "q14",
      prompt:
        "You are stuck on a prompt that fails in a way you can't characterize. Which iterative refinement pattern is best suited to surfacing the model's hidden assumptions?",
      choices: [
        { id: "a", text: "Test-driven iteration — share the failures and let the model see the wrong output." },
        { id: "b", text: "Batched fixes — change multiple things at once to find what helps." },
        { id: "c", text: "The interview pattern — ask the model what it would change about the prompt." },
        { id: "d", text: "Prefilling — prepopulate the assistant turn with the desired structure." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module describes the interview pattern as: 'Ask the model what it would change; surfaces hidden assumptions.' It is specifically the technique for exposing implicit interpretations that you, the prompter, may not have noticed.",
    },
    {
      id: "q15",
      prompt:
        "You receive a response with `stop_reason: \"tool_use\"`. What is the correct next step in the agent loop?",
      choices: [
        { id: "a", text: "Return the tool_use block as the final answer to the user." },
        { id: "b", text: "Treat it as a failure; tool_use indicates the model could not produce real output." },
        { id: "c", text: "Execute the tool, append the tool_result, and continue the loop." },
        { id: "d", text: "Retry with `tool_choice: none` to force a textual answer." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's `stop_reason` table maps `tool_use` to the action: 'Execute tool, append result, continue loop.' This is the standard agentic step — the model paused so your code can run the tool and feed the result back.",
    },
    {
      id: "q16",
      prompt:
        "A prompt has two issues that interact: the model emits the wrong currency code AND the wrong total because it's confusing thousands separators with decimal points. How should these be addressed?",
      choices: [
        { id: "a", text: "Fix them in separate iterations to preserve causal isolation." },
        { id: "b", text: "Batch them into one iteration — interacting fixes belong together." },
        { id: "c", text: "Switch to `tool_choice: any` so the model picks a different tool." },
        { id: "d", text: "Add `\"unclear\"` to both enums and let the model defer." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's iterative refinement rule: 'Batch interacting fixes — if two issues are related, fix them in one iteration.' Currency parsing and number parsing share the same underlying number-format ambiguity, so a single coordinated fix is appropriate.",
    },
    {
      id: "q17",
      prompt:
        "Which statement best describes the module's stance on extended thinking?",
      choices: [
        { id: "a", text: "Always enable extended thinking for structured-output tasks; the trace is the canonical answer." },
        { id: "b", text: "Extended thinking helps in some cases, but thinking traces are not load-bearing for correctness — don't trust them as the final answer." },
        { id: "c", text: "Extended thinking should be parsed and returned to the user as the response." },
        { id: "d", text: "Extended thinking guarantees schema-valid output without needing tool_use." },
      ],
      correctChoiceId: "b",
      explanation:
        "The exam-traps table explicitly rejects 'Trust extended thinking traces as the final answer' with the reason 'Thinking traces are not load-bearing for correctness.' The reading queue lists extended thinking as situational, not as a substitute for independent review or tool_use enforcement.",
    },
    {
      id: "q18",
      prompt:
        "Someone proposes using few-shot examples to enforce that the agent always calls `tool_a` before `tool_b`. Why does the module reject this?",
      choices: [
        { id: "a", text: "Because tool ordering is reliably enforced by example-following, but only if you provide 10+ examples." },
        { id: "b", text: "Because example-driven ordering isn't reliably enforced; use programmatic prerequisites instead." },
        { id: "c", text: "Because few-shot examples disable `tool_choice`." },
        { id: "d", text: "Because Claude treats tool_a and tool_b as interchangeable by default." },
      ],
      correctChoiceId: "b",
      explanation:
        "The exam-traps table calls this out: examples cannot reliably enforce hard ordering constraints; the correct approach is programmatic prerequisites in your agent loop (i.e., refuse to dispatch tool_b until tool_a has produced its result).",
    },
    {
      id: "q19",
      prompt:
        "Which `tool_choice` setting is appropriate when the application requires that *some* tool be invoked on every turn, but you don't care which one the model picks?",
      choices: [
        { id: "a", text: "`{ type: \"auto\" }`" },
        { id: "b", text: "`{ type: \"none\" }`" },
        { id: "c", text: "`{ type: \"any\" }`" },
        { id: "d", text: "`{ type: \"tool\", name: \"any\" }`" },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's table maps `tool_choice: { type: \"any\" }` to 'Model must call some tool but picks which' with the use case 'When any tool action is required.' `auto` allows skipping tools, `none` forbids them, and there is no special `name: \"any\"` form.",
    },
    {
      id: "q20",
      prompt:
        "After two retry attempts, your validation-retry loop still fails because the model keeps emitting low-confidence guesses. Which schema change addresses the root cause?",
      choices: [
        { id: "a", text: "Drop validation entirely — the user can clean the data later." },
        { id: "b", text: "Add `\"unclear\"` to the relevant enums so the model can honestly defer instead of guessing." },
        { id: "c", text: "Mark every field as `required` so the model commits to values." },
        { id: "d", text: "Switch `tool_choice` from a specific tool to `any` to give the model more freedom." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module ties low-confidence fabrication directly to missing escape hatches: 'For classification tasks, include \"unclear\" as a valid value' and 'always include an escape hatch.' Adding a deferral value lets the model express uncertainty instead of producing confident wrong values that keep failing semantic validation.",
    },
  ],
};

export default quiz;
