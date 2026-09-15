# 03 — Branching, Commits & Traceability

## Model: trunk-based, short-lived branches

- `main` is always releasable. Protected: PR required, ≥1 approval, required checks, linear history, no force-push, no direct push (admins included).
- One branch per story/bug/chore. Lifetime target: < 3 days.
- Squash-merge → one Conventional Commit per PR on `main`.
- Releases are tags `vMAJOR.MINOR.PATCH` on `main`. No release branches unless a hotfix on an older version is needed (then `hotfix/vX.Y.Z-AB#<id>`).

## Branch naming

```
<type>/AB#<id>-<kebab-slug>

feature/AB#123-kpi-summary-card
fix/AB#456-dashboard-null-state
chore/AB#789-upgrade-nx-23
```

`<type>` ∈ `feature | fix | chore | docs | spike`. The `AB#<id>` is what agents and CI parse.

## Commit messages — Conventional Commits + AB#

```
<type>(<scope>): <subject ≤ 100 chars>

<body: what & why, not how>

AB#<id>
```

- `type`: `feat | fix | refactor | perf | test | docs | chore | ci | build | revert`
- `scope` (warned if not in list): `app | dashboard | shared | ci | deps | docs | agents | release`
- **`AB#<id>` is mandatory** (`references-empty: never` in `commitlint.config.mjs`). Husky blocks the commit locally; CI re-checks the whole PR range.
- Breaking changes: `feat(dashboard)!: …` plus a `BREAKING CHANGE:` footer.

## Pull requests

- Title mirrors the squash commit: `feat(dashboard): add KPI summary card (AB#123)`
- Body: the template, fully filled. `Fixes AB#123` is what transitions the work item.
- Size: aim < 400 changed lines. `ci.yml` warns above that.
- Required before merge: all checks green, 1 human approval (CODEOWNERS enforced for platform paths), conversations resolved.
- Drafts are encouraged early for CI feedback; mark ready only after `@reviewer` pre-review.

## The traceability chain

```
Epic ─▶ Feature ─▶ User Story AB#123 ─▶ branch feature/AB#123-… ─▶ commits (AB#123)
      ─▶ PR #45 (Fixes AB#123) ─▶ Actions run ─▶ squash commit on main
      ─▶ Azure Pipeline run #210 ─▶ Environment deployments (dev/qa/prod) ─▶ tag v1.4.0
      ─▶ release notes (grouped by Feature) ─▶ Teams post
```

Where to look it up:

| Question                                  | Where                                                 |
| ----------------------------------------- | ----------------------------------------------------- |
| Which PRs implemented story 123?          | ADO work item → Development section (GitHub links)    |
| Which story does this line of code serve? | `git log -L` / `git blame` → commit footer `AB#`      |
| What's in release v1.4.0?                 | `docs/releases/v1.4.0.md`, GitHub Release, Teams post |
| Is v1.4.0 in prod?                        | ADO Environments → prod → deployment history          |
| Who approved the prod deploy?             | ADO Environment approval log                          |
| Who approved the merge?                   | GitHub PR reviews (immutable audit)                   |

## Hotfix flow

1. Story/Bug in ADO → `fix/AB#<id>-…` from `main`.
2. Normal PR + CI + review (expedited, not skipped).
3. Merge → auto dev/qa. Tag `vX.Y.(Z+1)` → prod approval.

## Things that are never OK

- Committing without an `AB#` (there is no "quick fix" exception — create a Task)
- Force-pushing `main` or any shared branch
- Rewriting history of a branch someone else has checked out
- Merging your own PR without a second human approval
- Disabling a required check to get a merge through
