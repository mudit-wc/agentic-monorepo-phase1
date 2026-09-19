---
name: ado-workflow
description: How work items, branches, commits, and PRs are linked between Azure DevOps Boards and GitHub in this project. Use when planning, branching, committing, opening PRs, or updating work item state.
---

# Azure DevOps ↔ GitHub workflow

## Hierarchy

```
Epic → Feature → User Story → Task
                  ↑ the unit of a PR (one story = one PR, ideally)
```

Bugs are linked to the story/feature they affect.

## Definition of Ready (story may be pulled)

- Acceptance criteria present and testable
- Figma link attached if any UI changes
- Sized (story points) and in the current iteration
- No unresolved blocking dependencies

## Definition of Done

- PR merged to `main` with `Fixes AB#<id>`
- CI green (lint, test, build, e2e where applicable)
- Acceptance criteria verified by tests or documented manual check
- Work item automatically moved to Closed by the Azure Boards integration

## Linking rules (the `AB#` syntax)

| Where              | Syntax                        | Effect                                                |
| ------------------ | ----------------------------- | ----------------------------------------------------- |
| Branch name        | `feature/AB#123-kpi-card`     | Human readability; the id is picked up by prompts     |
| Commit body/footer | `AB#123`                      | Links the commit to the work item                     |
| PR description     | `Fixes AB#123` / `Fix AB#123` | Links **and transitions** the item to Closed on merge |
| PR description     | `AB#123` (without Fixes)      | Links only                                            |

Multiple items: `AB#123, AB#124`.

## Agent usage of ADO MCP

- **Read** freely: get work item, list iteration items, list child tasks, read wiki
- **Write** only after user confirmation: create child Tasks, update State, add comments, link PR
- Never change State to Closed manually — let the GitHub integration do it on merge
- When posting a comment, prefix with `[Copilot agent]`
- **After any write to a work item** (create, field update, tags, dates, links, state), immediately run the `@ado-auditor` procedure (or hand off to `@ado-auditor <id>`) so a `[Copilot agent][audit] rev N` comment explains what changed. No update is complete without its audit comment.

## Useful prompts

- "Get AB#123 and list its acceptance criteria"
- "Create tasks under AB#123 for each step in this plan"
- "What is in the current iteration for team <team>?"
- "Add a comment to AB#123 saying the PR is ready for review"
