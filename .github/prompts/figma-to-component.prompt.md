---
description: Generate an Angular standalone component from a Figma frame using design tokens
agent: implementer
---

Implement the Figma frame **${input:figmaUrl:Figma frame URL (Copy link to selection)}** as an Angular component for work item **AB#${input:workItemId:Work item ID}**.

Target library: `${input:targetLib:Nx project name, e.g. dashboard-ui}`
Component name: `${input:componentName:kebab-case name, e.g. kpi-summary-card}`

Procedure:

1. Use the Figma MCP tools to get the design context and variable definitions for the frame.
2. Map every Figma variable to an existing token in `libs/shared/ui-tokens`. For each missing token, add it to the appropriate `tokens/*.json` file and run `npm run tokens:build`. List the mapping.
3. Scaffold with `npx nx g @nx/angular:component --name=${input:componentName} --project=${input:targetLib} --changeDetection=OnPush --style=scss --no-interactive`.
4. Implement the template with semantic HTML and new control flow; expose inputs via `input()`/`input.required()` and events via `output()`.
5. Styles use only `var(--token)`; respect the component style budget.
6. Write the spec beside it: renders inputs, emits outputs, accessibility roles/labels present.
7. Export from the lib `index.ts`.
8. Run `npx nx affected -t lint test build --base=origin/main` and report results, the token mapping, and a suggested commit message with `AB#${input:workItemId}` footer.
