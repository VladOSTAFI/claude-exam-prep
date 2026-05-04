# Implementation Plan: Claude Certified Architect Exam Prep — Next.js App

## Overview

A statically-rendered Next.js 14 study site for the Claude Certified Architect — Foundations (CCA-F) exam. The home page (`/`) presents the contents of `modules/00-exam-overview.md` plus a card grid linking to the seven study modules. Each module is rendered server-side from its co-located markdown file at `/modules/[slug]`, with a per-module quiz (5–10 multiple-choice questions) embedded at the bottom of the same page. There is no backend: markdown is read from disk via `fs` in React Server Components at build time, and quiz banks ship as typed TypeScript modules under `src/content/quizzes/`.

Routing is intentionally flat: one home route, one dynamic module route, no API routes. Quiz state is local to the `Quiz` client component (a `useReducer`-driven idle → answering → submitted state machine). The 720/1000 exam pass threshold maps to a 72% per-quiz pass mark, surfaced as a pass/fail badge after submission. Dark mode follows the OS preference; there is no toggle in v1.

## Frontend

### Scaffolding

Run from the project root (which currently contains only `modules/`, `.git/`, and the not-yet-written `implementation-plan.md`):

```
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

`create-next-app` may refuse a non-empty cwd. If it does, the recipe is: temporarily move `modules/` and `implementation-plan.md` to a sibling temp dir, run the scaffold, then move them back. The `.git/` directory is left in place; `--no-git` prevents create-next-app from re-initializing. **Do not delete `.git/` or `modules/` under any circumstance.**

### Post-scaffold dependencies

| Package | Why |
|---|---|
| `react-markdown` | Standard, well-maintained markdown → React renderer; pairs cleanly with RSC. |
| `remark-gfm` | GitHub-flavored markdown: tables, task lists, strikethrough — all used in the source files. |
| `rehype-slug` | Adds `id` attributes to headings (needed for TOC anchors). |
| `rehype-autolink-headings` | Adds clickable anchor links next to headings. |
| `rehype-pretty-code` (with `shiki`) | Build-time syntax highlighting via Shiki; produces static HTML so no client-side highlighter ships. Chosen over `rehype-highlight` because Shiki gives VS Code-quality theming and supports dual light/dark themes natively. |
| `@tailwindcss/typography` | `prose` class set for long-form markdown styling. |
| `gray-matter` | Frontmatter parser; included in case any module file gains frontmatter (currently none do, but this is defensive — cheap dep). |

No mermaid plugin. The audited modules contain ASCII diagrams inside fenced code blocks, not ` ```mermaid ` blocks. Render them as plain code blocks.

### Routing

| Route | Source | Notes |
|---|---|---|
| `/` | `modules/00-exam-overview.md` + module index | Single Server Component page. Renders the overview markdown above a grid of `ModuleCard`s linking to each `/modules/[slug]`. |
| `/modules/[slug]` | `modules/0X-*.md` | Server Component. Renders the markdown body, a sticky in-page TOC, prev/next nav, and the `Quiz` client component at the bottom. |

**Quiz placement decision:** quizzes are **embedded at the bottom of each module page**, not on a separate `/modules/[slug]/quiz` route. Justification: (a) the user reads the module then immediately self-tests — a single page reduces friction and reflects the "study + check" loop; (b) avoids a second route, second `generateStaticParams`, and route-level state handoff; (c) the `Quiz` client island is naturally isolated from the server-rendered prose above it.

### Module loading strategy

All markdown is read at build time inside RSC via `fs.readFileSync` — never at request time, never on the client. The slug map is the single source of truth and lives in `src/lib/modules.ts`:

| Source file | Slug | In `generateStaticParams`? |
|---|---|---|
| `modules/00-exam-overview.md` | (reserved — landing) | **No** |
| `modules/01-agentic-architecture.md` | `agentic-architecture` | Yes |
| `modules/02-claude-code-configuration.md` | `claude-code-configuration` | Yes |
| `modules/03-prompt-engineering.md` | `prompt-engineering` | Yes |
| `modules/04-tool-design-mcp.md` | `tool-design-mcp` | Yes |
| `modules/05-context-management.md` | `context-management` | Yes |
| `modules/06-rag-with-claude.md` | `rag-with-claude` | Yes |
| `modules/07-cross-module-reference.md` | `cross-module-reference` | Yes |

`00-exam-overview.md` is **explicitly excluded** from `generateStaticParams` so visiting `/modules/exam-overview` 404s — the overview is reachable only via `/`.

### Markdown pipeline

- Library: `react-markdown` configured with `remarkPlugins: [remarkGfm]` and `rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }], [rehypePrettyCode, { theme: { light: 'github-light', dark: 'github-dark' } }]]`.
- Syntax highlighting: **build-time only** via `rehype-pretty-code` + Shiki. No client-side highlighter; the rendered HTML ships with classes Shiki emits. Dual theme support pairs with the dark-mode policy below.
- TOC generation: a small server-side helper in `src/lib/markdown.ts` walks the AST (or runs a regex pass over the raw markdown for headings of depth 2 and 3) and emits a `{ depth, text, slug }[]` array. The slug values must match what `rehype-slug` produces (use the same `github-slugger` library it uses internally to guarantee parity). The `Toc` server component renders this list as a sticky sidebar on `lg+` viewports, collapsing into a `<details>` block on smaller screens.
- Anchored headings: produced automatically by `rehype-slug` + `rehype-autolink-headings`.
- Mermaid: not used. Source files only contain ASCII diagrams in plain fenced blocks; treat them as code.
- Tables, blockquotes, fenced code (TypeScript / JSON / bash), task lists, and triple-pipe header rows are all present in the source — `remark-gfm` covers them.

### Component hierarchy

All components live under `src/components/`. **Default to Server Components**; only the quiz is a client island.

| Component | Type | Props | Justification |
|---|---|---|---|
| `SiteHeader` | Server | `{}` | Static nav (logo, link to `/`). No state. |
| `SiteFooter` | Server | `{}` | Static footer. |
| `ModuleCard` | Server | `{ slug: string; title: string; domain: string; weight: string; estMinutes?: number }` | Pure presentation; rendered server-side inside the home page grid. |
| `ModuleNav` | Server | `{ prev?: { slug; title }; next?: { slug; title } }` | Renders prev/next links at the bottom of each module page. |
| `Toc` | Server | `{ items: { depth: 2 \| 3; text: string; slug: string }[] }` | Static list derived at build time. |
| `ModuleContent` | Server | `{ markdown: string }` | Wraps `react-markdown` with the configured plugin pipeline. Server-only — no interactivity. |
| `Quiz` | **Client** (`"use client"`) | `{ quiz: Quiz }` | Owns quiz state machine. Must be client because of `useReducer` + form interaction. |
| `QuizQuestion` | Client (rendered inside `Quiz`) | `{ question: QuizQuestion; selectedChoiceId: string \| null; revealed: boolean; onSelect: (id: string) => void }` | Pure controlled component; lives inside the client boundary. |
| `QuizResult` | Client (rendered inside `Quiz`) | `{ score: number; total: number; passed: boolean; onRetry: () => void }` | Final score panel + retry button. |

The `Quiz` client boundary is the single `"use client"` directive in the app.

### Styling

- Tailwind utilities throughout. `@tailwindcss/typography` plugin enabled in `tailwind.config.ts` and applied to the markdown body via `<article className="prose prose-slate dark:prose-invert max-w-none">`.
- Tables: extend `typography` config to add `prose-table:text-sm prose-th:bg-slate-100 dark:prose-th:bg-slate-800` so the many tables in the source render as a clear study aid rather than default thin lines.
- Code blocks: Shiki's emitted classes do the heavy lifting; add `prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700` for the container chrome.
- Layout: max width `max-w-4xl` for prose, `max-w-7xl` for the home grid; one `lg:grid-cols-[16rem_1fr]` split on module pages for the sticky TOC.
- Dark mode: `darkMode: 'media'` in `tailwind.config.ts` — follows OS preference, **no toggle in v1**. Justification: zero JS, no flash-on-load (no client-side reconciliation needed), no localStorage, no theme provider. A toggle can be added later without invalidating any decisions made here.

### State management

- No global store. No Redux, Zustand, or Context for app-level state.
- Quiz state is **local to the `Quiz` component** via `useReducer`. The reducer implements the state machine in the Quiz System section below.
- Optional, isolated: persist the most recent score per quiz to `localStorage` under the key `cca-prep:last-score:<slug>` so users see their previous attempt on return. This is opt-in inside the `Quiz` component only — no other component reads from `localStorage`.
- No URL-driven quiz state. Submitting does not change the route.

### Accessibility

- Each `QuizQuestion` is a `<fieldset>` with a `<legend>` for the prompt. Choices are real `<input type="radio">` elements grouped by `name={question.id}`.
- Submit is a real `<button type="submit">` inside a `<form>` so Enter submits.
- On submit, focus moves to the `QuizResult` heading via `useRef` + `focusRef.current?.focus()` inside an effect keyed on the `submitted` state. The result heading carries `tabIndex={-1}` and an `aria-live="polite"` region announces the score.
- Right/wrong indicators use both color and an icon + text label ("Correct" / "Incorrect") so they are not color-only.
- All interactive controls are keyboard-reachable in DOM order; no custom focus traps.
- Page landmarks: `<header>`, `<main>`, `<nav aria-label="On this page">` (TOC), `<nav aria-label="Module navigation">` (prev/next), `<footer>`.
- Run `eslint-plugin-jsx-a11y` (ships in the Next.js ESLint config) on every commit.

## Quiz System

### TypeScript types

Defined in `src/types/quiz.ts`:

```ts
export interface QuizChoice {
  id: string;            // stable, e.g. "a" | "b" | "c" | "d"
  text: string;
}

export interface QuizQuestion {
  id: string;            // unique within the quiz, e.g. "q1"
  prompt: string;        // markdown-free plain text
  choices: QuizChoice[]; // exactly 4 expected, but type allows 2+
  correctChoiceId: string;
  explanation?: string;  // shown after submission
}

export interface Quiz {
  slug: string;          // matches the module slug
  title: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number;         // count of correct answers
  total: number;         // total questions
  percentage: number;    // 0-100, integer
  passed: boolean;       // percentage >= 72
  perQuestion: { questionId: string; correct: boolean; selectedChoiceId: string | null }[];
}

export type QuizState =
  | { status: "idle" }
  | { status: "answering"; answers: Record<string, string> }
  | { status: "submitted"; answers: Record<string, string>; result: QuizResult };

export type QuizAction =
  | { type: "select"; questionId: string; choiceId: string }
  | { type: "submit" }
  | { type: "retry" };
```

### Data file layout

One file per module under `src/content/quizzes/<slug>.ts`, each exporting a typed `Quiz` const (default export):

```
src/content/quizzes/
  agentic-architecture.ts
  claude-code-configuration.ts
  prompt-engineering.ts
  tool-design-mcp.ts
  context-management.ts
  rag-with-claude.ts
  cross-module-reference.ts
```

Justification for `.ts` over JSON: compile-time validation against the `Quiz` interface, ergonomic multi-line strings for prompts/explanations, and the ability to `as const` choice IDs. JSON would force runtime validation and is harder to author with multi-paragraph explanations. The overview file (`00-exam-overview.md`) gets **no quiz** — it is reference material, not a learning module. This is documented in the home page copy.

A single registry at `src/content/quizzes/index.ts` exports a `quizzesBySlug: Record<string, Quiz>` map so `/modules/[slug]/page.tsx` can do a single lookup.

### Quiz state machine

```
idle ──(select)──▶ answering ──(select)──▶ answering
                       │
                       └──(submit)──▶ submitted ──(retry)──▶ idle
```

- **idle**: no answers selected. First `select` action transitions to `answering`.
- **answering**: at least one answer selected; further `select` updates the `answers` map; `submit` is enabled only when **every** question has an answer (button disabled otherwise).
- **submitted**: result computed; per-question right/wrong + explanation revealed. `retry` resets to `idle` and clears the `answers` map.

### Scoring

- Per-question correctness: `selectedChoiceId === correctChoiceId`.
- `score = number of correct`, `total = questions.length`, `percentage = Math.round((score / total) * 100)`.
- **Pass threshold: 72%** (mirrors the 720/1000 official exam threshold). `passed = percentage >= 72`.
- Display: "X / Y correct (Z%)" plus a `Badge` reading **PASS** (green) or **RETRY** (amber) — never "FAIL" (the wording is encouraging). The badge is the sole pass/fail indicator.

### UX flow

1. **idle**: user sees questions with empty radio groups, submit button disabled with helper text "Answer all questions to submit."
2. **answering**: user selects radios; submit enables once all answered.
3. **submit**: state transitions to `submitted`; per-question rows show correct/incorrect indicator, the user's choice highlighted, the correct choice marked, and the `explanation` revealed if present.
4. **submitted**: a summary panel at the top of the quiz shows the score + pass/retry badge and a **Retry** button.
5. **retry**: clears state back to `idle`; previous score is written to `localStorage` (optional persistence) before reset.

### Seed quiz files

Each of the 7 quiz files ships in Phase 2 with **5 placeholder questions** that compile against the `Quiz` interface and contain a `// TODO: replace with real questions sourced from modules/0X-*.md` comment at the top. `frontend-dev` will replace placeholders with real questions in Phase 2 by re-reading each module. Placeholders are valid (they pass typecheck and render) so the build is never broken.

## Task Assignments

All tasks are assigned to **frontend-dev** and must be executed in order unless dependencies allow parallelism.

### T1 — Scaffold Next.js app

- **Description**: Run `create-next-app@14` at the project root with the exact flags from the plan.
- **Dependencies**: none.
- **Acceptance criteria**:
  - Command run: `npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git`.
  - If create-next-app refuses the non-empty cwd, `modules/` and `implementation-plan.md` are temporarily moved to a sibling temp dir, scaffold runs, then both are moved back. `.git/` is preserved throughout.
  - `npm run dev` boots the default Next.js page on `localhost:3000` with no errors.
  - `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs` (or `.eslintrc.json`), and `src/app/{layout,page}.tsx` exist.
  - `modules/` directory still contains all 8 markdown files.

### T2 — Install + configure markdown pipeline

- **Description**: Add markdown rendering deps and wire up Tailwind typography.
- **Dependencies**: T1.
- **Acceptance criteria**:
  - `npm i react-markdown remark-gfm rehype-slug rehype-autolink-headings rehype-pretty-code shiki @tailwindcss/typography gray-matter github-slugger` succeeds.
  - `tailwind.config.ts` registers `require('@tailwindcss/typography')` in `plugins` and sets `darkMode: 'media'`.
  - `src/lib/markdown.ts` exports `renderMarkdown(source: string): Promise<ReactNode>` and `extractToc(source: string): { depth: 2 | 3; text: string; slug: string }[]`, both wired to `github-slugger` so heading anchors and TOC slugs match.
  - A throwaway test page renders one of the source modules with code highlighting visible (Shiki classes in DOM).

### T3 — Module content layer

- **Description**: Create the slug map and module loader utilities.
- **Dependencies**: T1.
- **Acceptance criteria**:
  - `src/lib/modules.ts` exports a `MODULES` array (ordered) with entries `{ slug, title, domain, weight, sourceFile, isLanding }` covering all 8 source files.
  - Exports `getAllModules(): ModuleMeta[]` (excludes the landing module by default; accepts a `{ includeLanding?: boolean }` option).
  - Exports `getModuleBySlug(slug: string): { meta: ModuleMeta; markdown: string } | null` reading from `path.join(process.cwd(), 'modules', meta.sourceFile)`.
  - Exports `getLandingMarkdown(): string` returning the contents of `modules/00-exam-overview.md`.
  - Slug map matches the table under "Module loading strategy" exactly.
  - Unit-tested manually by logging `getAllModules().map(m => m.slug)` — output is the 7 non-landing slugs.

### T4 — Home page

- **Description**: Render `00-exam-overview.md` plus a grid of `ModuleCard`s.
- **Dependencies**: T2, T3.
- **Acceptance criteria**:
  - `src/app/page.tsx` is a Server Component that calls `getLandingMarkdown()` and `getAllModules()`.
  - Markdown body renders inside `<article className="prose ...">` with all tables, blockquotes, and code blocks visible.
  - Below the prose, a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) of `ModuleCard` components links to `/modules/<slug>` for each non-landing module.
  - Each card shows title, domain number, weight, and a one-line summary.
  - Lighthouse a11y score on the home page is >= 95 in dev.

### T5 — Module page (`/modules/[slug]`)

- **Description**: Dynamic module page with TOC, content, and prev/next nav.
- **Dependencies**: T2, T3.
- **Acceptance criteria**:
  - `src/app/modules/[slug]/page.tsx` exports `generateStaticParams` returning the 7 non-landing slugs only.
  - Visiting `/modules/exam-overview` returns 404.
  - Page layout: sticky `Toc` on `lg+`, collapsing `<details>` on smaller screens; main `<article className="prose ...">`.
  - `ModuleNav` renders prev/next links based on `MODULES` order; first module hides "prev", last module hides "next".
  - Heading anchors work: clicking the appended link copies a URL with `#slug` and scrolls to the heading.
  - All four module bodies tested visually (`01`, `04`, plus two of the others) — tables, blockquotes, ASCII diagrams, and TS/JSON/bash code blocks all render correctly.

### T6 — Quiz types + seed quiz files

- **Description**: Define quiz interfaces and ship 7 placeholder quiz files.
- **Dependencies**: T1.
- **Acceptance criteria**:
  - `src/types/quiz.ts` exports `QuizChoice`, `QuizQuestion`, `Quiz`, `QuizResult`, `QuizState`, `QuizAction` matching the schema in this plan.
  - `src/content/quizzes/<slug>.ts` exists for all 7 non-landing slugs, each exporting a typed `Quiz` const with **5 placeholder questions** and a `// TODO` comment header.
  - `src/content/quizzes/index.ts` exports `quizzesBySlug: Record<string, Quiz>` covering all 7 slugs.
  - `npx tsc --noEmit` passes — placeholders are type-correct.
  - The overview module has no quiz file; this is documented in a code comment in `index.ts`.

### T7 — `Quiz` client component

- **Description**: Build the reusable `Quiz` client island with the state machine, scoring, and accessibility hooks.
- **Dependencies**: T6.
- **Acceptance criteria**:
  - `src/components/Quiz.tsx` starts with `"use client"`.
  - Implements the state machine via `useReducer` with the actions defined in this plan (`select`, `submit`, `retry`).
  - Submit button disabled until every question is answered; helper text visible while disabled.
  - On submit: per-question correct/incorrect markers + explanations revealed; summary panel with `score / total (percentage%)` and a PASS/RETRY badge using a 72% threshold.
  - Retry resets state to `idle` and writes the previous result to `localStorage` under `cca-prep:last-score:<slug>`.
  - Keyboard navigation: Tab through radios, Enter submits, focus moves to the result heading on submission, `aria-live="polite"` announces the score.
  - All radios share `name={question.id}`; questions wrapped in `<fieldset>`/`<legend>`.

### T8 — Wire `Quiz` into module pages

- **Description**: Mount `Quiz` at the bottom of each `/modules/[slug]` page.
- **Dependencies**: T5, T7.
- **Acceptance criteria**:
  - `src/app/modules/[slug]/page.tsx` looks up the quiz via `quizzesBySlug[slug]` and renders `<Quiz quiz={...} />` below the markdown content.
  - If a slug somehow lacks a quiz, the page renders gracefully without the Quiz section (no crash) and logs `console.warn` server-side.
  - Quiz appears below `ModuleNav` and is separated by a clear visual divider and an `<h2 id="quiz">Self-check quiz</h2>` heading that the TOC includes.
  - Server-rendered markdown is not affected by the quiz client island (no hydration mismatch warnings in dev).

### T9 — Styling polish, responsive, accessibility

- **Description**: Final pass on layout, dark mode, prose tweaks, and a11y.
- **Dependencies**: T4, T5, T8.
- **Acceptance criteria**:
  - Layouts hold from 320px to 1920px width with no horizontal scroll on prose pages.
  - Tables wrap or scroll horizontally inside their own container at narrow widths (no page-level overflow).
  - Dark mode (set OS to dark) renders prose, tables, code blocks, and quiz with no contrast issues; Shiki uses the dark theme.
  - Lighthouse a11y >= 95 on `/`, `/modules/agentic-architecture`, and one other module page.
  - `npm run lint` reports zero `jsx-a11y` errors.

### T10 — Build + lint verification

- **Description**: Ensure production build is green.
- **Dependencies**: T1–T9.
- **Acceptance criteria**:
  - `npm run lint` exits 0.
  - `npx tsc --noEmit` exits 0.
  - `npm run build` exits 0 and shows 8 statically-rendered routes (`/` plus 7 `/modules/<slug>`).
  - `npm run start` serves the built app; spot-check `/`, one module page, and quiz submit/retry.
  - No `console.error` or hydration warnings in the browser console on any page.

## Key File References

### Source markdown to slug map

| Source file | Slug | Purpose |
|---|---|---|
| `modules/00-exam-overview.md` | (n/a — landing) | Home page (`/`) content |
| `modules/01-agentic-architecture.md` | `agentic-architecture` | Module page |
| `modules/02-claude-code-configuration.md` | `claude-code-configuration` | Module page |
| `modules/03-prompt-engineering.md` | `prompt-engineering` | Module page |
| `modules/04-tool-design-mcp.md` | `tool-design-mcp` | Module page |
| `modules/05-context-management.md` | `context-management` | Module page |
| `modules/06-rag-with-claude.md` | `rag-with-claude` | Module page |
| `modules/07-cross-module-reference.md` | `cross-module-reference` | Module page |

### Planned new files in the app

```
src/
  app/
    layout.tsx                         # root layout, header/footer, prose container shell
    page.tsx                           # home page — landing markdown + ModuleCard grid
    modules/
      [slug]/
        page.tsx                       # dynamic module page; generateStaticParams excludes overview
    not-found.tsx                      # 404 for unknown slugs
    globals.css                        # Tailwind layers + minor base styles
  components/
    SiteHeader.tsx                     # Server
    SiteFooter.tsx                     # Server
    ModuleCard.tsx                     # Server
    ModuleNav.tsx                      # Server (prev/next)
    ModuleContent.tsx                  # Server (wraps react-markdown pipeline)
    Toc.tsx                            # Server (sticky on lg+)
    Quiz.tsx                           # Client ("use client") — only client island
    QuizQuestion.tsx                   # Client (rendered inside Quiz)
    QuizResult.tsx                     # Client (rendered inside Quiz)
    Badge.tsx                          # Server (PASS/RETRY badge primitive)
  lib/
    modules.ts                         # MODULES array + getAllModules + getModuleBySlug + getLandingMarkdown
    markdown.ts                        # renderMarkdown + extractToc + plugin pipeline
  content/
    quizzes/
      index.ts                         # quizzesBySlug registry
      agentic-architecture.ts
      claude-code-configuration.ts
      prompt-engineering.ts
      tool-design-mcp.ts
      context-management.ts
      rag-with-claude.ts
      cross-module-reference.ts
  types/
    quiz.ts                            # QuizQuestion, Quiz, QuizResult, QuizState, QuizAction
    modules.ts                         # ModuleMeta type
tailwind.config.ts                     # darkMode: 'media', typography plugin, custom prose tweaks
next.config.mjs                        # default; no custom config required
```
