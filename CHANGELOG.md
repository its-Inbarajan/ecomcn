# Changelog

Registry installs copy source into the adopter's repo, so an update here never
reaches an existing install. This file is the only upgrade path they have —
describe changes in terms of what to edit, not just what changed.

## [Unreleased]

### Added
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
