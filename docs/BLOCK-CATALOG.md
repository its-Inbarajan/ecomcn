# ecomcn — v1 block catalogue

29 blocks, five stages, one purchase funnel. Every block maps to a decision a
buyer makes. That is the organising principle — not "cards, forms, navigation",
which is how generic kits are structured and why nobody can tell them apart.

Each entry carries two things worth more than the screenshot: the **design
decision** that keeps it from looking generated, and the **hard part** that most
component kits get wrong.

Effort is 1–3, roughly half a day to two days each.

---

## Stage 1 — Discover

Landing surfaces. Their only job is to make one thing look worth clicking.

### `announcement-bar` · component · effort 1
Dismissible top-of-page ticker for shipping thresholds, sale windows and drops.
Marquee or static.
- **Design:** inverted ink bar, no rounding, brand dot as separator. Marquee runs
  at 26s — slow enough to read, fast enough to notice.
- **Hard part:** respect `prefers-reduced-motion` (freeze the marquee) and
  persist dismissal so it doesn't reappear on every route change.
- Composes: `button`

### `hero-editorial` · block · effort 2
Asymmetric split hero: oversized display headline left, full-bleed campaign
image right with an overlaid product caption.
- **Design:** 1.05fr / 0.95fr split rather than 50/50 — the small imbalance is
  what stops it looking like a template. Caption sits *on* the image, not under.
- **Hard part:** LCP. The hero image is almost always the largest contentful
  paint; ship `fetchpriority="high"` and a real aspect-ratio box so it never
  shifts.
- Composes: `button`

### `category-rail` · block · effort 2
Horizontally scrolling, snap-aligned category tiles with numbered index and item
counts.
- **Design:** tiles separated by 1px gaps over a border-coloured track, so the
  rail reads as one ruled object instead of floating cards.
- **Hard part:** scroll snapping plus keyboard access; arrow buttons must hide
  when the rail isn't overflowing.
- Composes: `button`, `scroll-area`

### `collection-grid` · block · effort 2
Magazine-style editorial grid — one dominant tile plus two supporting tiles.
- **Design:** 12-column grid with a 7/5 split. Type scale changes with tile size;
  the big tile gets the bigger heading.
- **Hard part:** degrading to one column without the hierarchy collapsing into
  "three identical cards".
- Composes: `aspect-ratio`

### `lookbook-strip` · block · effort 3
Full-bleed campaign image with positioned hotspots opening a product hover card.
- **Design:** hotspots are hairline rings, not filled dots — they read as
  annotation.
- **Hard part:** hotspot coordinates must be percentage-based and re-anchored on
  mobile, where the crop changes.
- Composes: `hover-card`, `popover`

---

## Stage 2 — Browse

The listing page. Where most of a store's revenue is actually decided.

### `product-card` · component · effort 2 · **shipped**
The workhorse. Image, badges, brand, name, price with compare-at, colour
swatches that swap the image, rating, slide-up quick-add. **Compound:** one tag
for the default layout, or `ProductCardMedia` / `ProductCardBody` and their
parts in any order, all reading `useProductCard()`.
- **Design:** quick-add slides up from the bottom edge of the image rather than
  floating over it, so it never covers the product.
- **Hard part:** quick-add must be keyboard-reachable
  (`focus-visible:translate-y-0`), and the card needs one link target — an
  `::after` overlay on the title anchor, not nested anchors. The parts share one
  context (selected colour, quick-add state) so a swatch can swap the image
  without either part knowing about the other.
- Composes: `button`, `@ecomcn/price-tag`

### `product-grid` · block · effort 1 · **shipped**
Responsive grid wrapper with loading skeletons, appended skeletons while more
results load, a density switch and a `renderCard` slot for composed cards.
- **Design:** column gap tighter than row gap (20/36px) — products group by row
  the way they do on a page of a printed catalogue.
- **Hard part:** skeletons must match the real card's box exactly or the grid
  jumps on load. Never a spinner here.
- Composes: `skeleton`, `@ecomcn/product-card`

### `filter-panel` · block · effort 3 · **shipped**
Applied-filter chips, checkbox lists with counts, a dual-handle range with typed
inputs, colour swatches and toggles. Ships `lib/filter-params.ts` (pure parse /
serialise, safe in server components) and `hooks/use-filter-params.ts`.
- **Design:** groups separated by top rules, not cards. Counts tabular-aligned to
  the right edge. Swatches print their name; selection adds a check and a
  heavier border.
- **Hard part:** filter state belongs in the URL, not React state — deep links
  and back-button behaviour are the whole point of a listing page. The slider
  commits on release, and an unchanged state never pushes a history entry.
- Composes: `checkbox`, `slider`, `switch`, `input`

### `load-more` · component · effort 2 · **shipped**
Progress rule, "Showing 24 of 312", a Load more button, and optional hybrid or
infinite loading.
- **Design:** the top hairline is the progress bar, filled to the share already
  shown. Count left, action right — it reads as the foot of the listing.
- **Hard part:** Baymard found Load more beats pagination and pure infinite
  scroll, but only with the details: focus moves to the first new product after
  a click, the new count is announced, `?page=3` restores the same depth, and
  hybrid mode auto-loads only after the shopper has asked once.
- Composes: `button`

### `product-quick-view` · block · effort 2 · **shipped** · depends on `motion`
The card's image morphs into a dialog and back — a shared-element transition.
- **Design:** one morph, used where it carries meaning; ease-out with no bounce.
  The panel surface fades on its own layer, so the moving image is never inside
  something that is also fading.
- **Hard part:** the dialog, not the morph — native `<dialog>` for the top
  layer and an inert page, Escape that plays the closing morph, focus returned
  only after the image lands, no movement at all under reduced motion. The only
  block that depends on `motion`, so it is opt-in.
- Composes: `button`, `@ecomcn/price-tag`, `@ecomcn/product-card`

### `filter-sheet` · block · effort 2 · **shipped**
The same facets in a left slide-over with a sticky Clear / Show N footer.
- **Design:** the footer sits outside the scroll area, so its rule runs full
  width and the primary action never scrolls away.
- **Hard part:** mobile filters stage changes and apply once, on Show or on
  close — applying live re-fetches on every tap. Uses a real `SheetTrigger`
  (styled with `buttonVariants`, no `asChild`) so focus returns on close in
  both Radix and Base UI.
- Composes: `sheet`, `button`, `@ecomcn/filter-panel`

### `sort-toolbar` · component · effort 1 · **shipped**
Result count, sort select, density toggle, and a slot for the mobile filter
trigger.
- **Design:** bounded top and bottom by hairlines so it reads as a masthead rule
  across the listing. Sort is a native `<select>` — the OS picker beats any
  popover on a phone.
- **Hard part:** announce result-count changes with an `aria-live` region —
  silent on first render and while loading, once per burst of changes.
- Composes: nothing. The filter trigger is a slot, so installing the toolbar
  doesn't drag in the whole filter stack.

### `empty-results` · component · effort 1 · **shipped**
No-match state that names the offending filters and offers the one useful escape.
- **Design:** left-aligned, not centred. Centred empty states are the most
  reliable tell of a generated UI.
- **Hard part:** be specific — "no results" is useless; "nothing matches “Sage”
  and “Up to $50” — remove “Up to $50” to see 4" converts. The suggestion is
  data, so the count can come from your search backend.
- Composes: `button`

---

## Stage 3 — Product

The detail page. Every objection a buyer has gets answered here or nowhere.

### `product-gallery` · block · effort 3
Thumbnail rail plus main image, counter overlay, horizontal thumb scroll on
mobile.
- **Design:** active thumb gets a solid border; inactive thumbs drop to 60%
  opacity instead of being greyed.
- **Hard part:** swipe on mobile, hover-zoom on desktop, `aria-current` on the
  active thumb. Preload only image 2.
- Composes: `carousel`, `aspect-ratio`

### `price-tag` · ui · effort 1
Locale-aware price with compare-at strike, computed discount badge, two sizes.
- **Design:** tabular numerals everywhere. A discounted price turns sale-red; a
  regular price stays ink.
- **Hard part:** `Intl.NumberFormat` with currency + locale as props. Hardcoding
  `$` is the single most common bug in component kits.
- Composes: nothing — pure Tailwind, zero registry dependencies

### `variant-swatches` · block · effort 3
Colour swatches and a size grid with out-of-stock strike-through and low-stock
messaging.
- **Design:** size grid is 1px gaps over a border track — a single ruled block
  rather than five buttons.
- **Hard part:** out-of-stock must be visible without colour alone (the diagonal
  rule) and must stay focusable so screen readers hear it's unavailable.
- Composes: `label`, `dialog`

### `size-guide-dialog` · component · effort 1
Measurement table plus a fit note, opened from the size label.
- **Design:** header row uses the eyebrow style; the table is ruled, not striped.
- **Hard part:** tables need horizontal scroll containment on narrow screens.
- Composes: `dialog`, `table`

### `product-buy-box` · block · effort 3
Title, price, rating link, variants, quantity stepper, add-to-bag with live
total, wishlist, delivery promise. **The flagship — the block people screenshot.**
- **Design:** the CTA carries the price. "ADD TO BAG — $420" outperforms a bare
  "Add to cart" because it removes a mental step.
- **Hard part:** optimistic add-to-bag with a rollback path, and a delivery
  estimate that's a date range, not "ships soon".
- Composes: `button`, `input`, `@ecomcn/price-tag`, `@ecomcn/variant-swatches`

### `product-details-accordion` · component · effort 1
Materials, care, shipping and maker sections, first open by default.
- **Design:** triggers use the tracked-out eyebrow; body copy muted at 14px/1.7.
- **Hard part:** render all panels in the DOM for SEO even when collapsed.
- Composes: `accordion`

### `review-summary` · block · effort 3
Average score, star distribution histogram, fit slider, review list with
verified badges.
- **Design:** the average is set in the display serif at 60px — the number is
  the headline, not a label.
- **Hard part:** histogram bars must be buttons that filter the list, and the fit
  slider needs a text equivalent.
- Composes: `progress`, `button`

### `related-products` · block · effort 1
Snap-scrolling "pairs well with" rail built from product cards.
- **Design:** reuses the exact product card — never build a second, smaller card.
- **Hard part:** lazy-load below the fold; this rail is pure LCP tax otherwise.
- Composes: `carousel`, `@ecomcn/product-card`

---

## Stage 4 — Cart & checkout

Pure friction removal. Every element either reduces doubt or gets cut.

### `cart-line-item` · component · effort 2
Thumbnail, variant line, quantity stepper, line total, save-for-later, remove.
- **Design:** line total right-aligned and tabular so a column stacks into a
  readable ledger.
- **Hard part:** removal needs an *undo*, not a confirm dialog. Quantity changes
  must debounce before hitting the cart API.
- Composes: `button`, `input`

### `cart-sheet` · block · effort 2
Slide-over mini cart with scrollable lines, sticky subtotal footer, empty state.
- **Design:** header, body and footer are ruled bands; the body is the only
  scroller.
- **Hard part:** focus trapping, restoring focus to the bag trigger on close, and
  not remounting on every cart mutation.
- Composes: `sheet`, `button`, `scroll-area`, `@ecomcn/cart-line-item`

### `order-summary` · block · effort 3
Free-shipping progress, promo code with applied state, itemised totals, CTA.
- **Design:** total set in the display serif at 30px against a heavy rule — the
  only thing in the panel that shouts.
- **Hard part:** tax and shipping are estimates until an address exists. Say so,
  or you generate support tickets.
- Composes: `input`, `button`, `progress`

### `checkout-stepper` · component · effort 1
Four-step progress rail with done / active / pending states.
- **Design:** equal-width ruled cells edge to edge — a rail, not floating pills.
- **Hard part:** completed steps must be clickable to go back; pending ones must
  not be. Use `aria-current="step"`.
- Composes: nothing

### `payment-selector` · block · effort 3
Radio cards for card / wallet / pay-in-3 that expand to reveal matching fields.
- **Design:** the selected option's border darkens and the field block joins it
  with a shared border — one object, not two.
- **Hard part:** **never take raw PAN.** This is a presentation shell for Stripe
  Elements or equivalent; ship it wired to a provider slot.
- Composes: `radio-group`, `input`, `label`

### `address-form` · block · effort 3
Country-aware address fields with autocomplete slot and save-as-default.
- **Design:** two columns on desktop, one on mobile; labels above, never
  floating.
- **Hard part:** address shape differs by country. Drive the field set from the
  country code and set `autocomplete` tokens correctly.
- Composes: `form`, `input`, `select`, `checkbox` · npm: `react-hook-form`, `zod`

---

## Stage 5 — Post-purchase

The part almost every component kit skips — and the part that drives repeat
orders.

### `order-confirmation` · block · effort 2
Success banner, order number, delivery address, arrival date, amount paid, next
actions.
- **Design:** the thank-you is 48px display serif on a grained band — the one
  moment in the funnel that earns a flourish.
- **Hard part:** this page is the receipt users screenshot. Make it printable and
  give it a stable permalink.
- Composes: `button`

### `order-tracking` · block · effort 2
Vertical shipment timeline with a live-node ring and carrier status chip.
- **Design:** current node gets a brand ring; completed nodes are solid ink;
  pending are border-grey.
- **Hard part:** carrier webhooks arrive out of order — sort by event time, not
  arrival time.
- Composes: `badge`

---

## After v1

| Release | Blocks |
| --- | --- |
| **v1.1 — Merchandising** | `bundle-builder` · `recently-viewed` · `trust-badges-row` · `newsletter-capture` · `back-in-stock-form` · `gift-card-block` |
| **v1.2 — Account** | `order-history-list` · `wishlist-grid` · `returns-request-flow` · `subscription-manager` · `saved-addresses` · `loyalty-tier-card` |
| **v1.3 — Ops surfaces** | `admin-orders-table` · `inventory-editor` · `product-form` · `discount-builder` · `sales-stat-row` · `fulfilment-queue` |
| **v1.4 — Theming** | `theme-editorial` (default) · `theme-utility` (dense B2B) · `theme-boutique` (soft DTC) |
