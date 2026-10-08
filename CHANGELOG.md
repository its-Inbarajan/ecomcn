# Changelog

Registry installs copy source into the adopter's repo, so an update here never
reaches an existing install. This file is the only upgrade path they have —
describe changes in terms of what to edit, not just what changed.

## [Unreleased]

### Added
- `cart-line-item` — one line in a bag: thumbnail, name and variant, a
  quantity stepper, a right-aligned tabular line total (unit price under it
  when there is more than one), save-for-later and remove. Removing never
  asks: the row folds into a "Removed — Undo" bar, focus moves to Undo, and
  `onRemove` runs once the undo window (`undoMs`, 5s) passes — or at once if
  the line leaves the page first. Quantity presses show at once and reach
  `onQuantityChange` once, after the shopper settles (`debounceMs`, 500).
  Either handler can reject: the line puts itself back and says so.
  `onPreviewQuantityChange` lets a subtotal elsewhere follow ahead of your
  cart. Compound, through `useCartLineItem()`. Adds `motion`, `lucide-react`.
- `cart-sheet` — the mini cart on your shadcn `sheet`: a bag button whose
  count turns over, and a sheet that grows out of it as a circle and folds
  back into it. Ruled header, body and footer; the lines are the only
  scroller (soft edges, no scrollbar); the footer holds free-delivery
  progress, the subtotal and checkout. Focus returns to the bag button on
  close; lines are keyed by id so a cart update never remounts one mid-undo;
  the subtotal and count follow what the shopper sees. It scrolls natively
  rather than on `scroll-area`, whose scrollbar the house rules leave out.
  Compound, through `useCartSheet()`. Pulls `cart-line-item`.
- `checkout-stepper` — a rail of equal ruled cells: done steps carry a check
  and go back, the current step is `aria-current="step"`, steps to come are
  not clickable. A heavy rule slides to the current step; on a phone the rail
  shows numbers and names the step below. Adds `motion`, `lucide-react`.

### Fixed
- **Hydration in every block that formats numbers or prices**: `price-tag`,
  `product-card`, `order-summary`, `sort-toolbar`, `load-more`,
  `empty-results`, `filter-panel`, `filter-sheet` and `size-guide-dialog`.
  With no `locale` prop they formatted in the server's locale on the first
  render and the visitor's in the browser — a server in en-IN sent
  "$1,28,500" where an en-US browser rendered "$128,500", and React threw a
  hydration error. They now format in en-US until hydrated, then in the
  visitor's locale; pass `locale` to pin one. **To fix a copy you already
  have:** add the `useFormatLocale` hook from the new file under the
  imports, rename the root's `locale` parameter to `locale: localeProp`, and
  make `const locale = useFormatLocale(localeProp)` the root's first line.
  `price-tag` and `empty-results` gain `"use client"` to do so.

## [0.2.0] — 2026-10-05

The whole Product stage, and a product page composed from it: a gallery that
follows the colour you pick, the buy box with stock-aware swatches and a size
guide, details, reviews that filter, and a related rail. Five blocks are new;
`product-card` and `product-quick-view` changed — read **Changed** before
copying a newer file over one you have edited.

`product-details-accordion` and `size-guide-dialog` are listed under 0.1.0
below, but they were merged after the `v0.1.0` tag was cut: this is the first
tag that contains them.

### Added
- `product-gallery` — the last Product block. A main photo on your shadcn
  `carousel` with a counter, and thumbnails beside it from md up and under it
  on a phone, scrolling without a scrollbar. Swipe on touch; with a mouse the
  photo zooms 2× where the pointer is (Embla drags only for touch, so the
  mouse is free to zoom) and fades in `zoomSrc` once loaded. Pressing the
  photo opens it full screen on your shadcn `dialog` — the photo's box opens
  to the screen and folds back into it, the image fading in once it has
  landed — which is also the zoom for touch and the keyboard; swipe or the
  arrow keys move between photos there, and the main photo follows. The
  active thumbnail's frame slides to the next (`aria-current`); the rest sit
  at 60%. Loading is rationed: photo 1 has priority, photo 2 is fetched
  early, the rest when they are next. Images are data (`src`, `srcSet`,
  `zoomSrc`, `thumbSrc`, `alt`) rendered as `<img>`, or through
  `renderImage` for next/image. A new set of `images` — another colour —
  starts again at the first. Compound: `ProductGalleryMain`,
  `ProductGalleryThumbs`, `useProductGallery()`. Adds `motion`,
  `lucide-react`.
- `/examples/product-page` — the Product blocks composed into one page: the
  gallery follows the buy box's colour through `useProductBuyBox()`, with the
  details accordion under the buy box, reviews and a related rail. Examples
  now carry their own install command and notes.
- `product-buy-box` — the flagship. Brand, name, a rating that links to
  `#reviews` (`reviewsHref`), the price — a variant's own `price` /
  `compareAt` when it has one — `variant-swatches` for the options, a
  quantity stepper capped at the variant's stock, and an add-to-bag button
  that carries the live total: "Add to bag — $840". Adding is optimistic: the
  button says "Added" at once, and if `onAddToBag` rejects it rolls back with
  a line under it. A missing size is asked for (focus goes to the sizes)
  rather than greyed out; a sold-out pick becomes "Notify me" (`onNotify`).
  `delivery` gives a date range from business days and a dispatch
  cut-off — "Arrives Wed, Oct 7 – Fri, Oct 9", "Order within 2h 14m for
  dispatch today" — worked out on the shopper's clock after hydration.
  Labels, the price and the notice morph with Motion. Compound:
  `ProductBuyBoxHeader`, `…Price`, `…Variants`, `…Actions`, `…Quantity`,
  `…AddToBag`, `…Notice`, `…Delivery`, and `useProductBuyBox()`
  for your own parts — a gallery reads the same selected variant. Adds
  `motion`, `lucide-react`; pulls `price-tag` and `variant-swatches`.
- `review-summary` — the average set at 60px, a star histogram whose rows
  are buttons that filter the list ("5 stars, 226 reviews, 72%"), a fit scale
  with its reading in words, and reviews with a Verified buyer badge (your
  shadcn `badge`). Pass one page of `reviews` with the product's full
  `distribution`, and fetch per rating from `onRatingChange`. Dates are
  calendar dates, formatted in UTC. The active row's rule slides between
  rows, bars grow to their share, and the list grows to its measured height
  as it filters. Compound, through `useReviewSummary()`. Adds `motion`,
  `lucide-react`.
- `related-products` — a "pairs well with" rail of the exact `product-card`
  on your shadcn `carousel`, with the Carousel's own arrows in the header and
  a progress rule in place of a scrollbar. The cards and their images mount
  only when the rail comes within a screen of the viewport (`rootMargin`, or
  `eager` above the fold), fading in over skeletons of their exact shape.
  Returns nothing when there are no products. The shadcn Carousel's whole API
  passes through — `opts` (over its own `align: "start"`), `plugins`,
  `setApi`, `orientation` — and `cardProps` reach every card
  (`onWishlistChange`, `showColors`, `density`). Compound, through
  `useRelatedProducts()`. Adds `motion`.
- `variant-swatches` — colour swatches and a ruled size grid that work out
  stock from your `variants`. With a colour picked, a size it has none of is
  struck through with a diagonal rule (a halo on swatches, so it reads on
  black) and read out as "sold out" — but never disabled: it stays focusable
  and choosable, for a notify-me, while a live status line says why ("43 is
  sold out in Black.") and `purchasable` turns false. A few left shows as
  "2 left" under the size and "Only 2 left." in the status line
  (`lowStockThreshold`, default 3). A one-value option ("One size") is picked
  for you. The pick's mark slides between options with Motion (a fade under
  reduced motion). A radio group with roving focus: the arrow keys move,
  Space or Enter chooses. `sizeGuide` puts a `<SizeGuideDialog>` beside the
  size label. Compose from `VariantSwatchesOption` and
  `VariantSwatchesStatus`; `useVariantSwatches()` gives your own parts the
  selection, the resolved `variant` and `purchasable`. English strings are
  overridable through `messages`. No shadcn primitives, so nothing differs
  between Radix and Base UI. Adds `motion`.

### Changed
- `product-card` — a wishlist heart, on your shadcn `toggle` (now a registry
  dependency): pass `onWishlistChange` to show it. It fills at once and rolls
  back if the handler rejects; `wishlisted` / `defaultWishlisted` control it.
  It sits under the badge in a new `ProductCardCorner` (the default layout
  uses it). `showColors={false}` hides the swatches for products that don't
  come in colours. **If you composed `ProductCardMedia` yourself,** wrap
  `<ProductCardBadge />` and `<ProductCardWishlist />` in
  `<ProductCardCorner>` to get the heart; a lone badge renders as before.
- `product-quick-view` — the trigger shows the eye alone on a card narrower
  than 15rem (two to a row on a phone), so it no longer covers the badge; the
  words come back on wider cards. It now measures the card through a
  container query: Tailwind v4, or v3 with `@tailwindcss/container-queries`.

### Fixed
- Hydration in the new blocks: with no `locale` prop they format in en-US
  until hydrated, then in the visitor's locale. Formatting in the visitor's
  locale on the first render made the server's HTML ("Sep 21, 2026") disagree
  with the browser's ("21 Sept 2026"). Older blocks still format with the
  server's locale on the first render; pass `locale` to pin it.

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
