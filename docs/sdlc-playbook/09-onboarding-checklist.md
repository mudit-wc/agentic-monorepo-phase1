# 09 — Onboarding Checklist

Copy this into your first ADO Task and tick as you go.

## Day 0 — access (ask your lead)

- [ ] GitHub org membership + write access to `agentic-monorepo-phase1`
- [ ] Azure DevOps project access (Contributor)
- [ ] Figma seat with access to the design-system file
- [ ] Teams channels: Dev, Builds & Releases, Boards, Design
- [ ] GitHub Copilot licence (Business/Enterprise) with coding agent enabled

## Day 1 — workstation

- [ ] Install Node 24 (`.nvmrc`), Git, GitHub CLI (`winget install OpenJS.NodeJS.LTS Git.Git GitHub.cli`)
- [ ] Clone: `gh repo clone <owner>/agentic-monorepo-phase1`
- [ ] `npm ci` (installs husky hooks via `prepare`)
- [ ] Open in VS Code → accept recommended extensions
- [ ] Start MCP servers and sign in: `github`, `azure-devops`, `figma`, `microsoft365` ([04 — Agent usage guide](04-agent-usage-guide.md))
- [ ] Smoke test in Copilot Chat (Agent mode): "List ADO projects", "list open PRs in this repo"
- [ ] `npm run affected` passes locally; `npm start` serves the shell app
- [ ] `npm run graph` — look at the module boundaries once

## Day 1 — read

- [ ] [01 Overview](01-overview.md) · [02 Workflow](02-workflow.md) · [03 Branching](03-branching-and-traceability.md)
- [ ] `.github/copilot-instructions.md` (the rules agents follow — you follow them too)
- [ ] `AGENTS.md`

## Week 1 — first story

- [ ] Pick a small story in the current iteration (ask the PO for a "good first story")
- [ ] `/story-to-plan` → review plan → create ADO tasks
- [ ] Branch `feature/AB#<id>-…`
- [ ] Implement with `@implementer`, test with `@qa`, pre-review with `@reviewer`
- [ ] Commit (commitlint will coach you), `/pr-summary`, open PR
- [ ] Get a human review; merge; watch the pipeline deploy to dev/qa
- [ ] Verify the ADO story auto-closed and the Teams card arrived

## Good habits

- Read every line an agent writes before committing it.
- Plan first for anything > 1 hour.
- Small PRs. If you're at 300 lines, start thinking about where to cut.
- When an agent fights a rule, the rule is probably right — ask before overriding.
- Improve the playbook/agent files when they're wrong; that's a PR like any other (`docs`/`agents` scope, still needs an AB#).
