# agentic-monorepo-phase1

Nx 23 · Angular 22 monorepo built with an **agentic SDLC**: Azure DevOps Boards for work, GitHub for code & PRs, GitHub Actions for validation, Azure Pipelines for release, Figma for design, Teams/Outlook for communication — with Copilot agents assisting at every step and humans approving every merge and release.

**Start here →** [docs/sdlc-playbook](docs/sdlc-playbook/README.md) · Setting up external systems → [runbook](docs/sdlc-playbook/10-external-setup-runbook.md) · Plan → [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md)

## Quick start

```bash
npm ci                 # installs deps + husky hooks
npm start              # serve apps/agentic-monorepo-main
npm run affected       # nx affected -t lint test build
npm run graph          # module-boundary graph
npm run tokens:build   # rebuild design tokens from libs/shared/ui-tokens/tokens
```

Node 24 (`.nvmrc`), npm only.

## Layout

```
apps/agentic-monorepo-main        shell app (+ -e2e Playwright)
libs/dashboard/{feature,ui,data-access}
libs/shared/{ui,util,ui-tokens}
.github/{agents,prompts,instructions,skills,workflows}
pipelines/                        Azure Pipelines release
docs/sdlc-playbook/               how we work
```

Module boundaries are enforced by `@nx/enforce-module-boundaries` (`eslint.config.mjs`). Import libs via `@agentic/<name>`.

## Working on a story

1. `/story-to-plan <AB#id>` in Copilot Chat
2. `git switch -c feature/AB#<id>-<slug>`
3. `@implementer` → `@qa` → `@reviewer`
4. Commit (Conventional Commits + `AB#<id>` footer — enforced)
5. `/pr-summary` → PR with `Fixes AB#<id>`
6. Human review → merge → Azure Pipeline → dev/qa → tag `vX.Y.Z` → prod

Details: [02 — Workflow](docs/sdlc-playbook/02-workflow.md).

## Agents & MCP

`.vscode/mcp.json` declares GitHub, Azure DevOps, Figma, and Microsoft 365 MCP servers (OAuth / prompts only — no secrets). Custom agents `@planner`, `@implementer`, `@qa`, `@reviewer` and prompts `/story-to-plan`, `/figma-to-component`, `/pr-summary`, `/release-notes` live in `.github/`. Autonomous agents read [AGENTS.md](AGENTS.md).
