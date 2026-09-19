# Copilot Instructions — agentic-monorepo-phase1

This is an Nx Angular monorepo developed with an agentic SDLC: Azure DevOps (Boards) owns work items, GitHub owns code/PRs/CI, Azure Pipelines owns releases, Figma owns design, Teams/Outlook own communication. Agents participate in every stage but **humans approve every merge and every release**.

## Stack (do not deviate without an ADR)

- Nx 23, Angular 22 (standalone components, signals, `inject()`), TypeScript 6 strict, SCSS
- Unit tests: Jest (`*.spec.ts`). E2E: Playwright (`apps/*-e2e`)
- Lint: ESLint flat config + `@nx/enforce-module-boundaries`. Format: Prettier
- Package manager: **npm** (never introduce pnpm/yarn lockfiles)
- Node 24 (see `.nvmrc`)

## Workspace layout & module boundaries

```
apps/<app>                  type:app     scope:app        may import anything
libs/<scope>/feature        type:feature scope:<scope>    smart/routed components
libs/<scope>/ui             type:ui      scope:<scope>    dumb/presentational components
libs/<scope>/data-access    type:data-access             services, state, HTTP
libs/shared/util            type:util    scope:shared     pure helpers, no Angular deps
libs/shared/ui              type:ui      scope:shared     design-system components
libs/shared/ui-tokens       type:util    scope:shared     design tokens (generated from Figma)
```

Rules enforced by lint (see `eslint.config.mjs`):

- `feature` → may depend on `feature | ui | data-access | util`
- `ui` → may depend on `ui | util` only (never data-access)
- `data-access` → may depend on `data-access | util` only
- `util` → may depend on `util` only
- A domain scope (e.g. `scope:dashboard`) may only depend on itself and `scope:shared`
- Import libs **only** via their alias (`@agentic/<lib-name>`), never relative paths across projects

When creating a new lib, always use the Nx generator with the correct `--tags` and `--importPath`; never hand-create project folders.

## Angular conventions

- Standalone components only; no NgModules
- Prefer signals (`signal`, `computed`, `input()`, `output()`) over `@Input`/`@Output` decorators and over RxJS subjects for local state
- Use `inject()` in field initialisers instead of constructor injection
- `ChangeDetectionStrategy.OnPush` on every component
- New control flow (`@if`, `@for`, `@switch`) — never `*ngIf`/`*ngFor`
- Lazy-load feature libs via `loadChildren` in `app.routes.ts`
- Selector prefix: `app-` for apps, `lib-` for libs (configured per project)
- Styles: SCSS, consume tokens from `@agentic/shared-ui-tokens` — never hardcode colors, spacing, or font sizes that exist as tokens
- Accessibility is required: semantic HTML, labelled controls, keyboard operability, visible focus

## Testing conventions

- Every component/service/pipe gets a `*.spec.ts` beside it
- Use Angular `TestBed` + `ComponentFixture`; prefer testing behaviour via DOM over implementation details
- Mock `data-access` in `feature`/`ui` tests; never make real HTTP calls
- Coverage thresholds are enforced in CI (see `jest.preset.js`); do not lower them
- Add/extend a Playwright e2e when a user-visible flow changes

## Git, commits, PRs — traceability is mandatory

- Branch: `feature/AB#<id>-<kebab-slug>` (or `fix/`, `chore/`). `<id>` is the Azure Boards work item
- Commits: Conventional Commits, scope from `commitlint.config.mjs`, and **must reference `AB#<id>`** in the body or footer, e.g.

  ```
  feat(dashboard): add KPI summary card

  Implements the summary card per Figma frame 12:345.

  AB#123
  ```

- PRs: fill the template completely; `Fixes AB#<id>` in the description transitions the work item on merge
- Never commit secrets, tokens, `.env` files, or PATs. MCP config uses `${input:}` prompts only
- Never push directly to `main`. Never force-push shared branches

## Azure DevOps

This project uses Azure DevOps. Always check whether the Azure DevOps MCP server has a tool relevant to the user's request (work items, iterations, pipelines, wiki). When asked to plan or implement a story, fetch the work item first and quote its acceptance criteria back before proposing changes.

Every write to a work item (any type, any field — including tags, dates, iteration, links) must be followed by a `[Copilot agent][audit] rev N` comment describing the diff. Use `@ado-auditor` for this; see `.github/agents/ado-auditor.agent.md`.

## Figma

When a Figma URL is provided, use the Figma MCP tools to read the design context (layout, variables, components) before writing UI code. Map Figma variables to tokens in `@agentic/shared-ui-tokens`; if a token is missing, add it there rather than inlining a value.

## Agent behaviour & guardrails

- Prefer `npx nx affected -t lint test build` to validate; never run the full suite when affected is sufficient
- Run generators (`npx nx g ...`) instead of hand-scaffolding
- Keep PRs small (< ~400 changed lines). Split work if larger
- Do not modify `.github/workflows/`, `pipelines/`, `nx.json`, or `eslint.config.mjs` unless the task explicitly asks for it — these are platform-owned (see CODEOWNERS)
- Do not add dependencies without stating why in the PR; prefer what is already in `package.json`
- If a request conflicts with these rules, say so and propose a compliant alternative instead of silently deviating
- Custom agents: `@planner` (story → plan), `@implementer` (code), `@qa` (tests), `@reviewer` (read-only review), `@ado-auditor` (work item change-log comments). Prompts: `/story-to-plan`, `/figma-to-component`, `/pr-summary`, `/release-notes`
