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
  "product-details-accordion": [
    {
      label: "One tag, from your product data",
      code: `import { ProductDetailsAccordion } from "@/components/ecomcn/product-details-accordion"

<ProductDetailsAccordion
  // The first section opens by default; pass defaultOpen to choose.
  sections={[
    { id: "description", title: "Description", summary: "Waxed canvas, 24 litres", content: <p>{product.description}</p> },
    { id: "care", title: "Care", summary: "Spot clean, re-wax yearly", content: <p>{product.care}</p> },
    { id: "shipping", title: "Shipping & returns", summary: "Free over $300 · 30-day returns", content: <ShippingPolicy /> },
  ]}
/>`,
    },
    {
      label: "Composed — sections, a specs list and your own part",
      code: `import {
  ProductDetailsAccordion,
  ProductDetailsSection,
  ProductDetailsSpecs,
  useProductDetailsAccordion,
} from "@/components/ecomcn/product-details-accordion"

<ProductDetailsAccordion defaultOpen={["materials"]}>
  <ExpandAll />
  <ProductDetailsSection id="materials" title="Materials" summary="Organic cotton">
    <ProductDetailsSpecs
      items={[
        ["Body", "18 oz organic cotton canvas"],
        ["Dimensions", "38 × 42 × 14 cm"],
      ]}
    />
  </ProductDetailsSection>
  <ProductDetailsSection id="care" title="Care" summary="Spot clean">
    <p>Brush off dry dirt, then spot clean with a damp cloth.</p>
  </ProductDetailsSection>
</ProductDetailsAccordion>

// Any part inside reads and sets the open sections.
function ExpandAll() {
  const { open, setOpen } = useProductDetailsAccordion()
  return <button onClick={() => setOpen(open.length ? [] : ["materials", "care"])}>Toggle all</button>
}`,
    },
    {
      label: "Keep closed panels in the HTML",
      code: `// By default a closed section's panel is not rendered — its summary line is.
// To have crawlers read every panel, keep them mounted: collapsed and inert.
<ProductDetailsAccordion sections={sections} contentProps={{ forceMount: true }} />  // Radix
<ProductDetailsAccordion sections={sections} contentProps={{ keepMounted: true }} />  // Base UI`,
    },
  ],
  "size-guide-dialog": [
    {
      label: "Beside the size label",
      code: `import { SizeGuideDialog } from "@/components/ecomcn/size-guide-dialog"

<div className="flex items-baseline justify-between">
  <span>Size</span>
  <SizeGuideDialog
    columns={["Chest", "Waist", "Hip"]}
    rows={[
      // Centimetres by default (baseUnit="in" if your data is in inches).
      // A [min, max] pair is a range; a string is shown as-is and never converted.
      { size: "S", values: [[87, 91], [71, 75], [93, 97]] },
      { size: "M", values: [[92, 96], [76, 80], [98, 102]] },
      { size: "L", values: [[97, 102], [81, 86], [103, 108]] },
    ]}
    selectedSize={size}          // marked and announced in the table
    fitNote="Cut close through the chest. Between two sizes, take the larger."
  />
</div>`,
    },
    {
      label: "Composed — your trigger, your layout",
      code: `import {
  SizeGuideContent,
  SizeGuideDialog,
  SizeGuideTable,
  SizeGuideTrigger,
  SizeGuideUnitToggle,
  useSizeGuide,
} from "@/components/ecomcn/size-guide-dialog"

<SizeGuideDialog columns={columns} rows={rows} selectedSize={size} defaultUnit="in">
  <SizeGuideTrigger>Size & fit</SizeGuideTrigger>
  <SizeGuideContent>
    <SizeGuideUnitToggle />
    <SizeGuideTable />
    <HowToMeasure />
  </SizeGuideContent>
</SizeGuideDialog>

// Parts share the unit and the selected size.
function HowToMeasure() {
  const { unit } = useSizeGuide()
  return <p>Measure around the fullest part of the chest, in {unit}.</p>
}`,
    },
  ],
  "price-tag": [
    {
      label: "Anywhere a price appears",
      code: `import { PriceTag } from "@/components/ecomcn/price-tag"

<PriceTag price={195} />
<PriceTag price={195} compareAt={240} />                  // struck-through was-price
<PriceTag price={1240.5} currency="EUR" locale="de-DE" />  // 1.240,50 €
<PriceTag price={128} size="sm" />                         // inline, in a card or a line`,
    },
  ],
  "order-summary": [
    {
      label: "Beside the bag",
      code: `import { OrderSummary } from "@/components/ecomcn/order-summary"

<OrderSummary
  lines={cart.lines}                  // { id, unitPrice, quantity }[]
  freeShippingThreshold={300}         // shows the meter until it's reached
  flatShipping={18}
  taxRate={0.08}
  appliedCode={cart.code}
  discountRate={0.2}
  // Throw to show the message inline under the field.
  onApplyCode={async (code) => { await cart.applyCode(code) }}
  onRemoveCode={() => cart.removeCode()}
  onCheckout={() => router.push("/checkout")}
/>`,
    },
    {
      label: "The same totals, without the panel",
      code: `import { useOrderTotals } from "@/hooks/use-order-totals"

// The panel's arithmetic as a hook — test it, or show a total elsewhere.
const { subtotal, discount, shipping, tax, total, toFreeShipping } = useOrderTotals({
  lines: cart.lines,
  discountRate: 0.2,
  freeShippingThreshold: 300,
  flatShipping: 18,
  taxRate: 0.08,
})`,
    },
  ],
  "cart-line-item": [
    {
      label: "In your bag page",
      code: `import { CartLineItem, type CartLine } from "@/components/ecomcn/cart-line-item"

<ul>
  {lines.map((line) => (
    <CartLineItem
      key={line.id}                // keyed by id: never remount a line mid-undo
      line={line}                  // id, name, image, unitPrice, quantity, variant?, maxQuantity?
      // Called once, after the shopper stops pressing. Throw to put it back.
      onQuantityChange={(quantity) => cart.update(line.id, quantity)}
      // Called after the 5-second undo window. Throw to put the line back.
      onRemove={() => cart.remove(line.id)}
      onSaveForLater={() => cart.saveForLater(line.id)}
    />
  ))}
</ul>`,
    },
  ],
  "cart-sheet": [
    {
      label: "In your header",
      code: `import { CartSheet } from "@/components/ecomcn/cart-sheet"

<CartSheet
  lines={cart.lines}             // CartLine[], as cart-line-item takes
  onQuantityChange={(id, quantity) => cart.update(id, quantity)}
  onRemove={(id) => cart.remove(id)}
  freeShippingThreshold={300}
  onCheckout={() => router.push("/checkout")}
  viewBagHref="/bag"
  empty={<a href="/shop">Continue shopping</a>}
/>`,
    },
    {
      label: "Composed — your trigger, your extras",
      code: `import {
  CartSheet,
  CartSheetContent,
  CartSheetFooter,
  CartSheetLines,
  CartSheetTrigger,
  useCartSheet,
} from "@/components/ecomcn/cart-sheet"

<CartSheet lines={cart.lines} onRemove={(id) => cart.remove(id)}>
  <CartSheetTrigger className="border-0" />
  <CartSheetContent>
    <CartSheetLines />
    <GiftNote />
    <CartSheetFooter />
  </CartSheetContent>
</CartSheet>

function GiftNote() {
  const { subtotal } = useCartSheet()   // follows the lines as the shopper edits them
  return subtotal > 100 ? <p>Free gift wrap on this order.</p> : null
}`,
    },
  ],
  "delivery-options": [
    {
      label: "Rates for the address",
      code: `import { DeliveryOptions, type DeliveryOption } from "@/components/ecomcn/delivery-options"

const options: DeliveryOption[] = [
  // Business days from dispatch; dispatch is today before the cut-off (shopper's clock).
  { id: "standard", label: "Standard", price: 0, minDays: 3, maxDays: 5, cutoffHour: 15 },
  { id: "express", label: "Express", price: 25, minDays: 1, maxDays: 1, cutoffHour: 14 },
  { id: "courier", label: "Same-day courier", price: 35, minDays: 0, maxDays: 0,
    available: false, unavailableReason: "Not available for this postcode" },
]

<DeliveryOptions
  options={options}
  value={method}
  onValueChange={setMethod}
  loading={ratesLoading}              // skeleton rows while you fetch rates for the address
/>`,
    },
  ],
  "payment-selector": [
    {
      label: "With Stripe’s Payment Element in the card panel",
      code: `import { PaymentSelector, type PaymentMethod } from "@/components/ecomcn/payment-selector"
import { PaymentElement } from "@stripe/react-stripe-js"

const methods: PaymentMethod[] = [
  { id: "card", label: "Card", kind: "card", description: "Visa, Mastercard, Amex" },
  { id: "apple-pay", label: "Apple Pay", kind: "wallet",
    available: canUseApplePay, unavailableReason: "Needs Safari on an Apple device" },
  { id: "pay-in-3", label: "Pay in 3", kind: "bnpl", instalments: 3 },
]

<PaymentSelector
  methods={methods}
  value={method}
  onValueChange={setMethod}
  total={order.total}                 // "3 payments of $259.20"
  error={paymentError}                // shown in the open panel
  // The provider slot. Panels stay mounted once opened, so the iframe
  // keeps a half-typed card while the shopper looks at another method.
  renderPanel={(m) => (m.id === "card" ? <PaymentElement /> : null)}
/>`,
    },
    {
      label: "Composed — your own row content",
      code: `import { PaymentSelector, PaymentSelectorMethod, usePaymentSelector } from "@/components/ecomcn/payment-selector"

<PaymentSelector methods={methods} value={method} onValueChange={setMethod} renderPanel={renderPanel}>
  {methods.map((m) => (
    <PaymentSelectorMethod key={m.id} method={m}>
      {m.kind === "bnpl" ? <InstalmentBadge /> : null}
    </PaymentSelectorMethod>
  ))}
</PaymentSelector>

function InstalmentBadge() {
  const { formatMoney } = usePaymentSelector()
  return <span className="text-xs">from {formatMoney(30)}/mo</span>
}`,
    },
  ],
  "announcement-bar": [
    {
      label: "At the top of your layout",
      code: `import { AnnouncementBar } from "@/components/ecomcn/announcement-bar"

<AnnouncementBar
  variant="marquee"                  // or "static"
  items={[
    { id: "ship", content: "Free delivery on orders over $300" },
    { id: "drop", content: "The autumn edit is in", href: "/new" },
  ]}
  version="autumn-26"                // change it and a dismissed bar comes back
/>`,
    },
  ],
  "hero-editorial": [
    {
      label: "On the home page — a Server Component",
      code: `import { HeroEditorial } from "@/components/ecomcn/hero-editorial"
import Image from "next/image"

<HeroEditorial
  eyebrow="Autumn / Winter"
  title="Made to be resoled."
  actions={<a href="/shop" className={buttonVariants({ size: "lg" })}>Shop the collection</a>}
  image={{ src: "/campaign.jpg", alt: "The Vester boot on a stone step", width: 1600, height: 2000 }}
  // Optional: next/image, with the priority the block already asks for.
  renderImage={({ src, alt, sizes, className }) => (
    <Image src={src} alt={alt} fill sizes={sizes} className={className} priority />
  )}
  caption={{ title: "Vester Chelsea Boot", price: 420, href: "/p/vester" }}
/>`,
    },
  ],
  "category-rail": [
    {
      label: "Under the hero",
      code: `import { CategoryRail } from "@/components/ecomcn/category-rail"

<CategoryRail
  items={categories.map((c) => ({
    id: c.slug,
    label: c.name,
    href: \`/c/\${c.slug}\`,
    count: c.productCount,
    image: <img src={c.image} alt="" loading="lazy" />,
  }))}
/>`,
    },
  ],
  "collection-grid": [
    {
      label: "Three collections, the first leading",
      code: `import { CollectionGrid } from "@/components/ecomcn/collection-grid"

<CollectionGrid
  title="The edit"
  tiles={[
    { id: "rooms", eyebrow: "Autumn edit", title: "Rooms that slow you down",
      description: "Oak, wool and low light.", href: "/c/furniture", image: <img src={a} alt="…" /> },
    { id: "light", title: "After dark", href: "/c/lighting", image: <img src={b} alt="…" /> },
    { id: "table", title: "Set the table", href: "/c/tableware", image: <img src={c} alt="…" /> },
  ]}
/>`,
    },
  ],
  "lookbook-strip": [
    {
      label: "A shoppable campaign photo",
      code: `import { LookbookStrip } from "@/components/ecomcn/lookbook-strip"

<LookbookStrip
  title="Packed for the weekend"
  image={<img src="/look-wide.jpg" alt="…" />}
  mobileImage={<img src="/look-4x3.jpg" alt="…" loading="lazy" />}
  aspectRatio="2 / 1"
  mobileAspectRatio="4 / 3"
  hotspots={[
    // Percent of the image; \`mobile\` for the phone crop.
    { id: "duffel", x: 33, y: 71, mobile: { x: 31, y: 66 },
      product: { name: "Weekender Duffel", href: "/p/duffel", price: 245 } },
  ]}
/>`,
    },
  ],
  "order-confirmation": [
    {
      label: "On your order page",
      code: `import { OrderConfirmation } from "@/components/ecomcn/order-confirmation"

// Load the order by number + token from the URL — never from the session —
// so the permalink works from any device, and after the cart is gone.
<OrderConfirmation
  order={order}                       // number, placedAt, lines, totals, shipTo?, delivery?, payment?
  title={\`Thank you, \${order.firstName}.\`}
  permalink={\`https://shop.example/orders/\${order.number}?t=\${order.token}\`}
  actions={<a href="/" className={buttonVariants()}>Continue shopping</a>}
/>`,
    },
  ],
  "order-tracking": [
    {
      label: "Under the order",
      code: `import { OrderTracking } from "@/components/ecomcn/order-tracking"

<OrderTracking
  events={shipment.events}            // { id, status, at, description?, location? }[], any order
  carrier={{ name: "UPS", trackingNumber: shipment.number, url: shipment.trackingUrl }}
  estimate={{ from: "2026-10-22", to: "2026-10-26" }}
/>`,
    },
    {
      label: "The same order, where the webhooks land",
      code: `// lib/tracking-events.ts has no "use client": import it in a route handler.
import { sortTrackingEvents, trackingProgress } from "@/lib/tracking-events"

export async function POST(request: Request) {
  const event = toTrackingEvent(await request.json())   // map the carrier's payload
  const events = sortTrackingEvents([...(await db.events(event.shipmentId)), event])
  const { delivered, issue } = trackingProgress(events)
  if (issue) await notifyCustomer(issue)
  await db.saveEvents(event.shipmentId, events)
  return new Response(null, { status: 204 })
}`,
    },
  ],
  "address-form": [
    {
      label: "In your checkout",
      code: `import { AddressForm } from "@/components/ecomcn/address-form"
import { emptyAddress, validateAddress, type AddressErrors } from "@/lib/address-format"

const [address, setAddress] = React.useState(emptyAddress("US"))
const [errors, setErrors] = React.useState<AddressErrors>({})

<form
  noValidate
  onSubmit={(event) => {
    event.preventDefault()
    const found = validateAddress(address)   // {} when it will do
    setErrors(found)
    if (Object.keys(found).length === 0) goToDelivery()
  }}
>
  <AddressForm
    value={address}
    onValueChange={setAddress}
    errors={errors}
    countries={["US", "CA", "GB"]}          // the countries you ship to, in your order
  />
  <Button type="submit">Continue</Button>
</form>`,
    },
    {
      label: "The same rules on your server",
      code: `// No "use client" in this file: import it from a route handler or server action.
import { getAddressFormat, validateAddress, type Address } from "@/lib/address-format"

export async function saveAddress(address: Address) {
  const errors = validateAddress(address, getAddressFormat(address.country, { fields }))
  if (Object.keys(errors).length) return { errors }   // hand them back to the form
  // ...
}`,
    },
    {
      label: "Your address search in the lookup slot",
      code: `import { AddressForm, useAddressForm } from "@/components/ecomcn/address-form"

function PlacesSearch() {
  const { setAddress } = useAddressForm()   // fills several fields in one go
  return <YourPlacesAutocomplete onPick={(place) => setAddress(toAddress(place))} />
}

<AddressForm
  value={address}
  onValueChange={setAddress}
  lookup={<PlacesSearch />}
  fields={{ organization: "optional", phone: "required" }}
  saveAsDefault={saveDefault}
  onSaveAsDefaultChange={setSaveDefault}
/>`,
    },
    {
      label: "A country of your own",
      code: `// Merged over the built-in table — add a country, or relabel one.
const formats = {
  NL: {
    rows: [["givenName", "familyName"], ["line1"], ["line2"], ["postalCode", "city"], ["phone"]],
    required: ["givenName", "familyName", "line1", "postalCode", "city"],
    labels: { line1: "Street and number", postalCode: "Postcode" },
    postalCode: { pattern: /^\\d{4}\\s?[A-Z]{2}$/i, example: "1012 AB" },
  },
}

<AddressForm value={address} onValueChange={setAddress} formats={formats} />
validateAddress(address, getAddressFormat(address.country, { formats }))`,
    },
  ],
  "checkout-stepper": [
    {
      label: "Above each checkout step",
      code: `import { CheckoutStepper } from "@/components/ecomcn/checkout-stepper"

const steps = [
  { id: "bag", label: "Bag" },
  { id: "details", label: "Details" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
]

// Only done steps call this: the shopper can go back, never skip ahead.
<CheckoutStepper steps={steps} value={step} onValueChange={setStep} />`,
    },
  ],
  "product-gallery": [
    {
      label: "Photos as data",
      code: `import { ProductGallery, type GalleryImage } from "@/components/ecomcn/product-gallery"

const images: GalleryImage[] = [
  {
    src: "/boots/tan-900.jpg",
    srcSet: "/boots/tan-480.jpg 480w, /boots/tan-900.jpg 900w, /boots/tan-1400.jpg 1400w",
    zoomSrc: "/boots/tan-1800.jpg",  // hover zoom and full screen
    thumbSrc: "/boots/tan-160.jpg",
    alt: "The Vester Chelsea boot in tan leather",
  },
  // …
]

<ProductGallery images={images} label="Vester Chelsea Boot" />`,
    },
    {
      label: "With next/image, following the buy box's colour",
      code: `import Image from "next/image"
import { ProductGallery } from "@/components/ecomcn/product-gallery"
import { useProductBuyBox } from "@/components/ecomcn/product-buy-box"

// Inside <ProductBuyBox>: the gallery starts again on each colour's photos.
function Gallery() {
  const { selection } = useProductBuyBox()
  return (
    <ProductGallery
      images={photos[selection.Colour ?? "Tan"]}
      label="Vester Chelsea Boot"
      renderImage={(image, { priority, sizes, className }) => (
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className={className} />
      )}
    />
  )
}`,
    },
  ],
  "product-buy-box": [
    {
      label: "On the product page",
      code: `import { ProductBuyBox, type BuyBoxProduct } from "@/components/ecomcn/product-buy-box"

// options and variants are variant-swatches' own; a variant may carry its own price.
const product: BuyBoxProduct = {
  id: "vester",
  brand: "Lindqvist",
  name: "Vester Chelsea Boot",
  price: 420,
  rating: 4.6,
  reviewCount: 312,
  options,
  variants, // [{ id: "tan-41", options: { Colour: "Tan", Size: "41" }, stock: 2, price?: 380 }]
}

<ProductBuyBox
  product={product}
  defaultValue={{ Colour: "Tan" }}
  // Shows "Added" at once. If this rejects, the button rolls back and says so.
  onAddToBag={async ({ variant, quantity }) => {
    bag.increment(quantity) // your bag count, optimistic too
    try {
      await cart.add(variant!.id, quantity)
    } catch (error) {
      bag.decrement(quantity) // roll your count back…
      throw error // …and rethrow, or the button thinks it worked
    }
  }}
  onNotify={({ variant }) => openBackInStock(variant)}
  delivery={{ minDays: 2, maxDays: 4, cutoffHour: 15, label: "Free delivery" }}
/>`,
    },
    {
      label: "Composed — the gallery reads the same pick",
      code: `import {
  ProductBuyBox,
  ProductBuyBoxActions,
  ProductBuyBoxDelivery,
  ProductBuyBoxHeader,
  ProductBuyBoxPrice,
  ProductBuyBoxVariants,
  useProductBuyBox,
} from "@/components/ecomcn/product-buy-box"

<ProductBuyBox product={product} onAddToBag={add} className="grid md:grid-cols-2 gap-12">
  <Photo />
  <div className="flex flex-col gap-8">
    <ProductBuyBoxHeader />
    <ProductBuyBoxPrice />
    <ProductBuyBoxVariants sizeGuide={<SizeGuideDialog … />} />
    <ProductBuyBoxActions />
    <ProductBuyBoxDelivery />
  </div>
</ProductBuyBox>

function Photo() {
  const { selection, variant } = useProductBuyBox()
  return <img src={photos[selection.Colour ?? "Tan"]} alt="" />
}`,
    },
  ],
  "review-summary": [
    {
      label: "One page of reviews, the product's full counts",
      code: `import { ReviewSummary, type Review } from "@/components/ecomcn/review-summary"

<ReviewSummary
  id="reviews"                         // the buy box's rating links here
  reviews={page}                       // Review[]: rating, body, author, date (ISO), verified?, fit? (-1…1)
  distribution={[4, 3, 18, 61, 226]}   // every review, 1 star first
  onRatingChange={(rating) => fetchReviews({ rating })}
  action={<a href="/reviews/new">Write a review</a>}
/>`,
    },
    {
      label: "Composed",
      code: `import {
  ReviewSummary,
  ReviewSummaryFit,
  ReviewSummaryHistogram,
  ReviewSummaryList,
  ReviewSummaryScore,
  useReviewSummary,
} from "@/components/ecomcn/review-summary"

<ReviewSummary reviews={page} distribution={counts} title="What owners say">
  <ReviewSummaryScore />
  <ReviewSummaryFit />
  <ReviewSummaryHistogram />
  <ReviewSummaryList />
</ReviewSummary>`,
    },
  ],
  "related-products": [
    {
      label: "Under the product",
      code: `import { RelatedProducts } from "@/components/ecomcn/related-products"

// ProductCardProduct[] — the same data the product card takes.
<RelatedProducts products={related} onQuickAdd={(product) => cart.add(product.id)} />`,
    },
    {
      label: "Your own card in the rail",
      code: `import {
  RelatedProducts,
  RelatedProductsHeader,
  RelatedProductsProgress,
  RelatedProductsRail,
} from "@/components/ecomcn/related-products"
import { ProductCard } from "@/components/ecomcn/product-card"

<RelatedProducts products={related} title="Complete the look">
  <RelatedProductsHeader />
  <RelatedProductsRail renderCard={(p) => <ProductCard product={p} density="compact" />} />
  <RelatedProductsProgress />
</RelatedProducts>`,
    },
  ],
  "variant-swatches": [
    {
      label: "From your product data",
      code: `import {
  VariantSwatches,
  type Variant,
  type VariantOption,
} from "@/components/ecomcn/variant-swatches"

const options: VariantOption[] = [
  {
    name: "Colour",
    // swatch is any CSS background: a colour, or url(...) for a fabric.
    values: [
      { value: "Tan", swatch: "#a8764a" },
      { value: "Black", swatch: "#1c1b1a" },
    ],
  },
  { name: "Size", values: ["39", "40", "41", "42"] },
]

// One per SKU. stock: 0 is sold out; leave it out if you don't track stock.
// A combination with no variant at all reads as "isn't made in".
const variants: Variant[] = [
  { id: "tan-39", options: { Colour: "Tan", Size: "39" }, stock: 4 },
  { id: "tan-40", options: { Colour: "Tan", Size: "40" }, stock: 0 },
  // …
]

<VariantSwatches
  options={options}
  variants={variants}
  defaultValue={{ Colour: "Tan" }}
  onVariantChange={(variant) => setSku(variant?.id)}
  sizeGuide={<SizeGuideDialog columns={columns} rows={rows} />}
/>`,
    },
    {
      label: "Composed — your order, your parts",
      code: `import {
  VariantSwatches,
  VariantSwatchesOption,
  VariantSwatchesStatus,
  useVariantSwatches,
} from "@/components/ecomcn/variant-swatches"

<VariantSwatches options={options} variants={variants} className="gap-7">
  <VariantSwatchesOption name="Size" action={<SizeGuideDialog … />} />
  <VariantSwatchesOption name="Colour" />
  <AddToBag />
  <VariantSwatchesStatus />
</VariantSwatches>

// Parts read the resolved variant: undefined until every option is picked.
function AddToBag() {
  const { variant, purchasable } = useVariantSwatches()
  return (
    <Button disabled={!purchasable} onClick={() => addToBag(variant!.id)}>
      Add to bag
    </Button>
  )
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
