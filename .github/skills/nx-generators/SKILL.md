---
name: nx-generators
description: How to scaffold apps, libraries, and components in this Nx Angular workspace with the correct tags, import paths, and conventions. Use whenever creating new projects or components.
---

# Nx generators for this workspace

Always use generators. Never hand-create `project.json`, `tsconfig*.json`, or lib folders.

## Library

```bash
npx nx g @nx/angular:library \
  --directory=libs/<scope>/<type> \
  --name=<scope>-<type> \
  --tags=scope:<scope>,type:<type> \
  --importPath=@agentic/<scope>-<type> \
  --standalone --unitTestRunner=jest --linter=eslint --style=scss \
  [--routing --lazy --parent=apps/agentic-monorepo-main/src/app/app.routes.ts]   # feature libs only
  --no-interactive
```

| type          | tags                         | may import                     |
| ------------- | ---------------------------- | ------------------------------ |
| `feature`     | `scope:<s>,type:feature`     | feature, ui, data-access, util |
| `ui`          | `scope:<s>,type:ui`          | ui, util                       |
| `data-access` | `scope:<s>,type:data-access` | data-access, util              |
| `util`        | `scope:shared,type:util`     | util                           |

Non-Angular util libs: `npx nx g @nx/js:library --bundler=none ...` with the same tags/importPath.

After generating, update the scope constraints in `eslint.config.mjs` **only** if a brand-new scope was introduced (ask first — that file is platform-owned).

## Component

```bash
npx nx g @nx/angular:component \
  --name=<kebab-name> \
  --project=<project-name> \
  --changeDetection=OnPush \
  --style=scss \
  [--export]        # for ui libs
  --no-interactive
```

Angular 22 naming: files are `<name>.ts/.html/.scss/.spec.ts` (no `.component` suffix). Selector prefix is `lib-` in libs, `app-` in apps.

## Service / other

```bash
npx nx g @nx/angular:service --name=<name> --project=<data-access-project> --no-interactive
npx nx g @nx/angular:pipe    --name=<name> --project=<project> --no-interactive
```

## Application

```bash
npx nx g @nx/angular:application --directory=apps/<name> --name=<name> \
  --tags=scope:app,type:app --style=scss --routing --standalone \
  --e2eTestRunner=playwright --unitTestRunner=jest --prefix=app --no-interactive
```

## Verify

```bash
npx nx show project <name>          # tags, targets
npx nx graph                        # boundary visualisation
npx nx affected -t lint test build  # must be green
```
