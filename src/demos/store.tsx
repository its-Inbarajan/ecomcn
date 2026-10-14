"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { AddressForm, type Address, type AddressErrors } from "@/components/ecomcn/address-form";
import { CartLineItem, type CartLine } from "@/components/ecomcn/cart-line-item";
import { CartSheet } from "@/components/ecomcn/cart-sheet";
import { CheckoutStepper, type CheckoutStep } from "@/components/ecomcn/checkout-stepper";
import { DeliveryOptions } from "@/components/ecomcn/delivery-options";
import { OrderSummary } from "@/components/ecomcn/order-summary";
import { PaymentSelector } from "@/components/ecomcn/payment-selector";
import {
  ProductBuyBox,
  ProductBuyBoxActions,
  ProductBuyBoxDelivery,
  ProductBuyBoxHeader,
  ProductBuyBoxPrice,
  ProductBuyBoxVariants,
  useProductBuyBox,
  type BuyBoxLine,
  type BuyBoxProduct,
  type BuyBoxVariant,
} from "@/components/ecomcn/product-buy-box";
import { ProductDetailsAccordion, type ProductDetailsSectionData } from "@/components/ecomcn/product-details-accordion";
import { ProductGallery, type GalleryImage } from "@/components/ecomcn/product-gallery";
import { RelatedProducts } from "@/components/ecomcn/related-products";
import { ReviewSummary, type Review, type ReviewDistribution } from "@/components/ecomcn/review-summary";
import { SizeGuideDialog } from "@/components/ecomcn/size-guide-dialog";
import type { ProductCardProduct } from "@/components/ecomcn/product-card";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { ListingPageDemo } from "@/demos/browse";
import { DemoProviderPanel, demoDeliveryOptions, useDemoPaymentMethods } from "@/demos/checkout";
import { COLORWAYS, PRODUCTS, type DemoProduct, type StoreColorway } from "@/demos/listing-data";
import {
  BOOT,
  BOOT_DETAILS,
  BOOT_GUIDE,
  DISTRIBUTION,
  FOOTWEAR_COLUMNS,
  REVIEWS,
} from "@/demos/product";
import { useOrderTotals } from "@/hooks/use-order-totals";
import { emptyAddress, formatAddressLines, validateAddress } from "@/lib/address-format";

/**
 * The demo store: the listing page, a product page for every product, and a
 * bag — one shop, built from nothing but ecomcn blocks. Site code: the data
 * and the bag are the demo's own, never part of a block.
 */

export const storeHref = (id: string) => `/demo/${id}`;

/* ─── the bag ────────────────────────────────────────────────────────── */

export type BagLine = {
  /** Product and variant: one line per thing you could buy. */
  id: string;
  productId: string;
  name: string;
  brand?: string;
  /** "Tan · 41" */
  detail?: string;
  unitPrice: number;
  quantity: number;
  photo?: StoreColorway;
};

const BAG_KEY = "ecomcn-demo-bag";
const EMPTY: BagLine[] = [];
let lines: BagLine[] | null = null;
const listeners = new Set<() => void>();

/** The bag is shared by every page and survives a reload: localStorage, read once. */
function readBag(): BagLine[] {
  if (lines) return lines;
  try {
    const stored = window.localStorage.getItem(BAG_KEY);
    lines = stored ? (JSON.parse(stored) as BagLine[]) : EMPTY;
  } catch {
    lines = EMPTY;
  }
  return lines;
}

function writeBag(next: BagLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(BAG_KEY, JSON.stringify(next));
  } catch {
    /* private mode: the bag lasts as long as the tab */
  }
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useBag() {
  const bag = React.useSyncExternalStore(subscribe, readBag, () => EMPTY);
  return React.useMemo(
    () => ({
      lines: bag,
      count: bag.reduce((n, line) => n + line.quantity, 0),
      add: (line: Omit<BagLine, "quantity">, quantity: number) => {
        const current = readBag();
        const found = current.find((l) => l.id === line.id);
        writeBag(
          found
            ? current.map((l) => (l.id === line.id ? { ...l, quantity: l.quantity + quantity } : l))
            : [...current, { ...line, quantity }],
        );
      },
      setQuantity: (id: string, quantity: number) =>
        writeBag(
          quantity < 1
            ? readBag().filter((l) => l.id !== id)
            : readBag().map((l) => (l.id === id ? { ...l, quantity } : l)),
        ),
      remove: (id: string) => writeBag(readBag().filter((l) => l.id !== id)),
      clear: () => writeBag([]),
    }),
    [bag],
  );
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** A bag line as cart-line-item and cart-sheet take it. */
function toCartLine(line: BagLine): CartLine {
  return {
    id: line.id,
    name: line.name,
    brand: line.brand,
    href: storeHref(line.productId),
    variant: line.detail,
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    image: line.photo ? (
      // eslint-disable-next-line @next/next/no-img-element -- demo thumbnail from the CDN
      <img src={thumb(line.photo)} alt="" className="absolute inset-0 size-full object-cover" />
    ) : undefined,
  };
}

/** The header's mini cart, and every page's: the shared bag, on cart-sheet. */
function StoreCart() {
  const { lines, setQuantity, remove } = useBag();
  const router = useRouter();
  return (
    <CartSheet
      lines={lines.map(toCartLine)}
      onQuantityChange={async (id, quantity) => {
        await wait(300);
        setQuantity(id, quantity);
      }}
      onRemove={async (id) => {
        await wait(300);
        remove(id);
      }}
      freeShippingThreshold={300}
      onCheckout={() => router.push("/demo/bag?step=details")}
      viewBagHref="/demo/bag"
      empty={
        <Link href="/demo" className="text-sm underline underline-offset-4">
          Continue shopping
        </Link>
      }
    />
  );
}

/** Adds a catalogue product from a card or the quick view: its colour, no size. */
function useQuickAdd() {
  const { add } = useBag();
  return React.useCallback(
    async (product: ProductCardProduct, colorIndex: number) => {
      await wait(450);
      const colour = COLORWAYS[product.id]?.[colorIndex];
      add(
        {
          id: `${product.id}:${colour?.name ?? ""}`,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          detail: colour?.name,
          unitPrice: product.price,
          photo: colour,
        },
        1,
      );
    },
    [add],
  );
}

/* ─── chrome ─────────────────────────────────────────────────────────── */

/** The thin bar that says what this is, above the store's own header. */
export function DemoBar() {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-295 flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2 text-[12px] sm:px-8">
        <p>
          <span className="font-medium">Demo store</span>
          <span className="opacity-70"> — every part of it is an ecomcn block. Nothing else.</span>
        </p>
        <Link
          href="/blocks"
          className="inline-flex items-center gap-1.5 underline-offset-4 outline-none hover:underline focus-visible:underline"
        >
          <ArrowLeft className="size-3" aria-hidden /> Back to the docs
        </Link>
      </div>
    </div>
  );
}

export function StoreHeader() {
  return (
    <header className="ec-rule-strong sticky top-0 z-40 border-b bg-background/92 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-295 items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-baseline gap-6">
          <Link href="/demo" className="ec-display text-3xl leading-none">
            Atelier
          </Link>
          <nav aria-label="Store" className="hidden items-baseline gap-5 text-sm sm:flex">
            <Link href="/demo" className="text-muted-foreground hover:text-foreground">
              Shop all
            </Link>
            <Link href={storeHref("p4")} className="text-muted-foreground hover:text-foreground">
              Featured: Vester boot
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <StoreCart />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/** Every page's header carries the mini cart. */
const HEADER_BLOCKS = ["cart-sheet", "cart-line-item"];

/** Which blocks this page is made of — the header's included — each a link to its docs. */
export function BuiltWith({ blocks: own }: { blocks: string[] }) {
  const blocks = [...new Set([...own, ...HEADER_BLOCKS])];
  return (
    <aside aria-label="Built with" className="ec-rule mt-24 border-t pt-6">
      <p className="ec-eyebrow text-muted-foreground">
        This page is built from {blocks.length} ecomcn {blocks.length === 1 ? "block" : "blocks"}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {blocks.map((slug) => (
          <li key={slug}>
            <Link
              href={`/blocks/${slug}`}
              className="ec-rule inline-flex items-center gap-1 border px-2.5 py-1.5 font-mono text-[12px] transition-colors hover:bg-secondary"
            >
              {slug}
              <ArrowUpRight className="size-3 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ─── listing ────────────────────────────────────────────────────────── */

export const LISTING_BLOCKS = [
  "sort-toolbar",
  "filter-panel",
  "filter-sheet",
  "product-grid",
  "product-card",
  "product-quick-view",
  "load-more",
  "empty-results",
  "price-tag",
];

export function StoreListing() {
  const quickAdd = useQuickAdd();
  return (
    <>
      <ListingPageDemo
        hrefFor={(product) => storeHref(product.id)}
        onAddToBag={quickAdd}
        intro="Sixteen objects for the table, the desk and the door. Filter, sort, quick view or quick add — then open any of them for its full page."
      />
      <BuiltWith blocks={LISTING_BLOCKS} />
    </>
  );
}

/* ─── product data ───────────────────────────────────────────────────── */

const unsplash = (photo: StoreColorway, width: number, focus = "") =>
  `https://images.unsplash.com/photo-${photo.photo}?w=${width}&q=75&ar=4:5&fit=crop&auto=format${
    photo.crop && !focus ? `&crop=${photo.crop}` : ""
  }${focus}`;

const thumb = (photo: StoreColorway) => unsplash(photo, 200);

/** Close-ups from one photo, through the CDN's focal-point zoom. */
const SHOTS = [
  { focus: "", note: "" },
  { focus: "&crop=focalpoint&fp-x=0.4&fp-y=0.62&fp-z=2", note: "close up" },
  { focus: "&crop=focalpoint&fp-x=0.6&fp-y=0.35&fp-z=1.8", note: "detail" },
];

function image(photo: StoreColorway, alt: string, focus = ""): GalleryImage {
  return {
    src: unsplash(photo, 900, focus),
    srcSet: [480, 900, 1400].map((w) => `${unsplash(photo, w, focus)} ${w}w`).join(", "),
    zoomSrc: unsplash(photo, 1800, focus),
    thumbSrc: unsplash(photo, 160, focus),
    alt,
  };
}

/** The colour's photo, two close-ups of it, then the other colourways. */
function galleryFor(product: DemoProduct, colour: string): GalleryImage[] {
  const ways = COLORWAYS[product.id] ?? [];
  const chosen = ways.find((w) => w.name === colour) ?? ways[0];
  if (!chosen) return [];
  const name = `${product.name} in ${chosen.name.toLowerCase()}`;
  return [
    ...SHOTS.map(({ focus, note }) => image(chosen, note ? `${name}, ${note}` : name, focus)),
    ...ways.filter((w) => w !== chosen).map((w) => image(w, `${product.name} in ${w.name.toLowerCase()}`)),
  ];
}

/** A small, stable number from a string: the same stock on every render. */
function seed(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

const SIZES = ["39", "40", "41", "42", "43", "44", "45"];

function buyBoxProductFor(product: DemoProduct): BuyBoxProduct {
  if (product.id === "p4") return BOOT;
  const ways = COLORWAYS[product.id] ?? [];
  const footwear = product.category === "footwear";
  const options = [
    { name: "Colour", values: ways.map((w) => ({ value: w.name, swatch: w.hex })) },
    ...(footwear ? [{ name: "Size", values: SIZES }] : []),
  ];
  const variants: BuyBoxVariant[] = ways.flatMap((w) =>
    (footwear ? SIZES : [undefined]).map((size) => {
      const id = `${product.id}-${w.name}${size ? `-${size}` : ""}`.toLowerCase();
      // Sold-out products stay sold out; the rest get a little of everything.
      const n = seed(id) % 11;
      return {
        id,
        options: { Colour: w.name, ...(size ? { Size: size } : {}) },
        stock: product.inStock ? (n < 2 ? 0 : n - 1) : 0,
      };
    }),
  );
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    price: product.price,
    compareAt: product.compareAt,
    rating: product.rating,
    reviewCount: product.reviewCount,
    options,
    variants,
  };
}

const CARE: Record<string, string> = {
  canvas: "Brush off dry dirt, spot clean with a damp cloth, and never machine wash — it strips the finish.",
  ceramic: "Dishwasher safe. Stacks; avoid thermal shock straight from the freezer.",
  glass: "Hand wash in warm water. Mouth-blown, so each piece is slightly different.",
  leather: "Brush after wear, condition monthly, and let it dry away from a radiator.",
  metal: "Dust with a dry cloth. The finish deepens with handling.",
  oak: "Wipe with a damp cloth; oil once a year to keep the grain from drying.",
  walnut: "Wipe with a damp cloth; oil once a year to keep the grain from drying.",
};

function detailsFor(product: DemoProduct): ProductDetailsSectionData[] {
  if (product.id === "p4") return BOOT_DETAILS;
  const material = product.material[0].toUpperCase() + product.material.slice(1);
  return [
    {
      id: "description",
      title: "Description",
      summary: `${material}, made by ${product.brand}`,
      content: (
        <p>
          {product.name} from {product.brand}: {product.material}, made to be used every day
          and to look better for it.
        </p>
      ),
    },
    {
      id: "care",
      title: "Care",
      summary: (CARE[product.material] ?? "Wipe clean.").split(/[.;]/)[0],
      content: <p>{CARE[product.material] ?? "Wipe clean with a dry cloth."}</p>,
    },
    {
      id: "shipping",
      title: "Shipping & returns",
      summary: "Free over $300 · 30-day returns",
      content: <p>Ships in 1–2 working days. Free delivery over $300, otherwise $18. Free returns within 30 days.</p>,
    },
  ];
}

/** A plausible spread for the product's rating and count. */
function distributionFor(product: DemoProduct): ReviewDistribution {
  if (product.id === "p4") return DISTRIBUTION;
  const shape =
    (product.rating ?? 4.5) >= 4.6
      ? [0.01, 0.01, 0.04, 0.18, 0.76]
      : (product.rating ?? 4.5) >= 4.4
        ? [0.02, 0.02, 0.06, 0.22, 0.68]
        : [0.03, 0.04, 0.09, 0.26, 0.58];
  const total = product.reviewCount ?? 40;
  return shape.map((share) => Math.round(share * total)) as ReviewDistribution;
}

function reviewsFor(product: DemoProduct): Review[] {
  if (product.id === "p4") return REVIEWS;
  const colours = (COLORWAYS[product.id] ?? []).map((w) => w.name);
  const pick = (i: number) => colours[i % Math.max(1, colours.length)];
  return [
    { id: "a", rating: 5, title: "Better in person", body: `The ${product.material} is lovely up close — the photos undersell it.`, author: "Hanne L.", date: "2026-09-18", verified: true, variant: pick(0) },
    { id: "b", rating: 4, title: "Well made", body: "Solid and well finished. Took four days to arrive, packed with care.", author: "Marcus T.", date: "2026-09-02", verified: true, variant: pick(1) },
    { id: "c", rating: 5, title: "Bought a second", body: "Used it every day for a month, then bought another as a gift.", author: "Aiko S.", date: "2026-08-21", variant: pick(0) },
    { id: "d", rating: 3, title: "Good, not perfect", body: "A nice piece, though the colour was a touch darker than I expected.", author: "Paul R.", date: "2026-08-05", verified: true, variant: pick(1) },
  ];
}

function relatedFor(product: DemoProduct): ProductCardProduct[] {
  const others = PRODUCTS.filter((p) => p.id !== product.id);
  return [...others.filter((p) => p.category === product.category), ...others.filter((p) => p.category !== product.category)]
    .slice(0, 8)
    .map((p) => ({ ...p, href: storeHref(p.id) }));
}

/* ─── product page ───────────────────────────────────────────────────── */

export const PRODUCT_BLOCKS = [
  "product-gallery",
  "product-buy-box",
  "variant-swatches",
  "price-tag",
  "size-guide-dialog",
  "product-details-accordion",
  "review-summary",
  "related-products",
  "product-card",
];

/** The gallery follows the colour picked in the buy box. */
function StoreGallery({ product }: { product: DemoProduct }) {
  const { selection } = useProductBuyBox();
  const colour = selection.Colour ?? COLORWAYS[product.id]?.[0]?.name ?? "";
  const images = React.useMemo(() => galleryFor(product, colour), [product, colour]);
  return <ProductGallery images={images} label={product.name} className="md:sticky md:top-20 md:self-start" />;
}

export function StoreProduct({ id }: { id: string }) {
  const product = PRODUCTS.find((p) => p.id === id);
  const { add } = useBag();
  const quickAdd = useQuickAdd();
  const [notified, setNotified] = React.useState<string | null>(null);
  if (!product) return null;

  const buyBox = buyBoxProductFor(product);
  const ways = COLORWAYS[product.id] ?? [];

  const addToBag = async ({ variant, quantity }: BuyBoxLine) => {
    await wait(500);
    const colour = variant?.options.Colour;
    const size = variant?.options.Size;
    add(
      {
        id: variant?.id ?? product.id,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        detail: [colour, size].filter(Boolean).join(" · ") || undefined,
        unitPrice: (variant as BuyBoxVariant | undefined)?.price ?? product.price,
        photo: ways.find((w) => w.name === colour) ?? ways[0],
      },
      quantity,
    );
  };

  return (
    <div className="flex flex-col gap-16">
      <nav aria-label="Breadcrumb" className="text-[12.5px] text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/demo" className="hover:text-foreground">
              Shop all
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="capitalize">{product.category}</li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductBuyBox
        // A new product starts with a fresh selection.
        key={product.id}
        product={buyBox}
        defaultValue={ways.length ? { Colour: ways[0].name } : {}}
        onAddToBag={addToBag}
        onNotify={({ variant }) =>
          setNotified(`We'll email you when ${[variant?.options.Colour, variant?.options.Size].filter(Boolean).join(", ") || "it"} is back.`)
        }
        delivery={{ minDays: 2, maxDays: 4, cutoffHour: 15, label: product.price >= 300 ? "Free delivery" : "Delivery $18" }}
        className="grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16"
      >
        <StoreGallery product={product} />
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <ProductBuyBoxHeader />
            <ProductBuyBoxPrice />
          </div>
          <ProductBuyBoxVariants
            sizeGuide={
              product.category === "footwear" ? (
                <SizeGuideDialog
                  columns={[...FOOTWEAR_COLUMNS]}
                  rows={BOOT_GUIDE}
                  fitNote="Lasted narrow — if you are between sizes, go up half a size."
                />
              ) : undefined
            }
          />
          <ProductBuyBoxActions />
          {notified ? (
            <p role="status" className="-mt-4 text-sm text-muted-foreground">
              {notified}
            </p>
          ) : null}
          <ProductBuyBoxDelivery />
          <ProductDetailsAccordion key={product.id} sections={detailsFor(product)} />
        </div>
      </ProductBuyBox>

      <ReviewSummary
        key={`reviews-${product.id}`}
        id="reviews"
        reviews={reviewsFor(product)}
        distribution={distributionFor(product)}
      />

      <RelatedProducts
        key={`related-${product.id}`}
        products={relatedFor(product)}
        onQuickAdd={quickAdd}
        cardProps={{ onWishlistChange: () => wait(350) }}
      />

      <BuiltWith blocks={PRODUCT_BLOCKS} />
    </div>
  );
}

/* ─── bag ────────────────────────────────────────────────────────────── */

const CHECKOUT_STEPS: CheckoutStep[] = [
  { id: "bag", label: "Bag" },
  { id: "details", label: "Details" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
];

/** Where the demo "ships": every built-in address format, and Ireland on the generic one. */
const SHIPS_TO = ["US", "CA", "GB", "IE", "FR", "DE", "IN", "JP", "AU"];

/**
 * The bag and checkout, on nothing but ecomcn blocks: cart-line-item lines
 * and order-summary for the bag, address-form for Details,
 * delivery-options for Delivery and payment-selector for Payment, with the
 * checkout stepper across the top. The payment provider is a stand-in that
 * takes no card details.
 */
export function StoreBag() {
  const { lines: bag, setQuantity, remove, clear } = useBag();
  const [code, setCode] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<Address>(() => emptyAddress("US"));
  const [errors, setErrors] = React.useState<AddressErrors | null>(null);
  const [saveDefault, setSaveDefault] = React.useState(false);
  const [deliveryId, setDeliveryId] = React.useState<string | null>("standard");
  const [paymentId, setPaymentId] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [placed, setPlaced] = React.useState<{ number: string; total: number; shipTo: string[] } | null>(null);
  const methods = useDemoPaymentMethods();
  const form = React.useRef<HTMLFormElement>(null);
  // The step lives in the URL, so the mini cart's Checkout can land on it.
  const router = useRouter();
  const step = useSearchParams().get("step") ?? "bag";
  const goTo = (id: string) => router.replace(id === "bag" ? "/demo/bag" : `/demo/bag?step=${id}`, { scroll: false });

  const lines = bag.map((l) => ({ id: l.id, unitPrice: l.unitPrice, quantity: l.quantity }));
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const deliveryOptions = demoDeliveryOptions(subtotal);
  const delivery = deliveryOptions.find((o) => o.id === deliveryId) ?? deliveryOptions[0];
  // Until a delivery method is chosen the summary estimates; from then on it charges the method.
  const chosenDelivery = step === "delivery" || step === "payment";
  const pricing = {
    lines,
    discountRate: code ? 0.2 : 0,
    freeShippingThreshold: chosenDelivery ? undefined : 300,
    flatShipping: chosenDelivery ? delivery.price : 18,
    taxRate: 0.08,
  };
  const totals = useOrderTotals(pricing);
  const money = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const continueToDelivery = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateAddress(address);
    setErrors(found);
    if (Object.keys(found).length === 0) goTo("delivery");
  };
  const shipTo = Object.keys(validateAddress(address)).length === 0 ? formatAddressLines(address) : null;

  const pay = async () => {
    if (!paymentId) {
      setPaymentError(null);
      return;
    }
    setPaying(true);
    setPaymentError(null);
    await wait(900);
    setPaying(false);
    // A demo order number: from the total, so it's the same for the same bag.
    setPlaced({ number: `ATL-${String(Math.round(totals.total * 100)).padStart(5, "0").slice(-5)}`, total: totals.total, shipTo: shipTo ?? [] });
    clear();
  };

  const cta =
    step === "details"
      ? { label: "Continue to delivery", run: () => form.current?.requestSubmit() }
      : step === "delivery"
        ? { label: "Continue to payment", run: () => goTo("payment") }
        : step === "payment"
          ? paymentId
            ? { label: paying ? "Paying…" : `Pay ${money(totals.total)}`, run: pay }
            : {
                label: "Choose how to pay",
                // Nothing to pay with yet: take the shopper to the methods.
                run: () => document.querySelector<HTMLElement>("[data-slot=payment-selector] [role=radio]:not([data-disabled])")?.focus(),
              }
          : { label: "Checkout", run: () => goTo("details") };

  const summary = (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <OrderSummary
        {...pricing}
        appliedCode={code}
        discountRate={0.2}
        onApplyCode={(entered) => {
          if (entered.trim().toUpperCase() !== "ARCHIVE20") throw new Error("That code isn't valid. Try ARCHIVE20.");
          setCode("ARCHIVE20");
        }}
        onRemoveCode={() => setCode(null)}
        ctaLabel={cta.label}
        onCheckout={cta.run}
      />
    </div>
  );

  const recap = (
    <dl className="ec-rule mb-8 grid gap-4 border-b pb-6 text-[14.5px] leading-relaxed sm:grid-cols-2">
      <div>
        <dt className="ec-eyebrow mb-1.5 flex items-center gap-3 text-muted-foreground">
          Ship to
          <button type="button" onClick={() => goTo("details")} className="normal-case underline underline-offset-4 hover:text-foreground">
            Change
          </button>
        </dt>
        {(shipTo ?? []).map((line) => (
          <dd key={line}>{line}</dd>
        ))}
      </div>
      {step === "payment" ? (
        <div>
          <dt className="ec-eyebrow mb-1.5 flex items-center gap-3 text-muted-foreground">
            Delivery
            <button type="button" onClick={() => goTo("delivery")} className="normal-case underline underline-offset-4 hover:text-foreground">
              Change
            </button>
          </dt>
          <dd>
            {delivery.label} · {delivery.price === 0 ? "Free" : money(delivery.price)}
          </dd>
        </div>
      ) : null}
    </dl>
  );

  const bigButton = "mt-8 h-12 w-full text-[13px] tracking-[0.14em] uppercase";
  const twoColumns = "grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14";

  let body: React.ReactNode;
  if (placed) {
    body = (
      <div className="max-w-xl py-12" role="status">
        <p className="ec-eyebrow text-muted-foreground">Order {placed.number}</p>
        <p className="mt-2 text-2xl">Thank you — your order is placed.</p>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
          {money(placed.total)} to {placed.shipTo[0] ?? "you"}. It&rsquo;s a demo:
          nothing was charged and nothing will arrive. The order confirmation
          page is a block for a later release.
        </p>
        <Link href="/demo" className="mt-6 inline-flex items-center gap-2 text-sm underline underline-offset-4">
          Back to the shop <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    );
  } else if (bag.length === 0) {
    body = (
      <div className="py-16">
        <p className="text-2xl">Nothing in it yet.</p>
        <Link href="/demo" className="mt-4 inline-flex items-center gap-2 text-sm underline underline-offset-4">
          Back to the shop <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    );
  } else if (step === "details") {
    body = (
      <div className={twoColumns}>
        <form ref={form} noValidate onSubmit={continueToDelivery} className="max-w-2xl">
          <AddressForm
            value={address}
            onValueChange={setAddress}
            errors={errors}
            countries={SHIPS_TO}
            saveAsDefault={saveDefault}
            onSaveAsDefaultChange={setSaveDefault}
          />
          <Button type="submit" size="lg" className={bigButton}>
            Continue to delivery
          </Button>
        </form>
        {summary}
      </div>
    );
  } else if ((step === "delivery" || step === "payment") && !shipTo) {
    // A reload forgets the address (it lives in memory): ask for it again.
    body = (
      <div className="max-w-xl py-12">
        <p className="text-2xl">Where&rsquo;s it going?</p>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
          Delivery dates and prices need an address first.
        </p>
        <Button size="lg" className={bigButton} onClick={() => goTo("details")}>
          Add your address
        </Button>
      </div>
    );
  } else if (step === "delivery") {
    body = (
      <div className={twoColumns}>
        <div className="max-w-2xl">
          {recap}
          <DeliveryOptions options={deliveryOptions} value={deliveryId} onValueChange={setDeliveryId} />
          <Button size="lg" className={bigButton} onClick={() => goTo("payment")}>
            Continue to payment
          </Button>
        </div>
        {summary}
      </div>
    );
  } else if (step === "payment") {
    body = (
      <div className={twoColumns}>
        <div className="max-w-2xl">
          {recap}
          <PaymentSelector
            methods={methods}
            value={paymentId}
            onValueChange={(id) => {
              setPaymentId(id);
              setPaymentError(null);
            }}
            renderPanel={(method) => <DemoProviderPanel method={method} />}
            total={totals.total}
            error={paymentError}
            disabled={paying}
          />
          <Button size="lg" className={bigButton} onClick={pay} disabled={paying || !paymentId}>
            {paying ? "Paying…" : paymentId ? `Pay ${money(totals.total)}` : "Choose how to pay"}
          </Button>
        </div>
        {summary}
      </div>
    );
  } else {
    body = (
      <div className={twoColumns}>
        <ul className="ec-rule border-t">
          {bag.map((line) => (
            <CartLineItem
              key={line.id}
              line={toCartLine(line)}
              onQuantityChange={async (quantity) => {
                await wait(300);
                setQuantity(line.id, quantity);
              }}
              onRemove={async () => {
                await wait(300);
                remove(line.id);
              }}
            />
          ))}
        </ul>
        {summary}
      </div>
    );
  }

  const builtWith: Record<string, string[]> = {
    bag: ["checkout-stepper", "cart-line-item", "order-summary"],
    details: ["checkout-stepper", "address-form", "order-summary"],
    delivery: ["checkout-stepper", "delivery-options", "order-summary"],
    payment: ["checkout-stepper", "payment-selector", "order-summary"],
  };

  return (
    <div>
      <header className="ec-rule-strong border-b pb-5">
        <h1 className="ec-display text-5xl">{placed ? "Thank you" : step === "bag" ? "Your bag" : "Checkout"}</h1>
      </header>

      {placed ? null : (
        <CheckoutStepper className="mt-6" steps={CHECKOUT_STEPS} value={step} onValueChange={goTo} />
      )}

      {body}

      <BuiltWith blocks={builtWith[step] ?? builtWith.bag} />
    </div>
  );
}
