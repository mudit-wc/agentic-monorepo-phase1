---
description: Unit (Jest) and e2e (Playwright) testing conventions
applyTo: '**/*.spec.ts, **/*-e2e/**/*.ts'
---

# Testing conventions

## Unit tests (Jest, `*.spec.ts`)

- One spec file beside every component, service, pipe, guard, and util
- Structure: `describe('<ClassName>')` → `describe('<behaviour>')` → `it('should …')`
- Use `TestBed.configureTestingModule({ imports: [ComponentUnderTest], providers: [...] })`
- Prefer asserting through the DOM (`fixture.nativeElement.querySelector`) over inspecting component internals
- Use `fixture.componentRef.setInput('name', value)` for signal inputs
- Mock `data-access` services with `jest.fn()` or `provideHttpClientTesting()`; **never hit real HTTP**
- Test signals by reading `component.someSignal()` after `fixture.detectChanges()`
- Coverage thresholds in `jest.preset.js` are non-negotiable; add tests rather than exclude files
- No `fit`/`fdescribe`/`xit` left in committed code

## E2E tests (Playwright, `apps/*-e2e`)

- One spec per user-visible flow, named after the flow (`dashboard-overview.spec.ts`)
- Use role/label-based locators (`getByRole`, `getByLabel`) — not CSS selectors — so tests double as a11y checks
- Add `await expect(page).toHaveTitle(...)` / URL assertions after navigation
- Mock backend with `page.route()`; e2e must be hermetic
- Every PR that changes a user flow must add or update an e2e spec

## What a QA agent should produce

- Happy path + at least one edge case + one error state per behaviour
- Accessibility assertion in component tests (labelled controls, roles present)
- No snapshot tests for components; use explicit assertions
