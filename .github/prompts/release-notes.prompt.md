---
description: Generate release notes from merged PRs / commits since the last tag, grouped by ADO feature, and optionally post to Teams
agent: agent
tools: ['runCommands', 'search', 'azure-devops/*', 'github/*', 'microsoft365/*']
---

Generate release notes for **${input:version:Version or tag, e.g. v1.4.0}** covering changes since `${input:previousTag:Previous tag, e.g. v1.3.0}`.

1. Run `git log ${input:previousTag}..HEAD --pretty=format:"%s%n%b%n---"` and collect every `AB#<id>` referenced.
2. For each work item, fetch its title, type (Feature / User Story / Bug), and parent Feature from Azure DevOps.
3. Produce Markdown release notes:

   ```
   # Release ${input:version}

   ## Highlights
   - ...

   ## Features
   ### <Parent Feature title>
   - <Story title> (AB#123) — PR #45

   ## Bug fixes
   - ...

   ## Chores / internal
   - ...

   ## Upgrade notes
   - ...
   ```

4. Ask whether to (a) save to `docs/releases/${input:version}.md`, (b) create a GitHub Release draft, and/or (c) post a summary to the Teams channel via Microsoft 365 MCP. Do nothing external without confirmation.
