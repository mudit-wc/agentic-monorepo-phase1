# SDLC Playbook

The operating manual for developing in this repository with an agentic, traceable, enterprise-grade workflow.

| #   | Document                                                              | Read when…                                              |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| 01  | [Overview & ecosystem](01-overview.md)                                | You're new — start here                                 |
| 02  | [The agentic development loop](02-workflow.md)                        | You're about to pick up a story                         |
| 03  | [Branching, commits & traceability](03-branching-and-traceability.md) | You're creating a branch, commit, or PR                 |
| 04  | [Agent usage guide](04-agent-usage-guide.md)                          | You want to use `@planner`, `/figma-to-component`, etc. |
| 05  | [CI/CD](05-cicd.md)                                                   | You're touching pipelines or setting up environments    |
| 06  | [Design integration (Figma & tokens)](06-design-integration.md)       | You're implementing UI                                  |
| 07  | [Communications (Teams & Outlook)](07-communications.md)              | You're wiring notifications or digests                  |
| 08  | [Security & governance](08-security-governance.md)                    | You're a lead, reviewer, or platform owner              |
| 09  | [Onboarding checklist](09-onboarding-checklist.md)                    | Your first day                                          |
| 10  | [External setup runbook](10-external-setup-runbook.md)                | You're the person wiring GitHub / ADO / Azure / Teams   |

The agent-facing rules live in [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) and [`AGENTS.md`](../../AGENTS.md). If this playbook and those files ever disagree, the agent files win and this playbook has a bug — open a PR.
