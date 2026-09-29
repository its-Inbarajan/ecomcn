# Changelog

Registry installs copy source into the adopter's repo, so an update here never
reaches an existing install. This file is the only upgrade path they have —
describe changes in terms of what to edit, not just what changed.

## [Unreleased]

## [0.1.0] — 2026-09-29

The first tagged release: the whole Browse stage, the first two Product
blocks, and a listing in the shadcn Registry Directory.

### Added
- `product-details-accordion` — materials, care, shipping and maker sections on
  your shadcn `accordion`, first section open. Each closed row carries a
  one-line summary. Sections open and close with Motion (height and a turning
  chevron) instead of the stock keyframes. One tag from `sections`, or composed
  from `ProductDetailsSection` and `ProductDetailsSpecs`; open state is shared
  through `useProductDetailsAccordion()`. To keep closed panels in the HTML,
  pass `contentProps={{ forceMount: true }}` (Radix) or
  `{{ keepMounted: true }}` (Base UI). Adds `motion`.
- `size-guide-dialog` — a measurement table in your shadcn `dialog` and
  `table`, opened from a link beside the size label. The panel morphs out of
  that link and back into it (Motion; a plain fade under reduced motion).
  cm / in with tape-honest rounding, the selected size marked, ranges and text
  equivalents (`"UK 7"`, never converted), and a pinned size column that
  scrolls sideways inside the dialog on narrow screens — no scrollbars drawn,
  a soft edge instead. Parts share the unit through `useSizeGuide()`.
  Adds `motion`.
- **Motion is the house style** (CONTRIBUTING rule 10): anything that changes
  shape animates with `motion` and morphs from where it came from. The quick
  view, size guide and details accordion follow it; hover and colour stay CSS.
  Every animation honours `prefers-reduced-motion`.
- **Listed in the shadcn Registry Directory** (shadcn-ui/ui#12025).
  `npx shadcn@latest add @ecomcn/<block>` now works in any project with no
  setup: the CLI finds `@ecomcn` in the directory and writes it into
  `components.json` on first use. Existing installs need no change — a
  namespace you registered by hand keeps working.
- `load-more` — progress rule, announced "Showing 24 of 312", button / hybrid /
  infinite modes, focus moved to the first new item, error with retry.
- `product-quick-view` — the card image morphs into a native `<dialog>` and back
  (Motion `layoutId`). Adds `motion`.
- Compound parts for `filter-panel` (`FilterPanelHeader`, `FilterPanelChips`,
  `FilterPanelFacet`, `useFilterPanel()`) and `product-card`
  (`ProductCardMedia`, `ProductCardImage`, `ProductCardBadge`,
  `ProductCardQuickAdd`, `ProductCardBody`, `ProductCardBrand`,
  `ProductCardTitle`, `ProductCardPrice`, `ProductCardMeta`,
  `ProductCardSwatches`, `ProductCardRating`, `useProductCard()`).
  **Backwards compatible:** with no children both render exactly as before.
- `product-card`: colours can carry their own `image`, shown when selected;
  controlled `colorIndex` / `defaultColorIndex`.
- `product-grid`: `renderCard` for composed cards, `loadingMore` /
  `loadingMoreCount` to append skeletons.
- `filter-panel`: uncontrolled use via `defaultValue`. `filter-sheet` accepts
  FilterPanel parts as children and stages them.
- Docs pages list a compound block's parts and hook, and show its context
  interface next to its props.
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
