# Module 2 — Claude Code Configuration & Workflows

> **Domain weight: 20%.**
> Estimated effort: ~2.5 hrs reading + 1 hr hands-on.

---

## Why this domain matters

Claude Code is the default delivery vehicle for Anthropic's developer-tooling story. The exam tests whether you can configure it correctly for a real team — memory hierarchy, skills, hooks, headless CI/CD, and the line between "what goes in a prompt" and "what goes in code".

The wrong answers usually involve **putting too much in the prompt** ("just tell Claude in CLAUDE.md not to delete files") instead of using the deterministic mechanism (a hook).

---

## Learning objectives

- Recite the **CLAUDE.md memory hierarchy** in order.
- Decide what goes in `CLAUDE.md` vs. `.claude/rules/*.md` vs. a skill vs. a hook.
- Write skill frontmatter correctly (`context: fork`, `allowed-tools`, `argument-hint`).
- Choose between **plan mode**, direct execution, and **headless `-p`** for the right scenario.
- Configure CI/CD with Claude Code in GitHub Actions.

---

## The memory hierarchy

This is the order Claude Code applies configuration. **Higher precedence wins** when entries conflict.

1. **Managed Policy** — enterprise-managed; not user-editable
2. **Managed Drop-ins** — enterprise-managed additional context
3. **Project Memory** — `CLAUDE.md` at the project root (committed)
4. **Project Rules** — `.claude/rules/*.md` (committed; path-globbed)
5. **User Memory** — `~/.claude/CLAUDE.md` (your personal global)
6. **User Rules** — `~/.claude/rules/*.md`
7. **Local Project Memory** — `CLAUDE.local.md` (project, **gitignored**)
8. **Auto Memory** — Claude Code's learned context for the project

### File-size guidance

- **Keep `CLAUDE.md` under ~200 lines.** Long memory dilutes attention and slows the loop.
- Split overflow into `.claude/rules/*.md` with **path globs** so each rule only loads when relevant.

```markdown
<!-- .claude/rules/api.md -->
---
glob: "apps/api/**/*.ts"
---

# API conventions
- All NestJS controllers must use the `@UseGuards(AuthGuard)` decorator.
- Always emit structured logs via the `Logger` from `@app/logger`.
- Errors must extend `BaseHttpException`.
```

---

## Where things live

| File | Scope | Committed? | Purpose |
|---|---|---|---|
| `CLAUDE.md` | Project | **Yes** | Top-level project memory |
| `.claude/rules/*.md` | Project, path-scoped | **Yes** | Conventions that apply to a subset of files |
| `.claude/skills/*/SKILL.md` | Project | **Yes** | Reusable, invokable capabilities |
| `.claude/agents/*.md` | Project | **Yes** | Markdown-defined subagents (CLI-level) |
| `.claude/hooks/*.sh` | Project | **Yes** | Deterministic enforcement on tool events |
| `.mcp.json` | Project | **Yes** | MCP server registry |
| `~/.claude.json` | User | **No** | User secrets, machine-local config |
| `CLAUDE.local.md` | Project | **No** (gitignored) | Per-developer overrides |

> **Exam trap:** `.mcp.json` is **committed to the repo**. `~/.claude.json` is **machine-local**. Never commit user secrets — reference env vars from `.mcp.json` instead.

---

## Skills

Skills are reusable, declaratively-defined capabilities that Claude can invoke. They live in `.claude/skills/<name>/SKILL.md`.

```markdown
---
name: release-notes
description: Generate release notes from git history between two refs.
allowed-tools:
  - Read
  - Bash(git log:*)
  - Bash(git diff:*)
argument-hint: <from-ref> <to-ref>
context: fork
---

# Release notes skill

When invoked, gather commits between the two refs and produce a markdown
release-notes section grouped by feat / fix / chore.
```

### Critical frontmatter fields

| Field | What it does |
|---|---|
| `name` | Identifier used to invoke the skill |
| `description` | Surface-level summary; the model uses it to decide *whether* to invoke |
| `allowed-tools` | Restrict which tools the skill may use (security boundary) |
| `argument-hint` | Tells the user how to pass arguments |
| `context: fork` | **Run in an isolated context window** — does NOT inherit parent's loaded files |

> **Exam trap:** With `context: fork`, the skill does NOT see the parent conversation. If you need state passed in, do it via arguments.

---

## Hooks

Hooks are **deterministic enforcement** points around tool calls. They run shell commands at well-defined events and can **block** tool execution by exiting non-zero.

| Event | Fires |
|---|---|
| `PreToolUse` | Before a tool is invoked. Exit non-zero to block. |
| `PostToolUse` | After a tool completes. For logging / cleanup. |

```bash
#!/usr/bin/env bash
# .claude/hooks/pre-bash.sh — block dangerous bash commands

CMD="$CLAUDE_TOOL_INPUT_command"

if [[ "$CMD" =~ rm[[:space:]]+-rf ]]; then
  echo "Blocked: rm -rf is forbidden in this repo." >&2
  exit 1
fi

if [[ "$CMD" =~ \.env ]]; then
  echo "Blocked: writes to .env are forbidden." >&2
  exit 1
fi

exit 0
```

### Deterministic vs. probabilistic

> **Hooks** = deterministic. Use for compliance, security, destructive-action prevention.
> **Prompt instructions** = probabilistic. Use for style, tone, soft preferences.

If a rule **must** be enforced (e.g., refunds > $500 require approval), put it in a hook. The model will sometimes ignore prompt instructions — it can never bypass a hook.

---

## Plan mode vs. direct execution vs. headless

| Mode | When | Behavior |
|---|---|---|
| **Plan mode** | Scope is unclear; you want a preview | Read-only exploration; produces a plan; user approves before execution |
| **Direct execution** | Scope is clear; small / safe edits | Claude executes immediately |
| **Headless `claude -p "<prompt>"`** | CI/CD, scripts, scheduled jobs | Non-interactive; pair with `--output-format json` for parsable output |

```bash
# CI usage example
claude -p "Run the test suite and summarize failures by module." \
  --output-format json \
  --max-turns 10 \
  > result.json
```

---

## GitHub Actions integration

```yaml
# .github/workflows/claude-review.yml
name: Claude PR Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Review the diff for security issues, return a JSON list."
          output-format: json
```

---

## Subagents in Claude Code (CLI vs. SDK)

These are different things and the exam can trip you up:

| Subagent type | Defined where | Invoked how |
|---|---|---|
| **CLI subagent** | `.claude/agents/<name>.md` (markdown) | The user types `@<name>` or Claude routes to it |
| **SDK subagent** | TypeScript / Python via the Agent SDK | The coordinator spawns via the `Task` tool |

The CLI form is for end-user developer workflows (e.g., "ask the `code-reviewer` agent"). The SDK form is for programmatic multi-agent orchestration.

---

## Reading queue

1. [Memory hierarchy](https://code.claude.com/docs/en/memory) — recite this verbatim
2. [Skills](https://code.claude.com/docs/en/skills) — frontmatter + isolation
3. [Hooks](https://code.claude.com/docs/en/hooks) — events + blocking
4. [Sub-agents](https://code.claude.com/docs/en/sub-agents) — `.claude/agents/` markdown
5. [Headless mode](https://code.claude.com/docs/en/headless) + [GitHub Actions](https://code.claude.com/docs/en/github-actions)
6. Skilljar — *Claude Code in Action* (re-skim chapters on rules and hooks)

---

## Hands-on exercise

In a sample repo, create:

- A `CLAUDE.md` (project root) — under 100 lines, points to rules.
- A `.claude/rules/api.md` with a glob like `apps/api/**/*.ts` — TypeScript-specific conventions.
- A `.claude/skills/release-notes/SKILL.md` with `context: fork` and `allowed-tools: ["Read", "Bash(git log:*)"]`.
- A `.claude/hooks/pre-bash.sh` that **blocks** any `rm -rf` or write to `.env`.
- A `.mcp.json` referencing a local MCP server.

---

## Self-check

- [ ] I can recite the 8-level memory hierarchy without checking docs.
- [ ] I know why a skill with `context: fork` does NOT inherit the parent's loaded files.
- [ ] I know `.mcp.json` is committed; user secrets go in env vars referenced by it, never in the file itself.
- [ ] I can write a hook that exits non-zero to block a tool call.
- [ ] I can run a Claude Code task in CI with `claude -p` and parse the JSON output.
- [ ] I know the difference between CLI subagents (`.claude/agents/`) and SDK subagents (`Task` tool).

---

## Exam traps to reject

| Tempting wrong answer | Why it's wrong |
|---|---|
| "Put all conventions in one giant CLAUDE.md so the model has full context" | Keep it < 200 lines; split with `.claude/rules/` |
| "Use prompt instructions ('please do not delete files') for compliance" | Probabilistic — use a hook for deterministic enforcement |
| "Commit `~/.claude.json` to the repo for team consistency" | User-level / machine-local; commit `.mcp.json` instead |
| "Skills always inherit the loaded context from the parent" | Wrong when `context: fork` |
| "Use plan mode for every task to be safe" | Overkill for simple edits; reserve for unclear scope |
| "Hooks run after the tool call to log results" | `PreToolUse` runs *before* and can block |

---

## Decision tree: where does this rule belong?

```
Is the rule security/compliance critical?
├─ Yes → Hook (deterministic)
└─ No  → Is it about file conventions?
         ├─ Whole project → CLAUDE.md
         └─ Specific paths → .claude/rules/*.md (with glob)

Is it a reusable capability the user will invoke?
└─ Yes → .claude/skills/*/SKILL.md

Does it spawn its own context-isolated agent?
├─ User-facing CLI → .claude/agents/*.md
└─ Programmatic    → Agent SDK + Task tool
```
