# AGENTS.md

Guidance for autonomous coding agents (GitHub Copilot coding agent, Codex, Claude Code, etc.) working in this repository. The authoritative, more detailed rules live in [.github/copilot-instructions.md](.github/copilot-instructions.md) and the scoped files under `.github/instructions/` — read those too.

## What this repo is

Nx 23 + Angular 22 monorepo (`apps/`, `libs/`), npm, Jest, Playwright, ESLint, Prettier. Work is tracked in **Azure DevOps Boards**; every branch/commit/PR must reference a work item as `AB#<id>`.

## Setup

```bash
npm ci
```

Node 24 (`.nvmrc`). No other runtime needed.

## Validate before you open a PR

```bash
npx nx affected -t lint test build --base=origin/main
npx nx format:check
```

All three must pass. Do not lower coverage thresholds or disable lint rules to get green.

## Where to make changes

| Change type              | Location                              | Notes                                                 |
| ------------------------ | ------------------------------------- | ----------------------------------------------------- |
| New routed page/feature  | `libs/<scope>/feature`                | lazy-loaded from `apps/*/src/app/app.routes.ts`       |
| Presentational component | `libs/<scope>/ui` or `libs/shared/ui` | no data-access imports                                |
| HTTP/state               | `libs/<scope>/data-access`            |                                                       |
| Pure helpers             | `libs/shared/util`                    |                                                       |
| Design tokens            | `libs/shared/ui-tokens`               | generated from Figma; edit `tokens/*.json` not output |

Create new libs with `npx nx g @nx/angular:library ... --tags=scope:<scope>,type:<type> --importPath=@agentic/<name>`.

## Hard rules

1. Never push to `main`; always open a PR from `feature/AB#<id>-<slug>`.
2. Commit messages: Conventional Commits + `AB#<id>` footer (enforced by commitlint).
3. Do not edit `.github/workflows/`, `pipelines/`, `nx.json`, `eslint.config.mjs`, `.vscode/mcp.json` unless the issue explicitly asks.
4. No secrets, tokens, or `.env` files in the repo.
5. Respect module-boundary tags; lint will fail otherwise.
6. Standalone components, signals, `inject()`, `OnPush`, new control-flow syntax.
7. Keep PRs under ~400 changed lines; split otherwise.
8. Fill in the PR template, including `Fixes AB#<id>`.

## When stuck

Stop and leave a comment on the PR/issue describing the blocker rather than guessing. A human will respond.
