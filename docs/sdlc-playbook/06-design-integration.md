# 06 — Design Integration (Figma & Tokens)

## Two servers, pick one

| Server           | URL                         | Seats needed                                                                                | Extra capabilities                           |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `figma` (remote) | `https://mcp.figma.com/mcp` | all seats, all plans                                                                        | write-to-canvas, code-to-canvas              |
| `figma-desktop`  | `http://127.0.0.1:3845/mcp` | Dev or Full seat, paid plan; Figma desktop app running with **Dev Mode MCP server** enabled | required by some enterprise network policies |

Default to **remote**. Both are declared in `.vscode/mcp.json`; start only the one you use.

## Designer responsibilities (Definition of Ready for UI stories)

- Components use **Figma variables** (not hard-coded fills) from the shared design-system library.
- Frames are named and use Auto Layout so the MCP `get_design_context` output is structured.
- Frame link ("Copy link to selection") attached to the ADO story.
- New variables are added to the design-system file first, then flagged in the story so the dev adds the token.

## Developer flow

1. `/figma-to-component` with the frame URL, `AB#`, target lib (`dashboard-ui` / `shared-ui`), component name.
2. The implementer agent:
   - calls the Figma MCP for design context + variable definitions
   - maps each variable to an existing token; for gaps, adds DTCG entries in `libs/shared/ui-tokens/tokens/*.json` and runs `npm run tokens:build`
   - scaffolds via `nx g @nx/angular:component`, writes template/SCSS with `var(--token)` only, adds spec
3. You verify visually against Figma (Figma VS Code extension side-by-side helps) and check the a11y assertions in the spec.

## Token pipeline

```
Figma variables ──▶ tokens/*.json (DTCG) ──▶ npm run tokens:build ──▶ src/generated/{tokens.css, tokens.dark.css, tokens.scss, tokens.ts}
                                                                            │
                                            apps/*/src/styles.scss ◀────────┘  (imports both CSS files)
```

- Source of truth in the repo: `libs/shared/ui-tokens/tokens/`. Figma remains the design source; the JSON is the contract.
- Theme modes: `tokens/themes/<mode>.json` override only semantic tokens; build emits `[data-theme="<mode>"]`.
- Generated files are committed (so consumers don't need a build step) and excluded from Prettier.
- Optional automation: a Figma **Tokens Studio** or **Variables REST API** export job can open a PR updating the JSON weekly. Keep it as a PR so a human sees diffs.

## Storybook (recommended, not yet scaffolded)

```bash
npx nx g @nx/storybook:configuration shared-ui --uiFramework=@storybook/angular
```

Then add a `chromatic` or Playwright screenshot job for visual regression on `libs/shared/ui`. Storybook stories double as living documentation for designers.

## Code Connect (optional, higher fidelity)

Figma **Code Connect** maps design-system components to `libs/shared/ui` components so the MCP returns _your_ component usage instead of generic markup. Set up once per component with `npx figma connect create`.

## Rules recap

- No hardcoded colour/spacing/type values in SCSS — lint of the future; review discipline of today.
- Never edit `src/generated/`.
- Token removals/renames are breaking: grep usages first, deprecate for one release.
- If the design uses a value that isn't a variable, push back to design rather than inline it.
