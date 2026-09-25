<div align="center">

# ecomcn

**The e-commerce blocks shadcn/ui doesn't ship.**

Buy boxes, faceted filters, cart sheets, order summaries — installed the same
way you install a button.

[Blocks](#the-v1-catalogue) · [Install](#install) · [Design rules](docs/DESIGN.md) · [Publishing](docs/PUBLISHING.md) · [Contributing](CONTRIBUTING.md)

</div>

---

shadcn/ui gives you ~40 primitives and a handful of dashboard blocks. It has
never shipped a buy box, a faceted filter panel, or an order summary — the three
things every store rebuilds from scratch. ecomcn fills exactly that gap.

Blocks are organised by **the decision a buyer is making**, not by widget type.
That's why you can find what you need by the problem you have.

## Install

**Step 1 — register the namespace, once per project.** This is not optional:
the shadcn CLI never adds a registry on its own, so a block that pulls another
ecomcn block cannot resolve it until `@ecomcn` exists in your
`components.json`.

```bash
npx shadcn@latest registry add @ecomcn=https://ecomcn.vercel.app/r/{name}.json
```

`{name}` is literal — the CLI substitutes the item name.

**Step 2 — add blocks by name.**

```bash
npx shadcn@latest add @ecomcn/product-card
npx shadcn@latest add @ecomcn/order-summary
npx shadcn@latest list @ecomcn
```

Blocks with no ecomcn dependencies — `price-tag`, `order-summary`,
`theme-editorial` — also install straight from a URL with no setup:

```bash
npx shadcn@latest add https://ecomcn.vercel.app/r/price-tag.json
```

Start with the house theme if you want the look from the screenshots:

```bash
npx shadcn@latest add @ecomcn/theme-editorial
```

## What you get

- **Zero runtime dependencies** beyond `lucide-react` where icons are used —
  `product-quick-view` is the one opt-in exception, for `motion`
- **`Intl.NumberFormat` pricing** with `currency` and `locale` props on every
  money-rendering block
- **Loading, empty, out-of-stock and error states** shipped in the same file
- **Keyboard paths for every hover affordance**, and no colour-only state
- **Source you own** — no provider, no config object, no API to fight

## The v1 catalogue

29 blocks across five funnel stages. Full spec with per-block design notes and
the hard parts: [`docs/BLOCK-CATALOG.md`](docs/BLOCK-CATALOG.md).

| Stage               | Blocks                                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discover**        | `announcement-bar` · `hero-editorial` · `category-rail` · `collection-grid` · `lookbook-strip`                                                                       |
| **Browse**          | `product-card` · `product-grid` · `filter-panel` · `filter-sheet` · `sort-toolbar` · `empty-results` · `load-more` · `product-quick-view`                            |
| **Product**         | `product-gallery` · `price-tag` · `variant-swatches` · `size-guide-dialog` · `product-buy-box` · `product-details-accordion` · `review-summary` · `related-products` |
| **Cart & checkout** | `cart-line-item` · `cart-sheet` · `order-summary` · `checkout-stepper` · `payment-selector` · `address-form`                                                         |
| **Post-purchase**   | `order-confirmation` · `order-tracking`                                                                                                                              |

Shipped so far: the whole **Browse** stage — `product-card`, `product-grid`,
`filter-panel`, `filter-sheet`, `sort-toolbar`, `empty-results`, `load-more` and
`product-quick-view` — plus
`price-tag`, `order-summary` and `theme-editorial`. See them composed into one
listing page at <https://ecomcn.vercel.app/examples/listing-page>.

## Repo layout

```
registry.json                       root catalogue (include-based)
src/registry/ecomcn/<block>/
  registry.json                     one item file per block
  <block>.tsx                       the source that gets copied
src/lib/utils.ts                    cn()
scripts/verify-install.mjs          installs every block into clean Base UI + Radix apps
scripts/check-registry.mjs          the Registry Directory requirements, as checks
docs/                               catalogue, design rules, publishing guide
.github/workflows/registry.yml      validate → build → typecheck → install test
```

## Develop

```bash
pnpm install
pnpm registry:validate     # schema, duplicate names, include paths, missing files
pnpm registry:build        # emits public/r/*.json
pnpm registry:check        # rebuilds public/r, then checks the directory requirements
pnpm dev                   # site + docs; re-syncs the registry mirrors on every change
pnpm test:install          # installs everything into a throwaway app and compiles
```

Then install into a scratch project and see what an adopter sees:

```bash
npx shadcn@latest add https://localhost:3000/r/product-card.json
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) — especially the six rules. Open a
**New block proposal** issue before writing code.

## Licence

MIT. Anything more restrictive and teams won't clear it with legal, which
defeats the point.

The product photos on the docs site are free [Unsplash](https://unsplash.com)
photos, used under the [Unsplash License](https://unsplash.com/license) and
loaded from Unsplash's CDN. They are not in this repo, not in any registry
item, and not covered by the MIT licence.
