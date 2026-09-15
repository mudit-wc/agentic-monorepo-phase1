# 07 — Communications (Teams & Outlook)

Three channels, three mechanisms. Keep humans in the loop on anything sent on their behalf.

## 1. System notifications (no agent involved)

| Source                         | Mechanism                                                               | Where configured                              |
| ------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------- |
| GitHub PRs, reviews, CI        | **GitHub app for Teams** (`@GitHub subscribe owner/repo pulls reviews`) | Teams channel → Apps → GitHub                 |
| Azure Boards changes           | **Azure Boards app for Teams** (`@Azure Boards subscriptions`)          | Teams channel → Apps → Azure Boards           |
| CI failure on `main`, releases | `.github/workflows/notify-teams.yml` → Adaptive Card                    | Repo secret `TEAMS_WEBHOOK_URL`               |
| Release pipeline results       | `pipelines/templates/notify-teams.yml` → Adaptive Card                  | ADO variable group secret `TEAMS_WEBHOOK_URL` |

### Getting a webhook URL

Teams channel → **⋯ → Workflows → "Post to a channel when a webhook request is received"** → copy the URL. Store it as a secret in both GitHub (Settings → Secrets → Actions) and the ADO variable group. Rotate if leaked; it's a bearer credential.

## 2. Agent-generated communication (human confirms)

Via the `microsoft365` MCP server (`--org-mode --preset outlook,teams,teams-write`):

| Use case                  | Prompt                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Release digest to channel | `/release-notes v1.4.0` → "post to Teams channel <name>"                           |
| Stand-up summary email    | "Summarise my ADO items updated since yesterday and draft an email to the team"    |
| PR-ready ping             | "Message <reviewer> on Teams that PR #45 (AB#123) is ready for review"             |
| Meeting scheduling        | "Find 30 min this week with <names> for the AB#123 design review and send invites" |

Rules baked into the config:

- All outgoing Teams/mail bodies get the suffix ` — sent by Copilot agent` (`--message-signoff-suffix`), so recipients know.
- The agent must show you the message and get a yes before sending (agent instructions + VS Code tool confirmation).
- Preset limits the tool surface to Outlook + Teams; no SharePoint/OneDrive tools loaded.

### Tenant prerequisites (enterprise)

- Work/school account in the tenant; personal MSAs don't have Teams tools.
- The default Softeria app registration requests delegated scopes on first login (`Mail.ReadWrite`, `Mail.Send`, `Chat.ReadWrite`, `ChannelMessage.Send`, `Calendars.ReadWrite`, …). Many tenants require **admin consent**. Options:
  1. Admin grants tenant-wide consent to the public app once, or
  2. Register your **own** Entra app (recommended for enterprise), set `MS365_MCP_CLIENT_ID` / `MS365_MCP_TENANT_ID` in `.vscode/mcp.json` `env`, and admin-consent exactly the scopes from `npx @softeria/ms-365-mcp-server --org-mode --preset outlook,teams,teams-write --list-permissions`.
- Conditional Access may block device-code flow; use the browser flow or an approved device.

## 3. Human-to-human norms

- Story questions → comment on the ADO work item (keeps context), mention in Teams only if urgent.
- PR discussion → GitHub review comments. Teams for "please look", not for the substance.
- Incidents → dedicated Teams channel; postmortem doc linked from the ADO Bug.
- Release announcements → single "Releases" channel, one post per prod deploy (automated) + human-written highlights when material.

## Suggested channel layout

```
Team: <Product>
  ├── General                 – announcements
  ├── Dev                     – GitHub app: PRs, reviews; ad-hoc dev chat
  ├── Builds & Releases       – CI failures, pipeline cards, release digests (webhook)
  ├── Boards                  – Azure Boards app: story state changes
  └── Design                  – Figma links, token change PRs
```
