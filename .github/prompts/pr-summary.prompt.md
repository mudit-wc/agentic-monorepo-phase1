---
description: Draft a PR title and description from the current branch diff, linked to the Azure DevOps work item
agent: agent
tools: ['changes', 'search', 'azure-devops/*', 'github/*']
---

Draft a pull request for the current branch.

1. Read the diff against `origin/main` and the commit messages.
2. Extract `AB#<id>` from the branch name or commits; fetch the work item title and acceptance criteria.
3. Produce:
   - **Title**: Conventional Commit style, ≤ 72 chars, e.g. `feat(dashboard): add KPI summary card (AB#123)`
   - **Body** that fills every section of `.github/pull_request_template.md`, including `Fixes AB#<id>`, a summary, type of change, the checklist (mark what the diff shows as done), Figma link if any commit mentions one, and an "Agent involvement" note.
   - An **acceptance-criteria table** mapping each criterion to the files/tests that satisfy it.
4. Ask whether to open the PR as a draft via the GitHub MCP tools. Do not open it without confirmation.
