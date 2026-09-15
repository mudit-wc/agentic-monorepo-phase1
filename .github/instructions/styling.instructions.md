---
description: SCSS, design tokens, and styling conventions
applyTo: '**/*.scss, **/*.html'
---

# Styling conventions

## Tokens first

- All colors, spacing, radii, typography, shadows, and z-indices come from `@agentic/shared-ui-tokens`
- Consume as CSS custom properties: `color: var(--color-text-primary);` — do **not** import SCSS variables across libs
- If a value from Figma has no matching token, add it to `libs/shared/ui-tokens/tokens/*.json` and rebuild (`npm run tokens:build`); never inline hex/px values that represent a design decision
- Only raw values allowed: `0`, `1px` borders, `100%`, `auto`, and layout-only calc expressions

## Component styles

- Component styles are encapsulated (default `ViewEncapsulation.Emulated`); avoid `::ng-deep`
- Use `:host` for the component root; use `host: { class: 'lib-foo' }` for a stable outer class
- Layout with CSS Grid / Flexbox; no float or table layouts
- Prefer logical properties (`margin-inline`, `padding-block`) for RTL readiness
- Respect the `anyComponentStyle` budget (4 kB warn / 8 kB error) — extract shared patterns into `libs/shared/ui`

## Theming

- Light/dark handled via `[data-theme]` attribute on `<html>` that swaps token values; components never branch on theme
- Use `prefers-reduced-motion` media query for animations

## Accessibility

- Visible focus styles on every interactive element (`:focus-visible`), never `outline: none` without a replacement
- Minimum 4.5:1 contrast for text; use token pairs that are pre-validated
- Hit targets ≥ 44×44 px on touch surfaces
- Semantic HTML first (`<button>`, `<nav>`, `<main>`, `<h1>`…), ARIA only to fill gaps
- Every form control has a visible `<label>` or `aria-label`
