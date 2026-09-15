# 04 — Agent Usage Guide

## First-time setup (5 minutes)

1. Install recommended extensions when VS Code prompts (`.vscode/extensions.json`).
2. Open **Chat → MCP Servers** (or run `MCP: List Servers`) and start:
   - `github` → sign in with GitHub when prompted
   - `azure-devops` → enter your ADO org name when prompted (the `<org>` in `dev.azure.com/<org>`) → sign in with Microsoft
   - `figma` → sign in with Figma (remote server, all seats) — or `figma-desktop` if your org requires the desktop server (needs Figma desktop app running with Dev Mode MCP enabled)
   - `microsoft365` → call the `login` tool once in chat; follow the device-code link
3. Verify: in Copilot Chat (Agent mode) ask **"List ADO projects"** and **"list my open PRs"**.

The local stdio alternative `azure-devops-local` exists for networks that block the remote endpoint. Use one or the other, not both.

## The four custom agents

Select them from the agent dropdown in Copilot Chat or type `@name`.

| Agent          | Does                                                                       | Never                              | Tools                         |
| -------------- | -------------------------------------------------------------------------- | ---------------------------------- | ----------------------------- |
| `@planner`     | Story → plan with AC, projects, generator commands, tests, tokens, risks   | Edits files                        | search, ADO, Figma, GitHub    |
| `@implementer` | Writes code per plan; uses generators, tokens, signals; runs `nx affected` | Pushes to main, adds deps silently | edit, run, ADO, Figma, GitHub |
| `@qa`          | Adds unit/e2e tests mapped to AC; reports traceability table               | Changes production code            | edit, run, ADO                |
| `@reviewer`    | Read-only review against architecture/Angular/test/security/traceability   | Edits files, posts without asking  | search, GitHub, ADO           |

## The four prompts

Type `/` in chat.

| Prompt                | Inputs                           | Output                                                      |
| --------------------- | -------------------------------- | ----------------------------------------------------------- |
| `/story-to-plan`      | work item id, optional Figma URL | Plan; offer to create ADO Tasks                             |
| `/figma-to-component` | Figma URL, AB#, target lib, name | Generated component + spec + token mapping + commit message |
| `/pr-summary`         | (current branch)                 | PR title/body filling the template; offer to open draft PR  |
| `/release-notes`      | version, previous tag            | Markdown notes grouped by Feature; offer to save/post       |

## Skills (auto-loaded knowledge)

Agents pull these in when relevant; you can also reference them:

- `nx-generators` — exact generator commands and tag rules
- `ado-workflow` — DoR/DoD, `AB#` linking semantics, safe ADO write operations
- `design-tokens` — Figma variable → token → CSS var pipeline

## Instruction files (always-on rules)

- `.github/copilot-instructions.md` — every request
- `.github/instructions/angular.instructions.md` — `**/*.ts`
- `.github/instructions/testing.instructions.md` — specs and e2e
- `.github/instructions/styling.instructions.md` — `**/*.scss`, `**/*.html`

## Effective prompting

- Always give the `AB#` — agents fetch the story and hold themselves to its AC.
- Paste Figma "Copy link to selection" URLs; the node id in the URL is what the MCP tool needs.
- Ask for the plan first on anything non-trivial. Cheap to correct a plan; expensive to correct code.
- Prefer "make `nx affected` green" over "fix the tests" — the former includes lint and build.
- When an agent proposes a dependency, ask "what in `package.json` already does this?"

## Copilot coding agent (cloud)

- Enable at repo → Settings → Copilot → Coding agent.
- Create an issue with the **Agent task** template; assign to **Copilot**.
- It reads `AGENTS.md`, provisions with `.github/workflows/copilot-setup-steps.yml`, works on `copilot/*` branches, opens a PR.
- Same CI + human review. Good for: test gaps, a11y fixes, token additions, small isolated components. Not for: cross-cutting refactors, pipeline changes, anything touching auth.

## Guardrails you should know

- Agents can't merge or deploy; only humans with the right role can.
- `@reviewer` is a second pair of eyes, not a substitute for a human reviewer.
- MCP write operations (create task, post comment, send Teams message) require your confirmation in chat. If an agent does something external without asking, report it.
- MCP config never contains secrets. If you're ever asked to paste a PAT into `mcp.json`, refuse and use the `${input:}` prompt or OAuth flow instead.
- Copilot content exclusions (org setting) keep secrets folders and infra out of agent context — see [08](08-security-governance.md).

## Troubleshooting

| Symptom                            | Fix                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| ADO tools not showing              | Start the server in MCP view; check org name; try `azure-devops-local`                      |
| Figma tool returns "no selection"  | Use a "Copy link to selection" URL, not the file URL; for desktop server ensure app is open |
| M365 tools say "not authenticated" | Run the `login` tool; on Windows Node ≥ 20 required                                         |
| Agent ignores a rule               | Check the instruction file's `applyTo` glob matches the file; restate the rule in chat      |
| commitlint rejects your commit     | Add `AB#<id>` footer; use a valid type/scope                                                |
