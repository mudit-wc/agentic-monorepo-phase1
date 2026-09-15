# 05 — CI/CD

## Split of responsibilities

| Stage                | Where           | File                                        | Trigger                                      |
| -------------------- | --------------- | ------------------------------------------- | -------------------------------------------- |
| PR validation        | GitHub Actions  | `.github/workflows/ci.yml`                  | PR to `main`, push to `main`                 |
| Static analysis      | GitHub Actions  | `.github/workflows/codeql.yml`              | PR, push, weekly                             |
| Supply chain         | GitHub Actions  | `.github/workflows/supply-chain.yml`        | PR (dep review), push (SBOM), weekly (audit) |
| Notifications        | GitHub Actions  | `.github/workflows/notify-teams.yml`        | CI failure on main, release published        |
| Coding agent env     | GitHub Actions  | `.github/workflows/copilot-setup-steps.yml` | Used by Copilot coding agent                 |
| Build once + release | Azure Pipelines | `pipelines/azure-pipelines.yml`             | push to `main`, tag `v*`                     |

## GitHub Actions — `ci.yml`

Jobs:

1. **validate** — `nrwl/nx-set-shas` derives the affected range; `commitlint` over the PR commits; `nx format:check`; `nx affected -t lint test build --configuration=ci` (coverage thresholds from `jest.preset.js`); uploads coverage.
2. **e2e** — affected Playwright specs on Chromium; uploads report on failure.
3. **pr-hygiene** — fails if no `AB#<id>` in title/body/branch; warns if > 400 changed lines.

Make **validate**, **e2e**, **pr-hygiene**, **CodeQL**, and **Dependency review** required status checks on `main`.

### Nx Cloud (optional, recommended for teams)

Set `NX_NO_CLOUD: false` in `ci.yml`, add the `NX_CLOUD_ACCESS_TOKEN` repo secret, and run `npx nx connect`. Gains remote caching and distributed task execution.

## Azure Pipelines — `pipelines/azure-pipelines.yml`

```
Build ──▶ Dev ──▶ QA ──▶ Prod (tags only) ──▶ Notify
 (once)   auto     auto    approval gate      Teams card
```

- **Build** — `nx build --configuration=production`, stamps `build-info.txt`, publishes artifact `web`.
- **Dev / QA / Prod** — `templates/deploy-swa.yml` deployment jobs targeting ADO **Environments**. Fetches the SWA deployment token at run time via Azure CLI using a **Workload Identity Federation** service connection (no stored secret), deploys with `AzureStaticWebApp@0`, smoke-tests `/build-info.txt`.
- **Prod** only runs for `refs/tags/v*`. Approval is configured on the `prod` environment (not in YAML) so it can't be bypassed by a YAML edit.
- **Notify** — `templates/notify-teams.yml` posts an Adaptive Card with per-stage results.

### One-time ADO setup

1. **Project settings → Pipelines → Environments**: create `dev`, `qa`, `prod`. On `qa` and `prod` add **Approvals** (release manager group) and optionally **Business hours** / **Required template** checks.
2. **Service connections → Azure Resource Manager → Workload Identity Federation (automatic)**: name `azure-swa-wif`, scope to the resource group. Grant it **Contributor** on the RG (or a custom role with `Microsoft.Web/staticSites/*`).
3. **Library → Variable group** `agentic-monorepo-release`: `RESOURCE_GROUP`, `SWA_NAME_DEV`, `SWA_NAME_QA`, `SWA_NAME_PROD`, and secret `TEAMS_WEBHOOK_URL`. Link it to the pipeline; restrict edit to platform owners.
4. **Pipelines → New → GitHub (YAML)**: authorise the GitHub repo via the Azure Pipelines GitHub App; choose `pipelines/azure-pipelines.yml`.
5. Azure: create three Static Web Apps (Standard tier for custom domains/SLA) in the RG. Optionally front with Front Door for WAF.

### Rollback

Re-run the previous successful pipeline's **Prod** stage (same artifact) — build-once makes rollback a redeploy, not a rebuild. Or re-tag the last good commit.

## Quality gates summary

| Gate                     | Enforced by                              | Threshold                                               |
| ------------------------ | ---------------------------------------- | ------------------------------------------------------- |
| Lint + module boundaries | ESLint / `@nx/enforce-module-boundaries` | zero errors                                             |
| Unit coverage            | `jest.preset.js` (ci config)             | 70 % lines/functions/statements, 60 % branches          |
| Bundle size              | `project.json` budgets                   | 500 kB warn / 1 MB error initial                        |
| Component style size     | `project.json` budgets                   | 4 kB warn / 8 kB error                                  |
| Commit format + AB#      | commitlint (husky locally, CI on PR)     | must pass                                               |
| Vulnerable deps          | `dependency-review-action`, `npm audit`  | fail on **high**                                        |
| Licenses                 | `dependency-review-action` deny list     | GPL/AGPL/LGPL-3 blocked                                 |
| Code scanning            | CodeQL `security-and-quality`            | alerts must be triaged before merge (branch protection) |
| Formatting               | `nx format:check`                        | must pass                                               |

Raising a threshold: PR + note in the description. Lowering: needs an ADR in `docs/adr/` and platform-owner approval.

## Local equivalents

```bash
npm run affected            # nx affected -t lint test build
npm run format              # prettier write
npx nx affected -t e2e      # playwright
npm run graph               # visualise boundaries
```
