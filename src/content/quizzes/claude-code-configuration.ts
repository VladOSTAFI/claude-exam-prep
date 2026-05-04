import type { Quiz } from "@/types/quiz";

const quiz: Quiz = {
  slug: "claude-code-configuration",
  title: "Claude Code Configuration & Workflows",
  questions: [
    {
      id: "q1",
      prompt:
        "Your team needs to ensure Claude Code never executes `rm -rf` commands in the project. A colleague suggests adding this rule to `CLAUDE.md`. Why is this the wrong approach?",
      choices: [
        { id: "a", text: "CLAUDE.md does not support negative rules; you must use allowlist syntax only." },
        { id: "b", text: "Prompt instructions are probabilistic — the model may sometimes ignore them. Use a PreToolUse hook instead." },
        { id: "c", text: "CLAUDE.md rules are only enforced in plan mode, not direct execution mode." },
        { id: "d", text: "You should place the rule in `.claude/rules/*.md` with a glob pattern, not in the root CLAUDE.md." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module draws a sharp distinction: hooks are deterministic (binary pass/fail), while prompt instructions are probabilistic and the model may occasionally ignore them. For a compliance rule that 'must' be enforced, a PreToolUse hook that exits non-zero is the correct mechanism.",
    },
    {
      id: "q2",
      prompt:
        "In the Claude Code memory hierarchy, which level has the HIGHEST precedence when entries conflict?",
      choices: [
        { id: "a", text: "Project Memory — CLAUDE.md at the project root." },
        { id: "b", text: "User Memory — ~/.claude/CLAUDE.md (personal global)." },
        { id: "c", text: "Managed Policy — enterprise-managed, not user-editable." },
        { id: "d", text: "Auto Memory — Claude Code's learned context." },
      ],
      correctChoiceId: "c",
      explanation:
        "The 8-level hierarchy runs from Managed Policy (highest) down to Auto Memory (lowest). Enterprise-managed Managed Policy sits at the top precisely because it must override everything else for compliance and governance purposes.",
    },
    {
      id: "q3",
      prompt:
        "A skill defined with `context: fork` is invoked. What does this mean for the skill's access to the parent conversation?",
      choices: [
        { id: "a", text: "The skill can read the parent conversation but cannot modify it." },
        { id: "b", text: "The skill inherits all files loaded in the parent context, but not the message history." },
        { id: "c", text: "The skill runs in a completely isolated context window and does NOT inherit the parent's loaded files or messages." },
        { id: "d", text: "The skill forks a copy of the parent context so changes remain isolated until merged." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module states explicitly: 'With `context: fork`, the skill does NOT see the parent conversation. If you need state passed in, do it via arguments.' The isolation is total — neither files nor messages are inherited.",
    },
    {
      id: "q4",
      prompt:
        "Your CI pipeline needs Claude Code to analyze test failures and produce parseable output. Which command invocation is correct?",
      choices: [
        { id: "a", text: "`claude --plan 'Summarize failures'` — plan mode produces the cleanest output for CI." },
        { id: "b", text: "`claude -p 'Summarize failures' --output-format json` — headless mode with JSON output." },
        { id: "c", text: "`claude --interactive 'Summarize failures'` — interactive mode can be piped." },
        { id: "d", text: "`claude --agent 'Summarize failures'` — agent mode handles CI contexts automatically." },
      ],
      correctChoiceId: "b",
      explanation:
        "Headless mode (`claude -p`) is designed for non-interactive use in CI/CD and scripts. Pairing it with `--output-format json` produces parseable output. Plan mode is for user-approved scoping before execution, not CI automation.",
    },
    {
      id: "q5",
      prompt:
        "Where should MCP server secrets (e.g., API keys) be stored when configuring an MCP server for the team?",
      choices: [
        { id: "a", text: "Inline in `.mcp.json` so every team member shares the same config without manual setup." },
        { id: "b", text: "In `CLAUDE.local.md` — it is gitignored, so secrets stay off the remote." },
        { id: "c", text: "Referenced as environment variables in `.mcp.json`, which is committed; actual secrets live in env vars outside the repo." },
        { id: "d", text: "In `~/.claude.json` committed to the repo for team consistency." },
      ],
      correctChoiceId: "c",
      explanation:
        "`.mcp.json` is committed to the repo (it's the registry) but must never contain secrets inline. Secrets are referenced as `${ENV_VAR_NAME}` and resolved at runtime from the environment. `~/.claude.json` is machine-local and must never be committed.",
    },
    {
      id: "q6",
      prompt:
        "Your `CLAUDE.md` has grown to 600 lines covering API conventions, frontend rules, and deployment notes. Which refactor best matches the module's guidance?",
      choices: [
        { id: "a", text: "Leave it — more context always improves model performance." },
        { id: "b", text: "Move everything into `~/.claude/CLAUDE.md` so it is shared across all your projects." },
        { id: "c", text: "Keep `CLAUDE.md` under ~200 lines and split overflow into `.claude/rules/*.md` files with path globs so each rule loads only when relevant." },
        { id: "d", text: "Move everything into `CLAUDE.local.md` to keep the repo clean." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module explicitly says to keep `CLAUDE.md` under ~200 lines because long memory dilutes attention and slows the loop. Overflow belongs in `.claude/rules/*.md` with `glob:` frontmatter so it only loads for relevant paths.",
    },
    {
      id: "q7",
      prompt:
        "Which file is intentionally gitignored in the Claude Code memory hierarchy?",
      choices: [
        { id: "a", text: "`.claude/rules/*.md`" },
        { id: "b", text: "`CLAUDE.local.md`" },
        { id: "c", text: "`CLAUDE.md`" },
        { id: "d", text: "`.mcp.json`" },
      ],
      correctChoiceId: "b",
      explanation:
        "Per the 'Where things live' table, `CLAUDE.local.md` is the per-developer overrides file and is the project-scope memory entry that is not committed. `CLAUDE.md`, `.claude/rules/*.md`, and `.mcp.json` are all committed.",
    },
    {
      id: "q8",
      prompt:
        "Which Claude Code event fires BEFORE a tool call and can block its execution by exiting non-zero?",
      choices: [
        { id: "a", text: "`PostToolUse`" },
        { id: "b", text: "`OnToolError`" },
        { id: "c", text: "`PreToolUse`" },
        { id: "d", text: "`PreSession`" },
      ],
      correctChoiceId: "c",
      explanation:
        "The hooks table lists `PreToolUse` as firing before a tool is invoked, with non-zero exit blocking the call. `PostToolUse` fires after for logging or cleanup and cannot prevent the tool from running.",
    },
    {
      id: "q9",
      prompt:
        "A teammate wants to write a CLI subagent so developers can type `@code-reviewer` to invoke it. Where should the subagent definition live?",
      choices: [
        { id: "a", text: "`.claude/skills/code-reviewer/SKILL.md`" },
        { id: "b", text: "`.claude/agents/code-reviewer.md`" },
        { id: "c", text: "Inside `CLAUDE.md` under a `## Subagents` heading." },
        { id: "d", text: "Programmatically via the Agent SDK and the `Task` tool." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module distinguishes CLI subagents (defined as markdown in `.claude/agents/<name>.md`, invoked with `@<name>`) from SDK subagents (TypeScript/Python via the Agent SDK, spawned with the `Task` tool). The `@`-mention developer workflow is the CLI form.",
    },
    {
      id: "q10",
      prompt:
        "You want a release-notes skill that always starts in a clean state regardless of what the developer was just doing. Which frontmatter field provides this behavior?",
      choices: [
        { id: "a", text: "`allowed-tools: []`" },
        { id: "b", text: "`argument-hint: --clean`" },
        { id: "c", text: "`context: fork`" },
        { id: "d", text: "`name: release-notes-isolated`" },
      ],
      correctChoiceId: "c",
      explanation:
        "`context: fork` runs the skill in an isolated context window — it does not inherit the parent's loaded files or message history. State must be passed via arguments, which is exactly the use case described.",
    },
    {
      id: "q11",
      prompt:
        "Which scenario is the BEST fit for plan mode rather than direct execution?",
      choices: [
        { id: "a", text: "Renaming a single CSS class across two files." },
        { id: "b", text: "A scheduled nightly CI job that summarizes test results." },
        { id: "c", text: "Refactoring an unfamiliar service where the scope of changes is unclear and you want to review before execution." },
        { id: "d", text: "Fixing a typo in a README." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module says plan mode is for when 'scope is unclear; you want a preview' — read-only exploration that produces a plan for the user to approve. Small/safe edits use direct execution; CI/scheduled jobs use headless `-p`.",
    },
    {
      id: "q12",
      prompt:
        "In a `.claude/rules/api.md` file, what is the role of the `glob:` field in the frontmatter?",
      choices: [
        { id: "a", text: "It restricts which tools the rule may invoke, similar to `allowed-tools`." },
        { id: "b", text: "It path-scopes the rule so it only loads when files matching the glob are in context." },
        { id: "c", text: "It tells Claude to apply the rule globally, overriding `CLAUDE.md`." },
        { id: "d", text: "It is purely informational; the runtime ignores it." },
      ],
      correctChoiceId: "b",
      explanation:
        "The example `.claude/rules/api.md` uses `glob: \"apps/api/**/*.ts\"` to make the rule load only when API TypeScript files are involved. This keeps memory usage low and attention focused — the whole point of splitting overflow out of `CLAUDE.md`.",
    },
    {
      id: "q13",
      prompt:
        "Within a hook script, how does the script learn what command Claude is about to run via Bash?",
      choices: [
        { id: "a", text: "By parsing argv from the shell invocation." },
        { id: "b", text: "By reading the `CLAUDE_TOOL_INPUT_command` environment variable." },
        { id: "c", text: "By tailing `~/.claude/log/last-tool.json`." },
        { id: "d", text: "By calling the `claude inspect` subcommand from within the hook." },
      ],
      correctChoiceId: "b",
      explanation:
        "The example pre-bash hook reads `CLAUDE_TOOL_INPUT_command` to inspect the pending command. Hooks receive tool input via `CLAUDE_TOOL_INPUT_*` environment variables, then exit non-zero to block.",
    },
    {
      id: "q14",
      prompt:
        "Which statement about `.mcp.json` and `~/.claude.json` is correct?",
      choices: [
        { id: "a", text: "Both should be committed to the repo for team consistency." },
        { id: "b", text: "Neither should be committed — both are machine-local." },
        { id: "c", text: "`.mcp.json` is committed (project-scope MCP registry); `~/.claude.json` is machine-local user config and must NOT be committed." },
        { id: "d", text: "`.mcp.json` is gitignored; `~/.claude.json` is the canonical project file." },
      ],
      correctChoiceId: "c",
      explanation:
        "The exam-trap callout is explicit: `.mcp.json` is committed to the repo, while `~/.claude.json` is machine-local and contains user secrets. Never commit user secrets — reference env vars from `.mcp.json` instead.",
    },
    {
      id: "q15",
      prompt:
        "An SDK subagent (vs. a CLI subagent) is invoked how?",
      choices: [
        { id: "a", text: "By the user typing `@<name>` in the Claude Code CLI." },
        { id: "b", text: "By placing a markdown file in `.claude/agents/`." },
        { id: "c", text: "By a coordinator spawning it via the `Task` tool from the Agent SDK." },
        { id: "d", text: "By configuring it as a hook on `PreToolUse`." },
      ],
      correctChoiceId: "c",
      explanation:
        "The CLI vs. SDK subagent table specifies that SDK subagents are defined in TypeScript/Python via the Agent SDK and the coordinator spawns them via the `Task` tool. CLI subagents are the `@<name>` markdown form in `.claude/agents/`.",
    },
    {
      id: "q16",
      prompt:
        "A skill's frontmatter sets `allowed-tools: [Read, Bash(git log:*), Bash(git diff:*)]`. What is this primarily achieving?",
      choices: [
        { id: "a", text: "Performance — restricting tools makes the skill run faster." },
        { id: "b", text: "A security boundary — the skill is restricted to those tools only and cannot, e.g., write files or run arbitrary bash." },
        { id: "c", text: "Documentation — it has no runtime effect, but tells the user what to expect." },
        { id: "d", text: "Cost — it limits the model's token usage during the skill." },
      ],
      correctChoiceId: "b",
      explanation:
        "The frontmatter table describes `allowed-tools` as a security boundary: it restricts which tools the skill may use. A release-notes skill that only needs Read and specific git commands should not have access to Write or arbitrary Bash.",
    },
    {
      id: "q17",
      prompt:
        "Where does the `anthropics/claude-code-action@v1` GitHub Action obtain its API key in the example workflow?",
      choices: [
        { id: "a", text: "From a hardcoded value in `.mcp.json`." },
        { id: "b", text: "From `~/.claude.json` checked into the repo." },
        { id: "c", text: "From a GitHub Actions secret referenced as `${{ secrets.ANTHROPIC_API_KEY }}`." },
        { id: "d", text: "From a `CLAUDE.local.md` shared via a private gist." },
      ],
      correctChoiceId: "c",
      explanation:
        "The CI example wires `api-key: ${{ secrets.ANTHROPIC_API_KEY }}` from GitHub Actions secrets. This is the same principle as `.mcp.json` referencing env vars: secrets stay outside the repo.",
    },
    {
      id: "q18",
      prompt:
        "Per the decision tree, where should a reusable, user-invokable capability — like 'generate release notes between two refs' — live?",
      choices: [
        { id: "a", text: "`CLAUDE.md`" },
        { id: "b", text: "`.claude/hooks/*.sh`" },
        { id: "c", text: "`.claude/skills/*/SKILL.md`" },
        { id: "d", text: "`~/.claude.json`" },
      ],
      correctChoiceId: "c",
      explanation:
        "The decision tree routes 'reusable capability the user will invoke' to `.claude/skills/*/SKILL.md`. Hooks are for deterministic enforcement, `CLAUDE.md` is for project memory, and `~/.claude.json` is machine-local user config.",
    },
    {
      id: "q19",
      prompt:
        "Which of the following memory layers is the LOWEST precedence in the 8-level hierarchy?",
      choices: [
        { id: "a", text: "Auto Memory — Claude Code's learned context for the project." },
        { id: "b", text: "Project Rules — `.claude/rules/*.md`." },
        { id: "c", text: "User Memory — `~/.claude/CLAUDE.md`." },
        { id: "d", text: "Local Project Memory — `CLAUDE.local.md`." },
      ],
      correctChoiceId: "a",
      explanation:
        "The hierarchy lists Auto Memory at position 8 — the lowest precedence. It is overridden by everything else, including the developer's own `CLAUDE.local.md`, which is a level above it.",
    },
    {
      id: "q20",
      prompt:
        "Which of these is described in the module as an 'exam trap' — a tempting but wrong answer?",
      choices: [
        { id: "a", text: "Use `.claude/rules/*.md` with path globs to scope conventions to a subset of files." },
        { id: "b", text: "Use plan mode for every task, even simple edits, to be safe." },
        { id: "c", text: "Use a `PreToolUse` hook to block writes to `.env` files." },
        { id: "d", text: "Reference secrets as env vars in `.mcp.json` rather than inlining them." },
      ],
      correctChoiceId: "b",
      explanation:
        "The 'Exam traps to reject' table flags 'Use plan mode for every task to be safe' as wrong: plan mode is overkill for simple edits and should be reserved for unclear scope. The other options describe the module's recommended practices.",
    },
  ],
};

export default quiz;
