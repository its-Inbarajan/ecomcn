# ecomcn development plan

**Capacity:** ~5 hrs/week — two evenings of roughly 2.5 hrs.
**v1.0 ships when the funnel is complete**, not when the catalogue is.

---

## The constraint that shapes everything

At two evenings a week, the scarce resource is not total hours — it is
*continuity*. A block left half-built on Tuesday costs most of Thursday just
reloading the context. So the whole plan is built on one rule:

> **Every unit of work finishes in one evening.**

A block that cannot be finished in ~2.5 hrs is split at a seam that leaves the
repo green — usually "component + states" one evening, "demo + docs page" the
next. Nothing is left broken overnight. `main` is always installable.

The second rule follows from the first: **the docs page is part of the block,
not a later pass.** The route already exists, so a block costs one extra
20-minute demo. Batching docs "for later" is how registries end up with
twenty-seven undocumented components.

---

## Where things stand

_Updated early October 2026._

| | |
| --- | --- |
| Shipped (21 items) | Browse: `product-card`, `product-grid`, `sort-toolbar`, `filter-panel`, `filter-sheet`, `load-more`, `product-quick-view`, `empty-results` · Product: `product-gallery`, `price-tag`, `product-details-accordion`, `size-guide-dialog`, `variant-swatches`, `product-buy-box`, `review-summary`, `related-products` · Cart: `cart-line-item`, `cart-sheet`, `order-summary`, `checkout-stepper` · Theme: `theme-editorial` |
| Milestones | M0, M1 and M1.5 done · M2 (Product) and M3 (Cart) **done** · **M4 (Launch) next** |
| v1.0 | 18 blocks (16 planned + `load-more` and `product-quick-view` from M1.5) — **all 18 shipped**; `review-summary` and `related-products` shipped ahead of plan |
| Site | landing page with live demo, `/blocks` catalogue, `/blocks/[slug]` docs, `/examples` (listing page, product page), the `/demo` store, `/preview/[slug]`; Unsplash photos, favicon set, social card |
| CI | validate → lint → typecheck → build → install-test (Base UI + Radix); `develop` protected by a ruleset |
| Installable by a stranger | **Yes** — listed in the shadcn Registry Directory ([shadcn-ui/ui#12025](https://github.com/shadcn-ui/ui/pull/12025)), so `npx shadcn@latest add @ecomcn/<block>` needs no setup |

M0 is closed: `v0.1.0` is tagged, and the install counter is live (`/api/installs`).

---

## Milestone 0 — Make it real (2 evenings, this week)

Nothing else matters until someone who is not you can install a block.

**Evening 1 — land the pending work**
- [ ] Commit the working-tree changes (CI fix, eslint pin, lint rules, docs)
- [ ] PR into `develop`, confirm CI goes green — this is the first real run of
      `test:install`, and it is the one that proves the registry works
- [ ] Merge to `main`, tag `v0.1.0`

**Evening 1 — done.** Committed, CI green, deployed to
<https://ecomcn.vercel.app>. `/r/registry.json` serves all five items with
content; targets are correct.

**Evening 2 — the two things still blocking a stranger**

- [x] **Make the repo public.** `github.com/its-Inbarajan/ecomcn` returns 404,
      so `npx shadcn add its-Inbarajan/ecomcn/product-card` cannot work for
      anyone, and the shadcn directory requires "open source and publicly
      accessible". One setting, and nothing downstream works without it.
- [x] Install commands now show namespace registration as step 1 — without it
      `product-card` and `product-grid` fail, because the CLI never adds a
      registry on its own.
- [x] `registry.json` `homepage` corrected to the live origin.
- [x] Run the real install into a scratch app: register the namespace, then
      `npx shadcn@latest add @ecomcn/product-grid` — the deepest dependency
      chain in the registry (`product-grid` → `product-card` → `price-tag`).
- [ ] Tag `v0.1.0` so installs can pin. CHANGELOG cut; tagging steps in
      `PUBLISHING.md`.
- [x] Add an install counter on the JSON route — the metric starts now or it
      starts never. Built as `src/proxy.ts` + Upstash; counts once connected.

**Branching.** Vercel builds `develop` as production and there is no `main`.
That works, but note the coupling: **whatever GitHub calls the default branch
is what `owner/repo/item` resolves to** for registry installs. Either make
`develop` the explicit default on GitHub, or create `main` and promote to it —
just be deliberate, because it is part of your public API. Tags are the only
pinning mechanism either way.

**Done when:** a stranger runs two commands and gets a working product grid.

---

## Milestone 1 — Browse complete (7 evenings · ~4 weeks) — **done**

All four blocks shipped with docs pages, Usage sections and a composed
[`/examples/listing-page`](https://ecomcn.vercel.app/examples/listing-page).
The install test now compiles every block against both Base UI and Radix, and
`pnpm registry:check` enforces the directory requirements in CI.

The listing page is where most of a store's revenue is decided, and you already
have `product-grid` for these to slot into.

| Block | Evenings | Why it is that long |
| --- | --- | --- |
| `sort-toolbar` | 1 | Select + density toggle + `aria-live` count |
| `empty-results` | 1 | Small, but it is the one every kit gets wrong |
| `filter-panel` | 3 | URL-driven state is the real work, not the UI |
| `filter-sheet` | 2 | Staged changes, apply-on-close, focus return |

**Split points:** `filter-panel` is evening 1 facets UI, evening 2 URL sync,
evening 3 demo + docs page. `filter-sheet` is evening 1 sheet + staging,
evening 2 demo + docs.

**Done when:** a listing page can be built from ecomcn alone — grid, sort,
filters on desktop and mobile, and a useful empty state.

---

## Milestone 1.5 — Composition & motion (4 evenings) — **done**

Added between M1 and M2 so the Product milestone starts on the right API.

| Work | Result |
| --- | --- |
| Compound `filter-panel` and `product-card` | Strict context hooks (`useFilterPanel`, `useProductCard`), flat part exports, one-tag default kept |
| `load-more` | Button / hybrid / infinite, focus to the first new item, `?page=` depth |
| `product-quick-view` | Motion `layoutId` morph from card to native `<dialog>`; the one `motion` dependency |

**Carry into M2:** design `product-buy-box` compound from the start — gallery,
swatches, price and add-to-bag all read the selected variant from one context.

---

## Milestone 2 — Product complete (10 evenings · ~5 weeks) — **done**

Every Product block shipped, composed into
[`/examples/product-page`](https://ecomcn.vercel.app/examples/product-page):
the gallery reads the buy box's selected colour from its context.

The detail page. `product-buy-box` is the flagship — the block people
screenshot — so it gets built last here, once its dependencies exist.

| Block | Evenings | Notes |
| --- | --- | --- |
| `product-details-accordion` | 1 | **Done** — summary line per row keeps closed content findable |
| `size-guide-dialog` | 1 | **Done** — pinned size column, sideways scroll inside the dialog |
| `variant-swatches` | 3 | **Done** — struck through, never disabled; sold-out picks feed a notify-me |
| `product-gallery` | 3 | **Done** — swipe, hover-zoom, full screen from the photo; photo 2 preloads |
| `product-buy-box` | 2 | **Done** — optimistic add with rollback; delivery as a date range |

**Done when:** a PDP can be assembled end to end, and the landing-page demo can
show a real product page instead of three cards.

---

## Milestone 3 — Cart complete (5 evenings · ~3 weeks) — **done**

The demo store runs listing → product → mini cart → bag → checkout stepper
on nothing but ecomcn blocks.

| Block | Evenings | Notes |
| --- | --- | --- |
| `cart-line-item` | 2 | **Done** — undo window, debounced quantity, rollback on reject |
| `cart-sheet` | 2 | **Done** — grows from the bag button; subtotal follows the shopper |
| `checkout-stepper` | 1 | **Done** — only done steps go back; the rule slides on |

**Done when:** the landing page demo runs listing → product → cart → summary
with nothing but ecomcn blocks. That is the screenshot that gets shared.

---

## Milestone 4 — Launch v1.0 (5 evenings · ~3 weeks)

| Evening | Work |
| --- | --- |
| 1 | `opengraph-image.tsx` — a link preview showing four real blocks |
| 2 | README screenshot grid; rewrite the pitch now that 16 blocks exist |
| 3 | Full pass: every docs page has a demo that exercises its states |
| 4 | Tag `v1.0.0`; submit to `registry.directory` and `awesome-shadcn-ui` |
| 5 | Post one build-in-public thread showing **three** blocks, not eighteen |

Done early: the social card (a static `opengraph-image.png` rather than
evening 1's generated one) and the `directory.json` PR — merged in
September 2026, long before v1.0.

**v1.0 = 18 blocks**, funnel-complete from listing to cart.

---

## Milestone 5 — Checkout, v1.1 (7 evenings · ~4 weeks)

`address-form` and `payment-selector` were kept out of v1.0 on purpose (see
*Deferred on purpose*): most stores hand payment to Stripe Elements, Shopify
checkout or a PSP's hosted page and throw a custom payment UI away. So they
ship in v1.1, after the launch, and only as **presentation shells**: ecomcn
owns the layout, the selection, the states and the motion; your payment
provider owns every field that touches a card.

| Block | Evenings | Notes |
| --- | --- | --- |
| `address-form` | 3 | Country-driven fields and `autocomplete` tokens; validation is a pure function, not a form library |
| `payment-selector` | 3 | Radio cards with a provider slot; never renders a card-number field |
| Demo store checkout | 1 | The stepper's Details, Delivery and Payment steps, on these two blocks and a mock provider |

**Split points:** `address-form` is evening 1 the country format table and
`validateAddress`, evening 2 the fields, autocomplete tokens and the
country-change morph, evening 3 demo + docs. `payment-selector` is evening 1
the radio cards and panel morph, evening 2 the provider slot (kept mounted)
and unavailable / instalment states, evening 3 demo + docs.

**Done when:** the demo store runs bag → details → delivery → payment on
nothing but ecomcn blocks, with a mock provider in the payment slot — and no
block has a field that could hold a card number.

**Before starting:** check that shadcn's `field` component ships for both
bases; if it does, the address form composes it rather than hand-rolled
label/description/error markup.

---

## Timeline

| Milestone | Evenings | Elapsed |
| --- | --- | --- |
| M0 — Make it real | 2 | Week 1 — done |
| M1 — Browse | 7 | Weeks 2–5 — done |
| M1.5 — Composition & motion | 4 | done |
| M2 — Product | 10 | done, early October |
| M3 — Cart | 5 | done, October |
| M4 — Launch v1.0 | 4 (social card and directory done early) | next |
| M5 — Checkout, v1.1 | 7 | after the launch |

**From here:** 4 evenings to v1.0 — about two weeks at two evenings a week —
then 7 for v1.1's checkout, about four more. M2 and M3 ran well ahead of the
original plan, which had v1.0 in December.

---

## Deferred on purpose

**Checkout internals — `address-form`, `payment-selector`.**
Deliberately out of v1.0. Most stores put Stripe Elements, Shopify checkout or
a PSP's hosted page here and throw a custom payment UI away, so building them
before the launch is the worst trade in the catalogue. They are planned as
**Milestone 5 (v1.1)**: presentation shells with a provider slot, specified in
`BLOCK-CATALOG.md`. Until then the demo store's checkout stops after the bag,
and says why.

**Discovery stage — `hero-editorial`, `category-rail`, `collection-grid`,
`announcement-bar`, `lookbook-strip`.** Beautiful, and the least differentiated
thing here — every UI kit ships a hero. The funnel blocks are what nobody else
has.

**`order-tracking`, `order-confirmation`.**
Real value, not on the critical path to "a store works." (`review-summary` and
`related-products` were deferred here too, and shipped early in October.)

**Additional themes — `theme-utility`, `theme-boutique`.** Worth a lot for the
docs site's theme switcher, worth nothing until there are blocks to skin.

---

## Definition of done, per block

An evening's work is finished only when all of these are true. This is the
checklist that keeps quality from drifting when the sessions are far apart.

- [ ] One folder under `src/registry/ecomcn/<slug>/` with its own `registry.json`
- [ ] Path added to the root `registry.json` `include` array
- [ ] `registryDependencies` lists **every** primitive the block imports
- [ ] `target` puts files under `components/ecomcn/…`
- [ ] Takes `currency` / `locale` props if it renders money
- [ ] Takes data as props — no `fetch`, no app-level provider. Shared state
      between a block's own parts lives in a context the block's root renders
      (CONTRIBUTING rule 9)
- [ ] Spreads rest props, merges `className` with `cn()`
- [ ] No state signalled by colour alone
- [ ] Every hover affordance has a `focus-visible` path
- [ ] Loading and empty states in the same file
- [ ] No `next/*` import (CI enforces this)
- [ ] Demo added to `src/demos/index.tsx`, exercising the states
- [ ] `case` added to `/preview/[slug]`
- [ ] Entry in `src/lib/blocks.ts` flipped to `shipped`, with a design note and
      a hard part
- [ ] `pnpm lint && pnpm typecheck && pnpm build` green
- [ ] `CHANGELOG.md` updated

---

## Weekly cadence

**Evening A — build.** One block, or one split half of one. Start by running
`pnpm dev` and opening the docs page you are about to fill; it makes the target
concrete.

**Evening B — finish and ship.** Demo, docs page, DoD checklist, PR, merge.
Never start a new block on Evening B — a block begun at 9pm on the second
evening is a block you will rewrite.

**If a week gets eaten by client work**, skip Evening A, not Evening B. Landing
what is already half-built beats starting something new.

---

## Risks

| Risk | Signal | Response |
| --- | --- | --- |
| Client work eats the schedule | Two skipped weeks | Cut M2 to the buy-box path; ship 13 blocks as v1.0 |
| `filter-panel` overruns | Not done in 3 evenings | Ship it with React state, file an issue for URL sync — the API does not change |
| shadcn CLI changes under you | CI red on an untouched PR | The install test catches it; pin `shadcn` in devDependencies rather than tracking latest |
| Scope creep into a full storefront | The demo store grows features no block has | The registry is the product. `/demo` (October 2026) exists because visitors read block by block and never opened the examples — it composes shipped blocks and nothing else. Its bag lines are site markup only until `cart-line-item` ships; no accounts, payments or search |
| Nobody installs it | No traffic after launch | Expected at first. The fix is one good build-in-public thread per shipped stage, not more blocks |

---

## The metric that matters

Not stars. **Installs you did not perform yourself.**

Add a privacy-respecting counter on the JSON route at M0 so you have data from
day one. In every registry that has grown, one or two items carry the whole
project. Find yours by week 6 and make them excellent before broadening.
