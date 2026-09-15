# 10 — External Setup Runbook

Everything that must be configured **outside** this repository, in dependency order. One person with admin rights on each system can complete this in an afternoon. Tick items as you go; each block lists what you need to have in hand.

## A. GitHub repository

**Need:** GitHub account `mudit-wc` (personal) or an org; GitHub CLI logged in (`gh auth login`).

- [ ] Create repo: `gh repo create agentic-monorepo-phase1 --private --source . --push` (from this folder, after `git init -b main` and first commit)
- [ ] Settings → **General**: default branch `main`; allow squash merge only; auto-delete head branches
- [ ] Settings → **Branches / Rulesets** → protect `main`: require PR, 1 approval, CODEOWNERS review, required checks (`validate`, `e2e`, `pr-hygiene`, `CodeQL`, `Dependency review`), linear history, block force-push, include admins
  - _Private repo on Free plan: branch protection requires Pro/Team. Either upgrade, make the repo public, or create a free Organization (Team plan needed for private protection)._
- [ ] Settings → **Code security**: enable Dependabot alerts + security updates, secret scanning + push protection, CodeQL (default setup is fine; the workflow file also works)
- [ ] Settings → **Actions → General**: allow GitHub + verified creator actions; workflow permissions "read", allow Actions to create PRs (for Dependabot)
- [ ] Settings → **Secrets and variables → Actions**: `TEAMS_WEBHOOK_URL` (after step E)
- [ ] Settings → **Copilot → Coding agent**: enable; firewall: allow `registry.npmjs.org`, `playwright.azureedge.net`
- [ ] Labels: create `agent-task`, `dependencies`, `ci`

## B. Azure DevOps

**Need:** Microsoft account; ADO org name (you choose); project name.

- [ ] Create org at https://dev.azure.com → **New organization** (pick region for data residency)
- [ ] Create project `agentic-monorepo-phase1` — **Agile** process, Git (repo unused; code stays in GitHub), private
- [ ] Project settings → **Boards → Project configuration**: iterations (2-week sprints, 6 ahead), area paths per domain (`Dashboard`, `Shared`, `Platform`)
- [ ] Project settings → **Boards → GitHub connections** → connect `mudit-wc/agentic-monorepo-phase1` (installs the **Azure Boards** GitHub App; approve in GitHub)
- [ ] Verify: create a test Story, note its ID, later push a commit with `AB#<id>` and confirm the link appears
- [ ] Update `.github/ISSUE_TEMPLATE/config.yml` with your `<ADO_ORG>/<ADO_PROJECT>` URL
- [ ] Update `.vscode/mcp.json` `azure-devops` default answer prompt (or just enter org when prompted)

## C. Azure (deploy target)

**Need:** Azure subscription, Contributor + User Access Administrator on a resource group.

- [ ] Create RG `rg-agentic-monorepo` (region near users)
- [ ] Create 3 Static Web Apps: `swa-agentic-dev`, `swa-agentic-qa`, `swa-agentic-prod` (Standard tier for prod)
- [ ] (Optional) Application Insights resource; note connection strings per env

## D. Azure Pipelines

**Need:** B and C complete.

- [ ] Project settings → **Service connections → New → Azure Resource Manager → Workload Identity federation (automatic)** → subscription + RG → name `azure-swa-wif`; grant access to all pipelines
- [ ] Project settings → **Pipelines → Environments**: create `dev`, `qa`, `prod`; on `qa`/`prod` → Approvals and checks → **Approvals** → add release-manager users/group
- [ ] Pipelines → **Library → + Variable group** `agentic-monorepo-release`: `RESOURCE_GROUP=rg-agentic-monorepo`, `SWA_NAME_DEV`, `SWA_NAME_QA`, `SWA_NAME_PROD`, `TEAMS_WEBHOOK_URL` (lock icon = secret); Pipeline permissions → allow this pipeline
- [ ] Pipelines → **New pipeline → GitHub → select repo → Existing Azure Pipelines YAML file → `/pipelines/azure-pipelines.yml`** → Save (don't run yet)
- [ ] Run once on `main` → dev + qa deploy; tag `v0.1.0` → prod approval prompt appears

## E. Microsoft Teams

**Need:** Teams admin or channel owner rights.

- [ ] Create team/channels per [07 — Communications](07-communications.md)
- [ ] Channel **Builds & Releases** → ⋯ → **Workflows** → "Post to a channel when a webhook request is received" → copy URL → store in GitHub secret + ADO variable group (A, D)
- [ ] Channel **Dev** → Apps → **GitHub** → `@GitHub subscribe mudit-wc/agentic-monorepo-phase1 pulls reviews comments`
- [ ] Channel **Boards** → Apps → **Azure Boards** → `@Azure Boards subscriptions` → pick project, work item types

## F. Microsoft 365 MCP (Outlook/Teams tools for agents)

**Need:** Work/school account; possibly a tenant admin.

- [ ] First use: in Copilot Chat call the `login` tool of the `microsoft365` server, complete device-code sign-in
- [ ] If consent is blocked: run `npx @softeria/ms-365-mcp-server --org-mode --preset outlook,teams,teams-write --list-permissions` and hand the scope list to the tenant admin, **or** create your own Entra app registration (public client, device-code enabled), admin-consent those delegated scopes, and set `MS365_MCP_CLIENT_ID` / `MS365_MCP_TENANT_ID` under the server's `env` in `.vscode/mcp.json`

## G. Figma

**Need:** Figma account with access to the design-system file.

- [ ] Remote server: start `figma` in the MCP view → OAuth sign-in. Done.
- [ ] Desktop server (if mandated): Figma desktop app → Preferences → **Enable Dev Mode MCP server**; then start `figma-desktop`
- [ ] Paste the design-system file link into `docs/sdlc-playbook/06-design-integration.md` and ADO wiki
- [ ] (Optional) Code Connect: `npx figma connect create` for `libs/shared/ui` components

## H. Optional but recommended

- [ ] **Nx Cloud**: `npx nx connect` → set `NX_NO_CLOUD: false` in `ci.yml`, add `NX_CLOUD_ACCESS_TOKEN` secret
- [ ] **SonarCloud**: create project, add `sonar-project.properties`, add a job to `ci.yml`
- [ ] **Storybook + Chromatic** for `libs/shared/ui`
- [ ] **Signed commits**: `git config commit.gpgsign true` + require in branch protection

## Verification (end-to-end smoke)

1. Story `AB#<id>` exists in ADO with AC.
2. `/story-to-plan <id>` returns a plan (ADO MCP works).
3. Branch, tiny change, commit with `AB#<id>` — husky/commitlint pass.
4. Push, open PR — `ci.yml`, CodeQL, dependency review run; `pr-hygiene` passes.
5. ADO work item shows the PR link.
6. Merge → Azure Pipeline runs → dev & qa deployed → Teams card posted.
7. Tag `v0.1.0` → prod approval → approve → prod deployed.
8. `/release-notes v0.1.0` → digest → post to Teams (M365 MCP works).
