---
description: Angular component, service, and routing conventions for this Nx workspace
applyTo: '**/*.ts'
---

# Angular conventions

## Components

- `standalone: true` is the default in Angular 22 — never add `NgModule`s
- Always set `changeDetection: ChangeDetectionStrategy.OnPush`
- Inputs/outputs via signal APIs: `input()`, `input.required()`, `output()`, `model()`
- Local state via `signal()` / `computed()` / `linkedSignal()`; side-effects via `effect()` sparingly
- Dependency injection via `inject()` in field initialisers — no constructor parameters
- Template control flow: `@if`, `@for (item of items; track item.id)`, `@switch`, `@defer` — never structural directives
- Host bindings via the `host: {}` metadata object, not `@HostBinding`/`@HostListener`
- Selector prefix `lib-` in libraries, `app-` in applications
- Keep components small; move logic that isn't view-related into a service in `data-access`

## Services & data access

- `providedIn: 'root'` for singletons; feature-scoped services provided via route `providers`
- HTTP via `HttpClient` + `httpResource()` or `toSignal()`; expose signals, not raw `Observable`s, to components
- Never call HTTP from `ui` or `feature` libs directly — go through `data-access`
- Typed models live beside the service (`*.model.ts`) and are exported from the lib `index.ts`

## Routing

- Feature libs export `<name>Routes: Route[]` from `lib.routes.ts`
- App wires them with `loadChildren: () => import('@agentic/<lib>').then(m => m.<name>Routes)`
- Use functional guards/resolvers (`CanActivateFn`, `ResolveFn`)

## Files & naming

- One component per folder: `foo.ts`, `foo.html`, `foo.scss`, `foo.spec.ts` (Angular 22 style, no `.component` suffix)
- Export public API only through the lib `src/index.ts`
- No barrel re-exports of internal implementation details

## Imports

- Cross-project imports **only** via `@agentic/*` aliases
- Order: Angular → third-party → `@agentic/*` → relative
