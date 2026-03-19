# Module 3: Claude Code Configuration & Workflows
**Weight:** 20% of exam | 6 Task Statements

---

## Module Overview

This module covers advanced Claude Code configuration, workflow optimization, and integration strategies. You'll learn to structure multi-layered configurations, create custom commands and skills, apply context-aware rules, and integrate Claude Code into production pipelines.

**Estimated study time:** 4-5 hours
**Hands-on practice time:** 2-3 hours

---

## Task 3.1: Configure CLAUDE.md Files with Appropriate Hierarchy, Scoping, and Modular Organization

### Core Concepts

CLAUDE.md files enable Claude Code to understand project conventions, constraints, and preferences. The power of CLAUDE.md lies in its hierarchical structure—different files apply at different scopes.

#### CLAUDE.md Hierarchy Levels

| Level | Location | Scope | Shared | Use Case |
|-------|----------|-------|--------|----------|
| **User-level** | `~/.claude/CLAUDE.md` | All projects on machine | No (local only) | Personal preferences, global tools, security policies |
| **Project-level** | `.claude/CLAUDE.md` or `CLAUDE.md` (root) | Entire project | Yes (via VCS) | Team conventions, project architecture, build standards |
| **Directory-level** | `subdirectory/CLAUDE.md` | Files in that directory and below | Yes (via VCS) | Module-specific conventions, isolated subsystems |

**Hierarchy precedence:** User-level settings are overridden by project-level, which are overridden by directory-level.

### Configuration Patterns

#### Example 1: Multi-Level CLAUDE.md Setup

**User-level (~/.claude/CLAUDE.md):**
```yaml
# Global security and tool preferences
security:
  disallow-dangerous-operations: true
  require-explicit-approval:
    - file-deletion
    - git-force-push
    - database-migrations

ai-settings:
  default-model: claude-opus-4
  thinking-budget: 10000
  session-mode: auto

tools:
  preferred-search: ripgrep
  lint-command: biome check
```

**Project-level (.claude/CLAUDE.md):**
```yaml
project: "E-commerce Platform"
description: "Full-stack web application with React frontend and Node.js backend"

conventions:
  naming:
    components: PascalCase
    functions: camelCase
    constants: UPPER_SNAKE_CASE
    files: kebab-case

  structure:
    components: src/components/
    utils: src/utils/
    styles: src/styles/
    tests: __tests__/

standards:
  language: TypeScript
  testing: Jest + React Testing Library
  linting: ESLint + Prettier
  version-control: Git with conventional commits

build:
  package-manager: pnpm
  scripts:
    test: "pnpm test"
    build: "pnpm build"
    lint: "pnpm lint"
    dev: "pnpm dev"

architecture:
  backend: Node.js with Express
  frontend: React 18 with Next.js
  database: PostgreSQL
  cache: Redis
  deployment: Docker containers on Kubernetes

database:
  type: PostgreSQL
  migrations-location: db/migrations/
  backup-strategy: Daily snapshots to S3
  naming-convention: snake_case for tables/columns

api:
  version: v1
  auth: JWT tokens with 24h expiration
  rate-limiting: 1000 requests/minute per API key
  documentation: OpenAPI 3.0 in docs/api/

testing-standards:
  unit-coverage: 80%
  integration-coverage: 60%
  critical-paths-coverage: 100%

important-constraints:
  - "No external API calls in unit tests; use mocks"
  - "Database migrations must be reversible"
  - "All components must support dark mode"
  - "No hardcoded API endpoints; use environment variables"
```

**Directory-level (src/components/CLAUDE.md):**
```yaml
# Component-specific conventions
scope: React Component Library

naming:
  # All files are React components
  file-format: "[ComponentName].tsx"
  exports: "export default [ComponentName]"

structure:
  required-files:
    - "[ComponentName].tsx" # Component implementation
    - "[ComponentName].test.tsx" # Tests
    - "[ComponentName].module.css" # Styles
    - "index.ts" # Public export

patterns:
  functional-components: true
  hooks-preferred: true
  prop-interfaces: "Define Props interface above component"

testing:
  renderer: "React Testing Library"
  setup-file: "__tests__/setup.ts"
  utils: "__tests__/test-utils.tsx"

accessibility:
  wcag-level: AA
  required-checks:
    - "Keyboard navigation tested"
    - "ARIA labels present where needed"
    - "Color contrast > 4.5:1"
```

### Using @import for Modular Organization

The `@import` syntax lets you split CLAUDE.md into focused files while maintaining a logical structure.

**Example: .claude/CLAUDE.md with imports**
```yaml
project: "E-commerce Platform"

# Core project info
conventions:
  @import: "./.claude/rules/conventions.yaml"

testing-standards:
  @import: "./.claude/rules/testing.yaml"

database:
  @import: "./.claude/rules/database.yaml"

security:
  @import: "./.claude/rules/security.yaml"
```

**.claude/rules/conventions.yaml:**
```yaml
naming:
  components: PascalCase
  functions: camelCase
  constants: UPPER_SNAKE_CASE
  files: kebab-case

structure:
  components: src/components/
  utils: src/utils/
  styles: src/styles/
  tests: __tests__/
```

**.claude/rules/testing.yaml:**
```yaml
unit-coverage: 80%
integration-coverage: 60%
critical-paths-coverage: 100%
framework: Jest
timeout: 10000ms
reporters:
  - default
  - coverage
```

**.claude/rules/database.yaml:**
```yaml
type: PostgreSQL
migrations-location: db/migrations/
backup-strategy: Daily snapshots to S3
naming-convention: snake_case
max-connection-pool: 20
```

**.claude/rules/security.yaml:**
```yaml
authentication: JWT with 24h expiration
password-hashing: bcrypt with 12 rounds
rate-limiting: 1000 req/min per API key
allowed-environment-variables:
  - DATABASE_URL
  - REDIS_URL
  - API_KEY
disallow-secrets-in-code: true
required-security-reviews:
  - Authentication changes
  - Database access patterns
```

### Diagnostic Skills: Identifying Hierarchy Issues

**Common problem:** Conflicting rules across hierarchy levels

**Solution approach:**
1. Check which CLAUDE.md files exist in the path hierarchy
2. Verify which rules apply at your current location
3. Use `/memory claude-md-hierarchy` to track the loaded configuration
4. Use specific imports to avoid duplication and conflicts

**Example diagnostic flow:**
```
Current file: src/components/Button/Button.tsx

Loaded configurations (in precedence order):
1. ~/.claude/CLAUDE.md (user-level defaults)
2. ./.claude/CLAUDE.md (project-level)
3. ./src/CLAUDE.md (if exists)
4. ./src/components/CLAUDE.md (if exists)
5. ./src/components/Button/CLAUDE.md (if exists)

Check: Are component naming conventions defined at multiple levels?
Action: Consolidate into single location, use @import in others
```

### Key Exam Tips for Task 3.1

- **Remember:** User-level CLAUDE.md is never committed; it's personal to the developer's machine
- **File location matters:** `.claude/CLAUDE.md` vs `CLAUDE.md` in root—both work, but `.claude/` is cleaner
- **Modularization strategy:** Use `@import` to split files larger than 100 lines
- **Testing:** Create `test-scenarios.md` documenting expected behavior when applying CLAUDE.md rules
- **Common mistake:** Forgetting that subdirectory CLAUDE.md requires explicit file paths; use absolute paths from project root

---

## Task 3.2: Create and Configure Custom Slash Commands and Skills

### Understanding Commands vs Skills

**Slash commands** are interactive prompts that modify how Claude Code behaves during a session. They're lightweight and synchronous.

**Skills** are self-contained, reusable agents that can run in isolation with their own context, allowed tools, and output formatting.

| Feature | Slash Command | Skill |
|---------|---------------|-------|
| **Scope** | Interactive/manual | Standalone execution |
| **Output** | Integrated in session | Can fork/isolate |
| **Persistence** | Session-local | Can be versioned |
| **Tools** | Full access | Configurable via `allowed-tools` |
| **Use case** | Quick in-session modifications | Reusable workflows, CI automation |

### Slash Commands: Project-Scoped vs User-Scoped

**.claude/commands/ (Project-scoped - Version Controlled)**

Location: `.claude/commands/command-name`

```yaml
# .claude/commands/review
name: review
description: "Perform security-focused code review on current file"
prompt: |
  Review this code for:
  1. Security vulnerabilities (OWASP Top 10)
  2. Performance issues (N+1 queries, memory leaks)
  3. Type safety (TypeScript strict mode violations)
  4. Test coverage gaps
  5. Documentation completeness

  Format findings as:
  - CRITICAL: [security/performance issue]
  - WARNING: [code quality issue]
  - INFO: [improvement suggestion]
```

**~/.claude/commands/ (User-scoped - Local Only)**

Location: `~/.claude/commands/quick-fix`

```yaml
# ~/.claude/commands/quick-fix
name: quick-fix
description: "Fix common linting issues in current file"
prompt: |
  Fix the following in this file:
  1. Remove unused imports
  2. Fix ESLint violations
  3. Format with Prettier
  4. Correct type annotations

  Show only the corrected code sections.
```

### Skills: Deep Dive

Skills are the advanced feature for complex, reusable workflows.

#### Skill File Structure

```
.claude/skills/
├── refactor-component/
│   ├── SKILL.md          # Skill definition with frontmatter
│   └── examples/         # Optional: example inputs/outputs
│       └── example-1.md
└── generate-tests/
    ├── SKILL.md
    └── templates/
        └── test-template.ts
```

#### SKILL.md Format with Frontmatter

```markdown
---
context: fork          # fork = isolated subagent, default = inherit session
allowed-tools:         # Tools this skill can use
  - read
  - write
  - bash
argument-hint: "<source file path>"  # Helper text for user
---

# Refactor React Component

You are a React component refactoring specialist. Your task is to modernize a React component.

## Your Instructions

1. **Analyze the current component:**
   - Identify class vs functional syntax
   - Find outdated hook patterns
   - Check for prop-drilling
   - Review lifecycle usage

2. **Create refactored version:**
   - Convert to functional component with hooks
   - Use custom hooks for reusable logic
   - Apply context for prop drilling avoidance
   - Add TypeScript types

3. **Preserve behavior:**
   - All tests must pass
   - No visual changes
   - Same API surface
   - Backward compatible

4. **Output format:**
   - Show before/after code sections
   - Explain each change
   - Document any breaking changes (if necessary)

## Example Input
```typescript
class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
  }

  render() {
    return <button onClick={() => this.setState({ clicked: true })}>{this.props.label}</button>;
  }
}
```

## Example Output
```typescript
function Button({ label }: { label: string }) {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <button onClick={() => setIsClicked(true)}>
      {label}
    </button>
  );
}
```

---

# Advanced Skills with Context: Fork

```markdown
---
context: fork          # Runs in isolated subagent, prevents noise in main session
allowed-tools:
  - bash
  - read
  - write
argument-hint: "<directory path for analysis>"
---

# Deep Code Analysis Skill

Analyze codebase structure and dependencies in isolation.

## Your Task

Produce a detailed analysis report including:
- Module dependency graph
- Circular dependency detection
- Unused exports
- Code complexity metrics

All analysis output is contained in this subagent.
---
```

### Personal Skill Customization

**~/.claude/skills/my-formatter/**
```markdown
---
context: default
allowed-tools:
  - read
  - write
argument-hint: "<file path>"
---

# My Custom Code Formatter

My personal formatter with my preferred style rules.
```

### Skill Decision Matrix

When should you create a skill vs use CLAUDE.md?

| Scenario | Use Skill | Use CLAUDE.md |
|----------|-----------|--------------|
| Simple formatting rules | ✗ | ✓ |
| Reusable multi-step workflow | ✓ | ✗ |
| Team convention (non-interactive) | ✗ | ✓ |
| Interactive tool with arguments | ✓ | ✗ |
| Context isolation needed | ✓ | ✗ |
| Verbose intermediate output | ✓ (with fork) | ✗ |

### Example: Project-Scoped Command + Skill Combination

**.claude/commands/test-route**
```yaml
name: test-route
description: "Generate comprehensive tests for an API route"
prompt: |
  For the current API route, generate tests covering:
  - Happy path (valid inputs)
  - Error cases (validation, auth, not found)
  - Edge cases (empty inputs, rate limiting)
  - Performance (response time <100ms)

  Use the test-generator skill for detailed implementation.
```

**.claude/skills/test-generator/SKILL.md**
```markdown
---
context: fork
allowed-tools:
  - read
  - write
  - bash
argument-hint: "<route file path>"
---

# Test Generator Skill

Generate comprehensive Jest test suites for API routes.

This skill runs in fork mode to keep test generation output isolated.

[Detailed implementation...]
```

### Key Exam Tips for Task 3.2

- **Scope decision:** Project commands (.claude/commands/) for team collaboration; user commands (~/.claude/commands/) for personal tools
- **Context: fork is your friend** when you have verbose intermediate steps
- **allowed-tools whitelist:** Always be restrictive—include only necessary tools
- **argument-hint:** Make skills self-documenting with clear input requirements
- **Common mistake:** Creating skills for one-off tasks instead of reusable workflows

---

## Task 3.3: Apply Path-Specific Rules for Conditional Convention Loading

### Path-Scoped Rules Fundamentals

Path-scoped rules let you apply different conventions to different file types or directories without creating CLAUDE.md files everywhere.

Located in: `.claude/rules/` directory

Each rule file has YAML frontmatter with `paths` field for conditional activation.

### Rule File Structure and Syntax

```
.claude/rules/
├── typescript.yaml      # Applies to **/*.ts and **/*.tsx
├── react-components.yaml # Applies to src/components/**/*.tsx
├── database.yaml        # Applies to db/migrations/*
└── tests.yaml          # Applies to **/*.test.ts
```

#### Rule File Format

**.claude/rules/typescript.yaml**
```yaml
---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Convention Rules

naming:
  interfaces: "I[PascalCase]"
  types: "[PascalCase]"
  enums: "[PascalCase]"
  generics: "[T,U,V...]"

strict-mode: true

imports:
  style: "absolute"
  base-path: "src/"
  prefer-named-exports: false
  barrel-imports: true

error-handling:
  never-use-any: true
  prefer-unknown-over-any: true
  type-check-async: true

type-safety:
  no-implicit-any: true
  strict-null-checks: true
  no-unused-variables: true
```

**.claude/rules/react-components.yaml**
```yaml
---
paths:
  - "src/components/**/*.tsx"
---

# React Component Rules

component-style: functional

hooks-conventions:
  custom-hook-prefix: "use"
  hook-dependency-arrays: required
  hook-rules-enforced: true

props-handling:
  define-interface: true
  interface-naming: "[ComponentName]Props"
  destructure-in-params: true
  forward-ref-when-needed: true

file-structure:
  required-files:
    - "[ComponentName].tsx"
    - "[ComponentName].test.tsx"
    - "[ComponentName].types.ts"
    - "index.ts"

exports:
  default-export: component
  named-exports: types and utilities

styling:
  approach: CSS Modules
  file-pattern: "[ComponentName].module.css"
  scoping: automatic via module

accessibility:
  wcag-level: AA
  requires:
    - role attributes
    - aria-label or aria-labelledby
    - keyboard navigation
    - focus management
    - semantic HTML

testing-requirements:
  coverage: 80%
  required-tests:
    - render test
    - prop variations
    - user interactions
    - accessibility
```

**.claude/rules/database.yaml**
```yaml
---
paths:
  - "db/migrations/**/*"
---

# Database Migration Rules

migration-format: "YYYYMMDDHHMMSS_[description].sql"

sql-conventions:
  case: UPPERCASE for keywords
  indentation: 2 spaces
  line-length: 120 characters
  naming:
    tables: snake_case
    columns: snake_case
    constraints: [table_name]_[type]_[column_name]
    indexes: idx_[table_name]_[columns]

migration-requirements:
  must-be-reversible: true
  up-section: required
  down-section: required
  transactions: wrapped in transaction
  no-ddl-in-transactions: false

testing:
  must-include-rollback-test: true
  verify-schema-integrity: true
```

**.claude/rules/tests.yaml**
```yaml
---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
---

# Test Suite Convention Rules

framework: Jest

structure:
  describe-blocks: one per logical feature
  test-naming: "should [behavior] when [condition]"
  setup: beforeEach for common setup
  cleanup: afterEach for cleanup

mocking:
  external-apis: always mock
  databases: use test database or mock
  filesystem: use memfs or mock
  import-style: jest.mock()

assertions:
  library: "@testing-library/react"
  avoid-implementation-details: true
  test-user-behavior: true

coverage:
  statements: 80%
  branches: 75%
  functions: 80%
  lines: 80%

organization:
  group-by-feature: true
  arrange-act-assert: true
  one-assertion-per-test: prefer but allow multiple related
```

### Glob Pattern Advantages

**Benefits over directory-level CLAUDE.md:**

1. **No redundant files:** One rule file covers all matching paths
2. **Explicit patterns:** Clear which files are affected
3. **Centralized management:** All rules in one directory
4. **Cross-directory:** Can apply to scattered files (e.g., all tests)
5. **Pattern flexibility:** Complex globs like `**/{hooks,utils}/**/*.ts`

**Example complex patterns:**
```yaml
paths:
  - "src/**/{hooks,utils}/**/*.ts"    # Hooks and utils directories
  - "**/__tests__/**/*.test.ts"       # Tests in any __tests__ folder
  - "src/!(node_modules)/**/*.tsx"    # Exclude node_modules
  - "db/migrations/2024/**/*.sql"     # Year-specific migrations
```

### Rule File Precedence and Conflict Resolution

Rules are applied in this order:
1. User-level: `~/.claude/rules/`
2. Project-level: `.claude/rules/`
3. Most specific path match wins (longer glob = higher precedence)

**Example conflict resolution:**
```
.claude/rules/
├── typescript.yaml          # paths: ["**/*.ts"]
└── strict-typescript.yaml   # paths: ["src/core/**/*.ts"]

For file: src/core/engine.ts
  → strict-typescript.yaml rules override typescript.yaml
```

### Choosing Path-Scoped Rules vs Subdirectory CLAUDE.md

| Aspect | Path-Scoped Rules | Subdirectory CLAUDE.md |
|--------|-------------------|----------------------|
| **Centralization** | Single directory | Scattered files |
| **File-type targeting** | Excellent (glob patterns) | Good (directory-based) |
| **Cross-directory patterns** | Excellent | Poor |
| **Readability** | Best for non-hierarchical | Best for hierarchical |
| **Maintenance** | Easier consolidation | Can be scattered |
| **Performance** | One lookup per directory | Multiple file checks |

**Decision rule:**
- Use `.claude/rules/` when rules are **type-based** (all .tsx, all migrations)
- Use subdirectory CLAUDE.md when rules are **hierarchy-based** (all in `/api/` subtree)
- Use both together: rules for file types, CLAUDE.md for hierarchical scopes

### Key Exam Tips for Task 3.3

- **Glob syntax:** Uses standard glob patterns with `*`, `**`, `{a,b}`, `!exclude`
- **Path field:** List multiple patterns as array items, one per path
- **Specificity wins:** More specific glob patterns override general ones
- **File creation:** No need to create directory structure; .claude/rules/ will be discovered automatically
- **Testing:** Create sample files matching patterns to verify rule application
- **Common mistake:** Forgetting that rules apply when editing matching files—test with actual file operations

---

## Task 3.4: Determine When to Use Plan Mode vs Direct Execution

### Plan Mode Fundamentals

**Plan mode** has Claude Code create a detailed plan before executing changes. It's designed for complex, high-risk, or exploratory scenarios.

**Direct execution** immediately performs the work with minimal planning overhead. It's ideal for well-understood, scoped tasks.

### Decision Framework

#### Use Plan Mode When:

1. **Large-scale changes affecting multiple files**
   - More than 5 files modified
   - Cross-cutting concerns (refactoring throughout codebase)
   - Example: Renaming a core type across 30 files

2. **Multiple valid approaches exist**
   - No single obvious solution
   - Trade-offs between approaches
   - Example: API versioning strategy (breaking vs non-breaking)

3. **High-risk modifications**
   - Architectural changes
   - Database schema updates
   - Security implementations
   - Example: Authentication system overhaul

4. **Exploratory or discovery-heavy work**
   - Understanding complex codebase
   - Identifying root causes
   - Planning performance optimizations
   - Example: Investigating memory leak across modules

5. **When requirements are ambiguous**
   - Need to clarify scope
   - Multiple interpretation possible
   - Requires stakeholder validation
   - Example: Feature implementation with unclear specification

#### Use Direct Execution When:

1. **Well-scoped, single-task modifications**
   - Clear input and output
   - Single file or tightly coupled changes
   - Example: Fix a specific bug in one component

2. **Straightforward implementations**
   - Standard pattern applied
   - No architectural decisions needed
   - Example: Add error handling to existing function

3. **Routine changes**
   - Adding a test case
   - Fixing lint violations
   - Updating documentation
   - Example: Expand existing test suite

4. **Performance-critical workflows**
   - Minimal planning overhead needed
   - Time-sensitive task
   - Example: Hotfix for production issue

### Plan Mode Workflow

**Example: Large refactoring task**

**User prompt:**
```
Using plan mode, refactor our authentication system:
- Currently uses custom JWT implementation
- Need to migrate to Passport.js
- Support both local and OAuth2 strategies
- Maintain backward compatibility with existing tokens during transition
- Affects 15+ files
```

**Expected plan mode output:**
```
PLAN: Authentication System Refactoring

Phase 1: Setup & Dependencies
- Install passport, passport-local, passport-oauth2
- Create src/auth/strategies/ directory structure
- Add environment variables for OAuth2

Phase 2: Core Implementation
- Create Passport strategies
- Implement LocalStrategy (username/password)
- Implement OAuth2Strategy (Google, GitHub)
- Set up session management

Phase 3: Integration
- Update login/logout endpoints
- Migrate token validation
- Support dual-mode (legacy + new) during transition

Phase 4: Testing & Validation
- Unit tests for each strategy
- Integration tests for flows
- Backward compatibility tests

Files to modify: [list of 15+ files with descriptions]
Estimated complexity: High
Estimated time: 2-3 hours
Risks: Auth disruption if not carefully sequenced
```

**After user approval, Claude Code executes the plan.**

### Plan Mode with Explore Subagent

For discovery-heavy planning, use the **Explore subagent** to isolate verbose intermediate output.

```
/explore

Investigate our codebase structure:
1. Find all API endpoint definitions
2. Identify authentication checks
3. Map out permission levels
4. Create a dependency graph of auth-related modules

Format findings as a structured report.
```

The Explore subagent runs separately and produces focused output without cluttering the main session.

### Combining Plan Mode with Direct Execution

**Recommended workflow for complex tasks:**

```
Step 1: Plan mode to map out approach
  → User reviews and approves plan

Step 2: Direct execution in phases
  → Phase 1: Foundation changes
  → Phase 2: Core implementation
  → Phase 3: Integration
  → Phase 4: Testing

Step 3: Plan mode for optimization
  → Review implementation
  → Identify improvements
  → Plan performance enhancements
```

### Practical Scenarios

**Scenario 1: Simple bug fix**
```
User: "Fix the null pointer exception in UserService.getProfile()"

Claude Code action: Direct execution
- Find the bug
- Implement fix with null check
- Suggest test case
- Done in <5 minutes
```

**Scenario 2: Feature implementation with ambiguity**
```
User: "Add user preferences feature to save UI settings"

Claude Code action: Plan mode
- Clarify: Where to store (database/localStorage)?
- Clarify: Which settings to support?
- Clarify: Sync across devices or device-local?
- Create implementation plan
- Wait for user approval
- Execute plan
```

**Scenario 3: Large-scale refactoring**
```
User: "Refactor components to use the new design system"

Claude Code action: Plan mode (with Explore if needed)
- Explore: Analyze all components
- Explore: Identify design system patterns
- Plan: Map components to patterns
- Plan: Create phased rollout
- Execute phases one at a time
```

### Key Exam Tips for Task 3.4

- **Plan mode triggers:** Multiple files, architectural changes, high risk, exploration needed, or ambiguous requirements
- **Direct execution triggers:** Single task, well-understood approach, routine changes, quick fixes
- **Explore subagent:** Use `/explore` for discovery without cluttering main session
- **User agency:** Plans require explicit approval before execution
- **Phased execution:** Large plans should execute in phases with validation between each
- **Common mistake:** Using plan mode for simple tasks wastes time; direct execution better for straightforward work

---

## Task 3.5: Apply Iterative Refinement Techniques for Progressive Improvement

### Concrete Examples: The Most Effective Communication Method

The most important principle: **Provide 2-3 concrete input/output examples** instead of abstract descriptions.

#### Why Concrete Examples Work Better

| Approach | Clarity | Adoption | Edge Cases |
|----------|---------|----------|-----------|
| Abstract description | 40% | Low | Missed |
| Concrete examples | 95% | High | Visible |
| Both combined | 99% | Very high | Addressed |

#### Example: Teaching a Code Style Preference

**Bad (abstract):**
```
"Make function names more descriptive and use camelCase for variables."
```

**Better (with examples):**
```
Transform these patterns:

Input:
  function calc(x, y) { return x + y; }
  const my_result = calc(5, 3);

Output:
  function calculateSum(x: number, y: number): number {
    return x + y;
  }
  const calculatedSum = calculateSum(5, 3);

Patterns to apply:
  - Function names: verb + noun (calc → calculateSum)
  - Variable names: camelCase (my_result → calculatedSum)
  - Type annotations: add return type
```

### Test-Driven Iteration Pattern

**Write tests first, then iterate by sharing failures.**

This creates a feedback loop where Claude Code knows exactly what's expected.

#### Test-First Workflow

```
Step 1: Define test suite
  └─ Write comprehensive tests that specify expected behavior

Step 2: Share failing tests
  └─ Show which tests are failing and expected vs actual

Step 3: Claude Code implements
  └─ Fixes implementation to pass tests

Step 4: Iterate on issues
  └─ Share new test failures
  └─ Claude Code refines implementation

Step 5: Validate complete
  └─ All tests pass
  └─ Implementation meets requirements
```

#### Example: Building a Shopping Cart Component

**Step 1: Write tests (test-first)**

```typescript
// CartItem.test.ts
describe('CartItem', () => {
  test('renders product name and price', () => {
    const item = { id: 1, name: 'Widget', price: 29.99, quantity: 1 };
    render(<CartItem item={item} />);
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  test('increases quantity when "+" button clicked', async () => {
    const item = { id: 1, name: 'Widget', price: 29.99, quantity: 1 };
    const onQuantityChange = jest.fn();
    render(<CartItem item={item} onQuantityChange={onQuantityChange} />);

    await userEvent.click(screen.getByRole('button', { name: '+' }));
    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  test('decreases quantity when "-" button clicked', async () => {
    const item = { id: 1, name: 'Widget', price: 29.99, quantity: 2 };
    const onQuantityChange = jest.fn();
    render(<CartItem item={item} onQuantityChange={onQuantityChange} />);

    await userEvent.click(screen.getByRole('button', { name: '-' }));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  test('does not decrease below quantity 1', async () => {
    const item = { id: 1, name: 'Widget', price: 29.99, quantity: 1 };
    const onQuantityChange = jest.fn();
    render(<CartItem item={item} onQuantityChange={onQuantityChange} />);

    await userEvent.click(screen.getByRole('button', { name: '-' }));
    expect(onQuantityChange).not.toHaveBeenCalled();
  });

  test('displays total price (quantity × price)', () => {
    const item = { id: 1, name: 'Widget', price: 29.99, quantity: 3 };
    render(<CartItem item={item} />);
    expect(screen.getByText('Total: $89.97')).toBeInTheDocument();
  });

  test('removes item when delete button clicked', async () => {
    const item = { id: 1, name: 'Widget', price: 29.99, quantity: 1 };
    const onRemove = jest.fn();
    render(<CartItem item={item} onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
```

**Step 2: Share test failures with Claude Code**

```
"Implement CartItem component to pass these tests.

Current test results:
- FAIL: renders product name and price
  └ Cannot find element
- FAIL: increases quantity when "+" button clicked
  └ Button not found
- [... all tests failing ...]

Write the component implementation."
```

**Step 3: Claude Code implements**

```typescript
interface CartItemProps {
  item: { id: number; name: string; price: number; quantity: number };
  onQuantityChange?: (quantity: number) => void;
  onRemove?: (id: number) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const handleIncrease = () => {
    onQuantityChange?.(item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange?.(item.quantity - 1);
    }
  };

  const total = (item.price * item.quantity).toFixed(2);

  return (
    <div>
      <h3>{item.name}</h3>
      <p>${item.price.toFixed(2)}</p>
      <div>
        <button onClick={handleDecrease}>-</button>
        <span>{item.quantity}</span>
        <button onClick={handleIncrease}>+</button>
      </div>
      <p>Total: ${total}</p>
      <button onClick={() => onRemove?.(item.id)}>Delete</button>
    </div>
  );
}
```

**Step 4: Share remaining failures and iterate**

```
"Running tests again. Still have 2 failures:

- FAIL: displays total price (quantity × price)
  Expected: 'Total: $89.97'
  Got: 'Total: 89.97'

- FAIL: removes item when delete button clicked
  The Delete button has no accessible name

Fix these issues."
```

This approach gives Claude Code:
- Crystal clear expectations (from tests)
- Specific feedback (exact failures)
- Direction for improvement (what to fix)

### The Interview Pattern: Asking Clarifying Questions

Claude Code should ask questions to surface considerations **before** full implementation.

#### When to Use the Interview Pattern

Use when:
- Requirements are incomplete
- Multiple approaches exist
- Edge cases aren't obvious
- Design implications need discussion

#### Example: Interview Pattern for API Design

**User:** "Build an API for managing tasks"

**Claude Code response (interview mode):**
```
Before I implement, I need to clarify a few design decisions:

1. **Authentication:**
   - Should this use JWT tokens, session cookies, or OAuth?
   - Who authenticates tasks—the creator or the viewer?

2. **Permissions:**
   - Can users view others' tasks?
   - Can tasks be shared/collaborative?
   - What roles exist (owner, editor, viewer)?

3. **Data Model:**
   - Can tasks have subtasks?
   - What fields beyond title/description (priority, due date, tags)?
   - Should task history be tracked?

4. **Constraints:**
   - Any limits on task size or count per user?
   - Should deleted tasks be soft or hard deleted?
   - How long should data be retained?

5. **Edge Cases:**
   - What happens when a user is deleted?
   - Should completed tasks auto-archive?
   - Concurrent edit conflicts?

Once you clarify these, I'll design the API to match your needs.
```

This surfaces decisions that affect implementation.

### Progressive Refinement: All Issues vs Sequential Issues

**When to provide all issues at once:**
- 3 or fewer issues
- Issues are independent
- Issues follow single theme
- Quick fixes

**When to provide sequentially:**
- More than 5 issues
- Issues are interconnected (fixing one causes new failures)
- Issues involve different subsystems
- Complex refactoring

#### Example: Sequential Issue Reporting

**Round 1: Architectural issues**
```
I identified these fundamental issues:

1. Circular dependencies between auth-service and user-service
   → Fix by introducing auth-interface abstraction

2. Performance: Database query in component render
   → Move to useEffect with caching

Fix these first. Then we'll address style/documentation issues.
```

**After fixes applied...**

**Round 2: Type safety issues**
```
Good progress! Now I see these type safety gaps:

1. Missing return type annotations on async functions
2. Using 'any' in middleware responses

These became visible after the structural fixes.
```

This prevents overwhelming Claude Code with issues; it's more effective to sequence them.

### Addressing Interacting vs Independent Issues

**Independent issues** can be addressed in parallel:
```
ISSUES (independent):
1. Button missing aria-label → Add label
2. Function needs JSDoc comment → Add documentation
3. Variable name is unclear → Rename

Fix all three in one pass.
```

**Interacting issues** need sequential resolution:
```
ISSUES (interacting):

Issue 1: Component deeply nested (prop drilling)
  → Must refactor context structure first

Issue 2: Context not passing correct type
  → Becomes visible only after Issue 1 is fixed

Issue 3: Child components have mismatched prop types
  → Resolved automatically when Issue 1+2 complete

Fix in order: 1 → 2 → 3
```

### Key Exam Tips for Task 3.5

- **Golden rule:** 2-3 concrete examples > 10 sentences of description
- **Test-driven:** Write failing tests; let Claude Code implement to pass them
- **Interview pattern:** Ask clarifying questions when requirements are ambiguous
- **Sequential feedback:** For complex work, provide failures in manageable batches
- **Interacting issues:** Identify issue dependencies; order fixes accordingly
- **Common mistake:** Being too abstract ("make it better") instead of concrete ("here's what I need")

---

## Task 3.6: Integrate Claude Code into CI/CD Pipelines

### CI/CD Integration Fundamentals

Claude Code can be invoked non-interactively in CI/CD pipelines using the `-p` (or `--print`) flag, with structured output for programmatic processing.

#### Key Flags for CI Integration

| Flag | Purpose | Example |
|------|---------|---------|
| `-p`, `--print` | Non-interactive mode; output to stdout | `claude-code -p "task description"` |
| `--output-format json` | Structured JSON output | `claude-code -p --output-format json "task"` |
| `--json-schema` | JSON Schema for output validation | `claude-code -p --output-format json --json-schema schema.json` |

### Non-Interactive Mode: The `-p` Flag

**Syntax:**
```bash
claude-code -p "task description" [options]
```

**What happens:**
1. Claude Code processes the task
2. Output is printed to stdout (no interactive prompts)
3. Process exits with appropriate status code
4. Output can be piped to files or parsed by other tools

#### Example: Running Claude Code in GitHub Actions

**.github/workflows/code-review.yml**
```yaml
name: Automated Code Review

on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run code review
        run: |
          claude-code -p "
          Review the changed files in this PR for:
          - Security issues
          - TypeScript strict mode violations
          - Missing test coverage

          Output format: markdown with severity levels"
          > review-output.md

      - name: Comment review on PR
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review-output.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: review
            });
```

### Structured Output: `--output-format json`

For parsing and further processing, use JSON output format.

#### Example: Test Generation Pipeline

**Command:**
```bash
claude-code -p \
  --output-format json \
  "Generate test cases for UserService.login() method" \
  > tests.json
```

**Output:**
```json
{
  "status": "success",
  "task": "Generate test cases",
  "output": {
    "test_cases": [
      {
        "name": "should authenticate valid user",
        "given": "valid username and password",
        "when": "login is called",
        "then": "returns JWT token",
        "code": "it('should authenticate valid user', async () => { ... })"
      },
      {
        "name": "should reject invalid password",
        "given": "valid username, wrong password",
        "when": "login is called",
        "then": "throws AuthenticationError",
        "code": "it('should reject invalid password', async () => { ... })"
      }
    ],
    "coverage_estimate": "85%",
    "generated_at": "2026-03-19T10:15:30Z"
  }
}
```

### JSON Schema Validation: `--json-schema`

Enforce structure of output using JSON Schema.

**schema.json:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "test_cases": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "given": { "type": "string" },
          "when": { "type": "string" },
          "then": { "type": "string" },
          "code": { "type": "string" }
        },
        "required": ["name", "code"]
      }
    },
    "coverage_estimate": { "type": "string" }
  },
  "required": ["test_cases"]
}
```

**Command:**
```bash
claude-code -p \
  --output-format json \
  --json-schema schema.json \
  "Generate test cases for UserService.login()" \
  > tests.json
```

If output doesn't match schema, process fails and validation errors are reported.

### CLAUDE.md as Context Mechanism

The key to effective CI-invoked Claude Code is **providing project context via CLAUDE.md**.

When Claude Code runs in CI, it doesn't have the interactive session context. CLAUDE.md fills that gap.

#### Example: Comprehensive CLAUDE.md for CI

**.claude/CLAUDE.md (for CI context):**
```yaml
project: "E-commerce API Service"
environment: "Node.js 18 + Express + PostgreSQL"

ci-context:
  description: "This CLAUDE.md is read during CI runs to provide project context"
  location: "Repository root"
  audience: "Both developers and CI automation"

testing-standards:
  framework: Jest
  coverage-requirements:
    unit: 80%
    integration: 60%
    critical-paths: 100%
  timeout: 10000ms
  setup-file: "jest.setup.ts"

code-review-criteria:
  security:
    - No hardcoded secrets
    - Validate all user inputs
    - Parameterize SQL queries (no string concatenation)
    - Use JWT with appropriate expiration

  performance:
    - Database queries < 100ms (p95)
    - API responses < 500ms (p95)
    - No N+1 queries
    - Proper indexing on frequently filtered columns

  maintainability:
    - TypeScript strict mode
    - Functions < 50 lines
    - Cyclomatic complexity < 10
    - Max nesting depth: 3
    - Clear error messages

database:
  type: PostgreSQL
  migrations: db/migrations/
  naming: snake_case
  critical:
    - Tables must have created_at and updated_at
    - Foreign keys must cascade delete appropriately
    - Indexes on foreign keys and frequently queried columns

api:
  auth: JWT with RS256
  validation: joi schemas
  error-responses:
    - Format: { error: string, code: string, details?: object }
    - Always include HTTP status code
    - Never expose stack traces in production

must-check-before-merge:
  - All tests passing
  - Coverage meets minimums
  - TypeScript compilation with no errors
  - No console.log in production code
  - Environment variables documented in .env.example

files-to-include-in-reviews:
  - "src/**/*.ts" (production code)
  - "tests/**/*.test.ts" (test code)
  exclude: "node_modules, dist, .next"
```

When Claude Code runs in CI with this CLAUDE.md present, it understands:
- Testing standards and coverage requirements
- Code review criteria
- Database conventions
- API design standards
- What to check before merge

### Session Context Isolation: CI vs Interactive

**Important insight:** The same Claude Code session that generated code is less effective at reviewing it.

**Why:** The AI has "committed" to its implementation choices. It's harder to objectively critique something you just wrote.

**Solution in CI:** Use separate workflows for generation and review

#### Example: Separate Generation and Review Workflows

**.github/workflows/generate-missing-tests.yml**
```yaml
name: Generate Missing Tests

on: [pull_request]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate tests for uncovered code
        run: |
          claude-code -p \
            "Analyze coverage gaps and generate tests to reach 80% coverage" \
            > generated-tests.json

      - name: Write generated tests to file
        run: |
          # Parse JSON and write test files
          node scripts/write-tests.js generated-tests.json

      - name: Commit tests
        run: |
          git add tests/
          git commit -m "test: auto-generate tests for coverage gaps"
          git push
```

**.github/workflows/review-generated-code.yml**
```yaml
name: Review Generated Code

on: [push]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Review generated code for quality
        run: |
          claude-code -p \
            "Review the generated test files (tests/generated/) for:
            - Test quality and robustness
            - Edge case coverage
            - Mock appropriateness
            - Style consistency with existing tests

            Output any concerns as markdown" \
            > review-notes.md

      - name: Report findings
        if: failure()
        run: |
          echo "Review found issues. Check review-notes.md"
          cat review-notes.md
          exit 1
```

**Key difference:** Generate and Review happen in separate sessions, ensuring objective review.

### Providing Existing Test Files for Context

When running in CI, include existing test files in context to maintain consistency.

```bash
claude-code -p \
  "Generate tests for the new payment-processing module.

  Reference existing tests in tests/modules/ for style consistency.

  Use the same mocking patterns, assertions, and file structure." \
  --include-files "tests/modules/**/*.test.ts" \
  > payment-tests.json
```

### Documenting Testing Standards in CLAUDE.md

Include comprehensive testing documentation so CI-invoked Claude Code knows your standards.

```yaml
# .claude/CLAUDE.md testing section

testing-standards:
  style-guide: |
    Test naming: "should [behavior] when [condition]"
    Example: "should throw ValidationError when email is invalid"

  structure:
    - Use describe blocks for features
    - Setup/teardown in beforeEach/afterEach
    - Arrange-Act-Assert pattern
    - One logical assertion per test (group related asserts)

  examples:
    unit-test: |
      it('should validate email format', () => {
        // Arrange
        const validator = new EmailValidator();

        // Act
        const result = validator.isValid('user@example.com');

        // Assert
        expect(result).toBe(true);
      });

    async-test: |
      it('should fetch user data when called', async () => {
        // Arrange
        const mockFetch = jest.fn().mockResolvedValue({ id: 1 });
        const service = new UserService(mockFetch);

        // Act
        const user = await service.getUser(1);

        // Assert
        expect(user.id).toBe(1);
        expect(mockFetch).toHaveBeenCalledWith(1);
      });
```

### Complete CI Integration Example

**.github/workflows/quality-gate.yml**
```yaml
name: Quality Gate

on: [pull_request, push]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Run existing tests
        run: npm test -- --coverage

      - name: Analyze code quality with Claude
        run: |
          claude-code -p \
            --output-format json \
            --json-schema .claude/quality-schema.json \
            "Analyze src/ for:
            1. Security vulnerabilities
            2. TypeScript strict mode violations
            3. Performance issues
            4. Code duplication

            Provide JSON output with findings" \
            > quality-report.json

      - name: Validate quality report schema
        run: |
          node -e "
          const report = require('./quality-report.json');
          if (report.issues.critical.length > 0) {
            console.error('FAIL: Critical issues found');
            console.error(JSON.stringify(report.issues.critical, null, 2));
            process.exit(1);
          }
          console.log('PASS: Quality gates met');
          "

      - name: Comment results on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('quality-report.json', 'utf8'));
            const summary = `
            ## Quality Analysis Results

            - Critical Issues: ${report.issues.critical.length}
            - Warnings: ${report.issues.warnings.length}
            - Suggestions: ${report.issues.suggestions.length}

            ${report.issues.critical.length > 0 ? '❌ Please address critical issues' : '✅ All critical checks passed'}
            `;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: summary
            });
```

### Key Exam Tips for Task 3.6

- **Non-interactive must:** Always use `-p` flag in CI pipelines
- **Output format:** Use `--output-format json` for parsing; use default text for human reading
- **Schema validation:** Enforce output structure with `--json-schema` for critical workflows
- **Context is everything:** Rich CLAUDE.md is essential when Claude Code runs without interactive context
- **Separate sessions:** Generation and review should happen in different workflow jobs
- **Testing documentation:** Include specific test examples in CLAUDE.md so CI-invoked Claude Code matches your style
- **Common mistake:** Forgetting that CI sessions can't ask for clarification; context must be complete upfront

---

## Study Checklist

### Task 3.1: CLAUDE.md Configuration
- [ ] Understand three levels of CLAUDE.md hierarchy (user, project, directory)
- [ ] Know why user-level CLAUDE.md isn't version-controlled
- [ ] Practice creating modular CLAUDE.md with @import syntax
- [ ] Create sample .claude/rules/ structure with multiple files
- [ ] Test diagnostics: identify which CLAUDE.md applies at different file locations
- [ ] Hands-on: Set up a project with all three CLAUDE.md levels and verify precedence

### Task 3.2: Custom Commands and Skills
- [ ] Distinguish between slash commands and skills
- [ ] Know difference between project-scoped (.claude/commands/) and user-scoped (~/.claude/commands/)
- [ ] Understand SKILL.md frontmatter: context, allowed-tools, argument-hint
- [ ] Practice creating context: fork skills for isolation
- [ ] Build decision matrix: when to use skill vs CLAUDE.md vs command
- [ ] Hands-on: Create a project-scoped skill with restricted allowed-tools

### Task 3.3: Path-Specific Rules
- [ ] Understand glob patterns in rules paths field
- [ ] Know why path-scoped rules are better than subdirectory CLAUDE.md for file types
- [ ] Create .claude/rules/ files for multiple file types
- [ ] Test glob pattern matching with actual files
- [ ] Understand rule precedence and conflict resolution
- [ ] Hands-on: Create rules for .ts, .tsx, .test.ts files with specific patterns

### Task 3.4: Plan Mode vs Direct Execution
- [ ] Know triggers for plan mode (large scale, multiple approaches, high risk, ambiguity)
- [ ] Know triggers for direct execution (scoped, straightforward, routine)
- [ ] Understand Explore subagent for isolating discovery
- [ ] Practice combining plan mode with phased direct execution
- [ ] Create scenarios distinguishing these modes
- [ ] Hands-on: Run same task in both plan and direct modes; compare results

### Task 3.5: Iterative Refinement
- [ ] Master concrete examples over abstract descriptions
- [ ] Write test-first approach; iterate on failures
- [ ] Use interview pattern for ambiguous requirements
- [ ] Know when to batch issues vs provide sequentially
- [ ] Identify interacting vs independent issues
- [ ] Hands-on: Use test-driven approach for feature implementation

### Task 3.6: CI/CD Integration
- [ ] Know -p flag for non-interactive mode
- [ ] Understand --output-format json and --json-schema usage
- [ ] Recognize CLAUDE.md as CI context mechanism
- [ ] Know session context isolation issue (generation vs review)
- [ ] Create CI workflow using Claude Code with structured output
- [ ] Include testing standards in CLAUDE.md for CI consistency
- [ ] Hands-on: Write GitHub Actions workflow invoking Claude Code with JSON schema

---

## Key Exam Tips

### Strategic Insights
1. **Hierarchy before rules:** Establish CLAUDE.md hierarchy first; rules for cross-cutting concerns
2. **Skills for reuse:** Create skills for workflows you'll run repeatedly; commands for one-time interactions
3. **Path patterns > directories:** Use glob patterns in rules instead of scattered CLAUDE.md files
4. **Plan before big changes:** Always use plan mode for multi-file refactoring or architectural changes
5. **Concrete > abstract:** Show examples; tests are your best communication tool
6. **CI needs context:** CLAUDE.md is essential for CI-invoked Claude Code; no interactive session exists

### Common Pitfalls to Avoid
- Forgetting user-level CLAUDE.md should never be committed
- Creating skills for one-off tasks instead of reusable workflows
- Mixing path-scoped rules and subdirectory CLAUDE.md unnecessarily
- Using plan mode for simple, well-understood tasks
- Writing abstract descriptions instead of concrete examples with tests
- Forgetting to include CLAUDE.md when running Claude Code in CI
- Same session generating and reviewing code (needs separate sessions)

### Exam Question Patterns to Expect
- "Which CLAUDE.md applies when editing src/components/Button/Button.tsx?"
- "Should this be a skill or a CLAUDE.md entry?"
- "How would you use path-scoped rules to apply TypeScript conventions?"
- "When is plan mode preferable to direct execution?"
- "Write a failing test to communicate this requirement to Claude Code"
- "Configure this CI workflow to use Claude Code with JSON output"
- "Identify and fix the CLAUDE.md hierarchy issue in this scenario"

### Time Management on Exam
- **Task 3.1:** 12-15 minutes (configuration understanding)
- **Task 3.2:** 10-12 minutes (command/skill decisions)
- **Task 3.3:** 10-12 minutes (path rules application)
- **Task 3.4:** 8-10 minutes (mode selection)
- **Task 3.5:** 10-12 minutes (refinement techniques)
- **Task 3.6:** 12-15 minutes (CI integration)

Total recommended: ~60-75 minutes for full module coverage

---

## Quick Reference: Configuration Files

### CLAUDE.md Template
```yaml
project: "[Project Name]"
description: "[What this project does]"

conventions:
  naming: [conventions]
  structure: [directory structure]

standards:
  language: [language + version]
  testing: [testing framework]
  linting: [linting tools]

important-constraints:
  - [Constraint 1]
  - [Constraint 2]
```

### SKILL.md Template
```markdown
---
context: fork|default
allowed-tools:
  - read
  - write
argument-hint: "<input description>"
---

# Skill Name

[Description of what the skill does]

[Implementation instructions]
```

### Rule File Template
```yaml
---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Convention Name

[Convention definitions]
```

### CI Command Template
```bash
claude-code -p \
  --output-format json \
  --json-schema schema.json \
  "Task description with context from CLAUDE.md" \
  > output.json
```

---

## Additional Resources

### Related Exam Modules
- **Module 1:** Core Claude Code fundamentals
- **Module 2:** Advanced prompting and context management
- **Module 4:** Production deployment patterns
- **Module 5:** Team collaboration and governance

### Practice Scenarios
1. Design CLAUDE.md hierarchy for a large monorepo
2. Create custom skill for your team's recurring task
3. Migrate project to path-scoped rules
4. Refactor codebase using plan mode
5. Write test-driven feature specification
6. Integrate Claude Code into existing CI/CD pipeline

### Further Learning
- Claude Code documentation: configuration section
- Best practices guide: hierarchy and scoping
- CI/CD integration patterns
- Skill library: examples and templates
