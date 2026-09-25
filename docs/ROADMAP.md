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

| | |
| --- | --- |
| Shipped | `price-tag`, `product-card`, `product-grid`, `order-summary`, `theme-editorial` |
| Specified | 23 more blocks across five funnel stages |
| Site | marketing page, `/blocks` catalogue, `/blocks/[slug]` docs, `/preview/[slug]` |
| CI | validate → lint → typecheck → build → install-test |
| Installable by a stranger | **Not yet** — no deploy, no tag |

That last row is the whole of Milestone 0.

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
- [ ] Tag `v0.1.0` so installs can pin.
- [ ] Add an install counter on the JSON route — the metric starts now or it
      starts never.

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

## Milestone 2 — Product complete (10 evenings · ~5 weeks)

The detail page. `product-buy-box` is the flagship — the block people
screenshot — so it gets built last here, once its dependencies exist.

| Block | Evenings | Notes |
| --- | --- | --- |
| `product-details-accordion` | 1 | Cheap win; all panels in the DOM for SEO |
| `size-guide-dialog` | 1 | Table with scroll containment |
| `variant-swatches` | 3 | Out-of-stock without colour alone; stays focusable |
| `product-gallery` | 3 | Swipe, hover-zoom, `aria-current`, preload only image 2 |
| `product-buy-box` | 2 | Composes the three above + `price-tag` |

**Done when:** a PDP can be assembled end to end, and the landing-page demo can
show a real product page instead of three cards.

---

## Milestone 3 — Cart complete (5 evenings · ~3 weeks)

| Block | Evenings | Notes |
| --- | --- | --- |
| `cart-line-item` | 2 | Remove needs *undo*, not a confirm dialog |
| `cart-sheet` | 2 | Focus trap, restore focus on close, no remount per mutation |
| `checkout-stepper` | 1 | `aria-current="step"`; completed steps clickable |

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
| 5 | Open the `directory.json` PR against `shadcn-ui/ui`; post one build-in-public thread showing **three** blocks, not sixteen |

**v1.0 = 16 blocks**, funnel-complete from listing to cart.

---

## Timeline

| Milestone | Evenings | Elapsed |
| --- | --- | --- |
| M0 — Make it real | 2 | Week 1 |
| M1 — Browse | 7 | Weeks 2–5 |
| M2 — Product | 10 | Weeks 6–10 |
| M3 — Cart | 5 | Weeks 11–13 |
| M4 — Launch | 5 | Weeks 14–15 |
| **Total** | **29** | **~15 weeks** |

Roughly **mid-January** from a late-September start. That is the honest number
at 5 hrs/week, and it already assumes no missed weeks — so plan for late
January and be pleased if it slips early.

**If that is too long**, the lever is Milestone 2: ship `product-buy-box` with
`variant-swatches` but defer `product-gallery` to v1.1 (adopters have an image
carousel already). That cuts 3 evenings and ~2 weeks.

---

## Deferred on purpose

**Checkout internals — `address-form`, `payment-selector` (6 evenings).**
Deliberately out of v1.0. Most stores put Stripe Elements, Shopify checkout or
a PSP's hosted page here and throw a custom payment UI away. Six evenings on
the blocks most likely to be discarded is the worst trade in the catalogue.
They land in v1.1 as presentation shells with a provider slot.

**Discovery stage — `hero-editorial`, `category-rail`, `collection-grid`,
`announcement-bar`, `lookbook-strip`.** Beautiful, and the least differentiated
thing here — every UI kit ships a hero. The funnel blocks are what nobody else
has.

**`review-summary`, `related-products`, `order-tracking`, `order-confirmation`.**
Real value, not on the critical path to "a store works."

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
| Scope creep into a full storefront | "We should add a demo store" | The registry is the product. A demo store is a v2 conversation |
| Nobody installs it | No traffic after launch | Expected at first. The fix is one good build-in-public thread per shipped stage, not more blocks |

---

## The metric that matters

Not stars. **Installs you did not perform yourself.**

Add a privacy-respecting counter on the JSON route at M0 so you have data from
day one. In every registry that has grown, one or two items carry the whole
project. Find yours by week 6 and make them excellent before broadening.
