# @agentic/shared-ui-tokens

Design tokens for the workspace, sourced from Figma variables and built with [style-dictionary](https://styledictionary.com).

```
tokens/*.json            ← edit these (DTCG format)
tokens/themes/dark.json  ← dark-mode overrides
build.mjs                ← npm run tokens:build
src/generated/           ← DO NOT EDIT: tokens.css, tokens.dark.css, tokens.scss, tokens.ts
```

## Consume

- SCSS/HTML: `var(--color-text-primary)`, `var(--spacing-4)`, `var(--font-size-md)` …
- TypeScript (rare): `import { ColorBrandPrimary } from '@agentic/shared-ui-tokens';`
- Theme switch: set `data-theme="dark"` on `<html>`

## Add a token from Figma

See `.github/skills/design-tokens/SKILL.md`.
