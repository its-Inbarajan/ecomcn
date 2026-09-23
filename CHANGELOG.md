# Changelog

Registry installs copy source into the adopter's repo, so an update here never
reaches an existing install. This file is the only upgrade path they have —
describe changes in terms of what to edit, not just what changed.

## [Unreleased]

### Added
- **Browse stage complete.** `filter-panel` (with `lib/filter-params.ts` and
  `hooks/use-filter-params.ts` — filter state in the URL, a pure parser for
  server components), `filter-sheet` (staged changes, applied once),
  `sort-toolbar` (settled-count announcements, native sort select) and
  `empty-results` (names the filters, offers the best relaxation).
- `/examples/listing-page` — the Browse blocks composed into one page, and a
  Usage section on each new block's docs page.
- `pnpm registry:check` / `registry:check:live` — the Registry Directory's four
  requirements plus the health monitor's setup checks, run in CI.
- `docs/directory-entry.json` — the `@ecomcn` entry for `directory.json`,
  validated against the directory's own schema.
- `pnpm test:install` now compiles every block in both a Base UI and a Radix
  app, and replays the directory's `add --dry-run` check for every item.
- Documentation site: `/blocks` catalogue index and a `/blocks/[slug]` page per
  shipped block, with a resizable live preview, install command, full source,
  props, registry dependencies and install targets.
- `/preview/[slug]` — each block rendered bare, with no site chrome, for the
  docs pages to iframe.
- `scripts/sync-registry.mjs` also emits `src/lib/registry-data.json`, so the
  docs pages read the catalogue as a static import instead of hitting the
  filesystem at build time.
- Blocks: `price-tag`, `product-card`, `product-grid`, `order-summary`.
- `theme-editorial` — the house palette as a `registry:theme` item.

### Changed
- `pnpm dev` now runs `scripts/dev.mjs`: it syncs the registry mirrors, starts
  `next dev`, and re-syncs whenever `registry.json` or `src/registry/**`
  changes. Previously a block added while the server was running had no data
  behind it and its docs page returned 404.
- `pnpm registry:check` rebuilds `public/r` before checking, and the check
  refuses to run against a stale build instead of reporting on it.
- `product-grid`: the compact density now adds a third column from `sm` up
  (it previously changed nothing below `lg`). **To pick this up in an existing
  install, change `"gap-y-7 lg:grid-cols-4"` to
  `"gap-y-7 sm:grid-cols-3 lg:grid-cols-4"` in `product-grid.tsx`.**
- ESLint now refuses any `next/*` import inside `src/registry/**`, so a block
  that would not compile in a Vite project fails CI instead of an adopter's
  build. Vendored `src/components/ui/**` is no longer linted — it is shadcn's
  code and a future `shadcn add` overwrites it.

### Fixed
- Blocks referenced their own tokens as `hsl(var(--sale))`. Tokens now ship as
  complete colours, so that resolved to `hsl(hsl(0 72% 42%))` and rendered
  nothing — the sale badge was invisible. **If you installed `price-tag`,
  `product-card` or `order-summary` before this, replace every
  `hsl(var(--x))` in them with `var(--x)`.**
- `theme-editorial` shipped a partial palette, leaving `--accent`, `--popover`
  and `--destructive` undefined; Select, Dialog and Popover content rendered
  with a transparent background. It now ships the complete shadcn token set.
  **Re-run `shadcn add @ecomcn/theme-editorial` to pick up the missing tokens.**

## [0.1.0] — unreleased
Initial scaffold.
