# 08 — Security & Governance

## Identity & access

| System        | Recommendation                                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub        | Org with **SAML/Entra SSO** (or EMU). Teams synced from Entra groups. 2FA required. CODEOWNERS enforced.                                              |
| Azure DevOps  | Entra-backed org. Project-level groups: Readers / Contributors / Release Managers / Project Admins. Environments' approvers = Release Managers group. |
| Azure         | Pipelines authenticate via **Workload Identity Federation** service connection — no client secrets. RBAC scoped to the resource group.                |
| Figma         | SSO; design-system library edit rights limited to design leads.                                                                                       |
| Microsoft 365 | Own Entra app registration for the M365 MCP server; delegated scopes only; admin-consented list is the audit record.                                  |

**No PATs anywhere in this repo.** MCP servers use OAuth/device-code flows; `mcp.json` only prompts for non-secret org/project names. If a PAT is ever unavoidable (legacy tooling), it lives in the OS credential store or Key Vault, never in files.

## Secrets handling

- `.gitignore` excludes `.env*`; GitHub **secret scanning + push protection** enabled (org setting).
- CI secrets: GitHub Actions repo secrets (`TEAMS_WEBHOOK_URL`, optionally `NX_CLOUD_ACCESS_TOKEN`); ADO variable group secrets. Both are masked in logs.
- Rotate webhook URLs and any token on suspected exposure; treat webhook URLs as bearer tokens.

## Supply chain

- `dependabot.yml` — weekly grouped updates for npm + Actions.
- `supply-chain.yml` — dependency review on PR (fail on high severity, deny copyleft licences), `npm audit` on prod deps, **SBOM** (SPDX) on every push to `main` uploaded as artefact + dependency snapshot.
- Lockfile is committed and `npm ci` is used everywhere (no floating installs).
- Pin GitHub Actions to major tags today; move to SHA pinning when the org policy requires it.

## Code security

- **CodeQL** `security-and-quality` on PR/push/weekly; alerts block merge via branch protection.
- Angular defaults: strict templates, sanitisation on. Reviewer agent flags `innerHTML` / `bypassSecurityTrust*`.
- No runtime secrets in the SPA; config injected at deploy time via SWA app settings / `build-info.txt` pattern.
- Content Security Policy configured in `staticwebapp.config.json` when the deploy target is finalised.

## Branch protection (`main`)

- Require PR; ≥ 1 approval; dismiss stale approvals; require CODEOWNERS review for owned paths
- Required checks: `validate`, `e2e`, `pr-hygiene`, `CodeQL`, `Dependency review`
- Require conversation resolution; require linear history; block force-push and deletion; include administrators
- Optional: require signed commits (Git commit signing via SSH/GPG or GitHub web-flow)

## Agent governance

| Control                             | Where                                                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Agents cannot merge or deploy       | Branch protection + ADO environment approvals (human groups)                                                                       |
| Reviewer agent is advisory          | `reviewer.agent.md` (read-only tools) + playbook                                                                                   |
| External writes need confirmation   | Agent instructions + VS Code MCP tool confirmation                                                                                 |
| Platform files off-limits to agents | `copilot-instructions.md`, `AGENTS.md`, CODEOWNERS on `.github/`, `pipelines/`, `nx.json`, `eslint.config.mjs`, `.vscode/mcp.json` |
| Coding agent scope                  | Issue template requires AB#, scope, AC; label `agent-task`; same CI/review gates                                                   |
| Coding agent network                | Repo Settings → Copilot → Coding agent → firewall allowlist (npm registry, GitHub only)                                            |
| Content exclusion                   | Org/repo Copilot settings → exclude `**/.env*`, `pipelines/secrets/**`, any infra state                                            |
| Model/data policy                   | Org Copilot policy: which models, telemetry opt-out, no training on code (Business/Enterprise default)                             |
| Attribution                         | PR template "Agent involvement" section; Teams/mail signoff suffix                                                                 |
| Audit                               | GitHub audit log (PR approvals, settings), ADO audit log (approvals, permission changes), MCP server logs locally                  |

## Compliance hooks (adapt to your regime)

- **Change management**: PR + ADO approval log = change record. Export monthly if auditors need it.
- **Segregation of duties**: author ≠ approver (branch protection); deployer ≠ approver (environment approvals by Release Managers, pipeline run by service identity).
- **Data residency**: if required, use GitHub Enterprise Cloud with data residency and Copilot Enterprise policies; ADO region chosen at org creation.
- **Retention**: Actions artefacts 7 days (adjust), SBOMs retained with releases, ADO pipeline retention per project settings.

## Observability (runtime)

- Add Application Insights to the shell app (`@microsoft/applicationinsights-web`) with the connection string injected per environment — placeholder in `apps/agentic-monorepo-main/src/main.ts` when the deploy target is finalised.
- Track **DORA** metrics: deployment frequency and lead time from ADO pipeline + GitHub PR data; change failure rate from Bugs linked to releases; MTTR from incident Bugs.

## Architecture Decision Records

Anything that deviates from this playbook or the agent rules needs an ADR in `docs/adr/NNNN-title.md` (context → decision → consequences), reviewed by platform owners.
