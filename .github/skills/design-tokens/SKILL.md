---
name: design-tokens
description: How Figma variables become design tokens in libs/shared/ui-tokens and how to consume them in SCSS. Use when implementing UI from Figma or when a needed token is missing.
---

# Design tokens pipeline

```
Figma variables ──(Figma MCP get_variable_defs / Tokens Studio export)──▶ libs/shared/ui-tokens/tokens/*.json
                                                                                 │
                                                                     npm run tokens:build (style-dictionary)
                                                                                 ▼
                                                          libs/shared/ui-tokens/src/generated/tokens.css   (CSS custom props)
                                                          libs/shared/ui-tokens/src/generated/tokens.scss  (SCSS map, optional)
                                                          libs/shared/ui-tokens/src/generated/tokens.ts    (typed keys)
```

`tokens.css` is imported once in `apps/*/src/styles.scss`. Components consume `var(--…)`.

## Source files

| File                     | Contents                                            |
| ------------------------ | --------------------------------------------------- |
| `tokens/color.json`      | Palette + semantic colors (`color.text.primary`, …) |
| `tokens/spacing.json`    | 4-pt scale (`spacing.1` … `spacing.12`)             |
| `tokens/typography.json` | font families, sizes, weights, line heights         |
| `tokens/radius.json`     | border radii                                        |
| `tokens/shadow.json`     | elevation                                           |
| `tokens/motion.json`     | durations, easings                                  |

Format: [DTCG](https://design-tokens.github.io/community-group/format/) — `{ "$value": ..., "$type": ... }`.

## Naming → CSS variable

`color.text.primary` → `--color-text-primary`
`spacing.4` → `--spacing-4`

## Adding a token from Figma

1. In Copilot Chat with the Figma frame selected: "get variable definitions for this selection"
2. For each variable without a match, add a DTCG entry in the right `tokens/*.json`. Keep Figma's collection/mode names as the path.
3. `npm run tokens:build`
4. Use `var(--new-token)` in SCSS. Commit both the JSON and the generated output.

## Rules

- Never edit files under `src/generated/` by hand
- Never inline a hex/px that represents a design decision
- Theme modes (light/dark) are separate JSON files with the same keys; the build emits `[data-theme="dark"]` overrides
- Token removals are breaking — search usages (`grep -r "--old-token" libs apps`) before deleting
