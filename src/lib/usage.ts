/**
 * Usage snippets for the docs pages. Kept apart from blocks.ts because they
 * are long, and apart from the registry because adopters install the block,
 * not our documentation of it. Paths match what `shadcn add` writes.
 */

export type UsageSnippet = { label: string; code: string };

const FACETS = `import type { FilterFacet } from "@/lib/filter-params"

// Module scope (or useMemo): the hook parses the URL against these ids and bounds.
export const facets: FilterFacet[] = [
  {
    id: "category",
    label: "Category",
    type: "list",
    options: [
      { value: "lighting", label: "Lighting", count: 12 },
      { value: "seating", label: "Seating", count: 8 },
    ],
  },
  { id: "price", label: "Price", type: "range", min: 0, max: 500, step: 10, format: "currency" },
  {
    id: "color",
    label: "Colour",
    type: "swatch",
    options: [{ value: "sage", label: "Sage", swatch: "#7d8b7a", count: 4 }],
  },
  { id: "in_stock", label: "In stock only", type: "toggle" },
]`;

export const USAGE: Record<string, UsageSnippet[]> = {
  "filter-panel": [
    { label: "lib/facets.ts", code: FACETS },
    {
      label: "components/shop-filters.tsx",
      code: `"use client"

import { FilterPanel } from "@/components/ecomcn/filter-panel"
import { useFilterParams } from "@/hooks/use-filter-params"
import { facets } from "@/lib/facets"

export function ShopFilters() {
  // useState, except the state is the URL: ?category=lighting&price=40-200
  const [filters, setFilters] = useFilterParams(facets)

  return <FilterPanel facets={facets} value={filters} onValueChange={setFilters} />
}`,
    },
    {
      label: "Your own layout — compound parts, in any order",
      code: `import {
  FilterPanel,
  FilterPanelChips,
  FilterPanelFacet,
  FilterPanelHeader,
  useFilterPanel,
} from "@/components/ecomcn/filter-panel"

<FilterPanel facets={facets} value={filters} onValueChange={setFilters}>
  <FilterPanelHeader />
  <FilterPanelFacet id="price" />
  <SaleOnly />                      {/* your own part, below */}
  <FilterPanelFacet id="color" defaultOpen={false} />
  <FilterPanelChips />
</FilterPanel>

// Any component inside the panel can read and set the same state.
// Outside a <FilterPanel>, useFilterPanel() throws instead of returning undefined.
function SaleOnly() {
  const { value, setValue } = useFilterPanel()
  const on = value.sale === true
  return (
    <button aria-pressed={on} onClick={() => setValue({ ...value, sale: on ? undefined : true })}>
      Sale only
    </button>
  )
}`,
    },
    {
      label: "app/shop/page.tsx — the same parser, on the server",
      code: `import { parseFilterParams } from "@/lib/filter-params"
import { facets } from "@/lib/facets"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseFilterParams(await searchParams, facets)
  const products = await getProducts(filters) // your data layer
  // ...
}`,
    },
    {
      label: "Server-rendered results? Hand the hook your router",
      code: `// Next.js: useSearchParams needs a <Suspense> boundary above this component.
const router = useRouter()
const searchParams = useSearchParams()

const [filters, setFilters] = useFilterParams(facets, {
  searchParams,
  navigate: (href) => router.push(href, { scroll: false }),
})`,
    },
  ],
  "filter-sheet": [
    {
      label: "components/mobile-filters.tsx",
      code: `"use client"

import { FilterSheet } from "@/components/ecomcn/filter-sheet"
import { useFilterParams } from "@/hooks/use-filter-params"
import { facets } from "@/lib/facets"
import type { FilterState } from "@/lib/filter-params"

export function MobileFilters({ countFor }: { countFor: (f: FilterState) => number }) {
  const [filters, setFilters] = useFilterParams(facets)

  return (
    <FilterSheet
      facets={facets}
      value={filters}
      // Called once, when the sheet applies — not on every tap inside it.
      onValueChange={setFilters}
      getResultCount={countFor}
    />
  )
}`,
    },
    {
      label: "Same custom layout, staged",
      code: `// Children are FilterPanel parts. They render inside a panel holding the
// *staged* value, so nothing reaches the URL until the sheet applies.
<FilterSheet facets={facets} value={filters} onValueChange={setFilters}>
  <FilterPanelChips />
  <FilterPanelFacet id="price" />
  <FilterPanelFacet id="color" />
</FilterSheet>`,
    },
    {
      label: "Counting needs a request? Stage, fetch, pass it back",
      code: `const [count, setCount] = React.useState<number>()

<FilterSheet
  facets={facets}
  value={filters}
  onValueChange={setFilters}
  onStagedChange={async (staged) => setCount(await fetchCount(staged))}
  resultCount={count}
/>`,
    },
  ],
  "sort-toolbar": [
    {
      label: "Above the grid",
      code: `import { SortToolbar } from "@/components/ecomcn/sort-toolbar"
import { FilterSheet } from "@/components/ecomcn/filter-sheet"

<SortToolbar
  total={products.length}
  loading={isFetching}   // nothing is announced until results settle
  sort={sort}
  onSortChange={setSort}
  density={density}
  onDensityChange={setDensity}
  // Rendered below lg only, where the sidebar panel is hidden.
  filters={<FilterSheet facets={facets} value={filters} onValueChange={setFilters} />}
/>`,
    },
  ],
  "product-card": [
    {
      label: "One tag",
      code: `import { ProductCard } from "@/components/ecomcn/product-card"

<ProductCard
  product={{
    id: "p1",
    name: "Field Tote 24L",
    href: "/products/field-tote",
    price: 195,
    compareAt: 240,
    image: <img src="/tote.jpg" alt="" className="size-full object-cover" />,
    colors: [
      // Each colourway can carry its own image; the swatch swaps it.
      { name: "Olive", hex: "#5d6446", image: <img src="/tote-olive.jpg" alt="" /> },
      { name: "Black", hex: "#1c1b1a", image: <img src="/tote-black.jpg" alt="" /> },
    ],
  }}
  onQuickAdd={(product, colorIndex) => addToBag(product.id, colorIndex)}
/>`,
    },
    {
      label: "Composed from parts",
      code: `import {
  ProductCard,
  ProductCardBody,
  ProductCardImage,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardQuickAdd,
  ProductCardSwatches,
  ProductCardTitle,
  useProductCard,
} from "@/components/ecomcn/product-card"

<ProductCard product={product} onQuickAdd={add}>
  <ProductCardMedia>
    <ProductCardImage />
    <ProductCardQuickAdd />
  </ProductCardMedia>
  <ProductCardBody>
    <ProductCardTitle />
    <LowStock />
    <ProductCardSwatches />
    <ProductCardPrice />
  </ProductCardBody>
</ProductCard>

// Parts share the card's state — the product, the selected colour, quick-add.
function LowStock() {
  const { color } = useProductCard()
  return color?.name === "Olive" ? <p className="text-xs">Only 2 left in Olive</p> : null
}`,
    },
  ],
  "product-grid": [
    {
      label: "Composed cards, more on the way",
      code: `<ProductGrid
  id="results"                       // LoadMore moves focus into this list
  products={products}
  loading={isFetchingFirstPage}      // full skeleton grid
  loadingMore={isFetchingNextPage}   // skeletons appended after the products
  loadingMoreCount={24}
  renderCard={(product) => (
    <ProductCard product={product}>
      <ProductCardMedia />
      <ProductCardBody />
    </ProductCard>
  )}
/>`,
    },
  ],
  "load-more": [
    {
      label: "With TanStack Query's useInfiniteQuery",
      code: `import { LoadMore } from "@/components/ecomcn/load-more"
import { ProductGrid } from "@/components/ecomcn/product-grid"

const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } =
  useInfiniteQuery({ queryKey: ["products", filters], queryFn, getNextPageParam, initialPageParam: 1 })
const products = data?.pages.flatMap((page) => page.items) ?? []

<ProductGrid id="results" products={products} loadingMore={isFetchingNextPage} />
<LoadMore
  controls="results"            // focus lands on the first new product
  shown={products.length}
  total={data?.pages[0].total}
  hasMore={hasNextPage}
  loading={isFetchingNextPage}
  error={isError ? "Couldn't load more products." : null}
  mode="hybrid"                 // first page on click, the rest on approach
  onLoadMore={() => fetchNextPage()}
/>`,
    },
    {
      label: "Keep the depth in the URL",
      code: `// ?page=3 means pages 1–3 are on screen, so reload and Back restore them.
// Use replaceState: loading more is not something Back should undo.
// useFilterParams already drops "page" whenever a filter changes.
const page = Number(new URLSearchParams(location.search).get("page") ?? 1)`,
    },
  ],
  "product-quick-view": [
    {
      label: "A listing with quick view",
      code: `import {
  ProductQuickView,
  ProductQuickViewImage,
  ProductQuickViewTrigger,
} from "@/components/ecomcn/product-quick-view"
import {
  ProductCard,
  ProductCardBody,
  ProductCardImage,
  ProductCardMedia,
  useProductCard,
} from "@/components/ecomcn/product-card"

<ProductQuickView onAddToBag={(product, colorIndex) => addToBag(product.id, colorIndex)}>
  <ProductGrid
    products={products}
    renderCard={(product) => (
      <ProductCard product={product}>
        <ProductCardMedia>
          <ProductQuickViewImage product={product}>
            <ProductCardImage />          {/* this is what morphs */}
          </ProductQuickViewImage>
          <QuickViewButton />
        </ProductCardMedia>
        <ProductCardBody />
      </ProductCard>
    )}
  />
</ProductQuickView>

// Open on the colour the shopper already picked on the card.
function QuickViewButton() {
  const { product, colorIndex } = useProductCard()
  return <ProductQuickViewTrigger product={product} colorIndex={colorIndex} />
}`,
    },
  ],
  "empty-results": [
    {
      label: "As the grid's empty state",
      code: `import { EmptyResults } from "@/components/ecomcn/empty-results"
import { ProductGrid } from "@/components/ecomcn/product-grid"
import { describeActiveFilters, removeFilter } from "@/lib/filter-params" // from filter-panel

const active = describeActiveFilters(filters, facets)

<ProductGrid
  products={products}
  empty={
    <EmptyResults
      filters={active.map((f) => ({
        id: \`\${f.facetId}:\${f.value ?? ""}\`,
        label: f.label,
        onRemove: () => setFilters(removeFilter(filters, f.facetId, f.value)),
      }))}
      // The single change that brings the most back — ask your search backend.
      suggestion={{ label: "Remove “Up to $50”", count: 4, onApply: widenPrice }}
      onClearAll={() => setFilters({})}
    />
  }
/>`,
    },
  ],
};
