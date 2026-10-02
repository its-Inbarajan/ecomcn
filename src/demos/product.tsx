"use client";

import * as React from "react";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";

import {
  ProductDetailsAccordion,
  ProductDetailsSection,
  ProductDetailsSpecs,
  useProductDetailsAccordion,
  type ProductDetailsSectionData,
} from "@/components/ecomcn/product-details-accordion";
import {
  SizeGuideContent,
  SizeGuideDialog,
  SizeGuideNote,
  SizeGuideTable,
  SizeGuideTrigger,
  SizeGuideUnitToggle,
  useSizeGuide,
  type SizeGuideRow,
} from "@/components/ecomcn/size-guide-dialog";
import {
  VariantSwatches,
  VariantSwatchesOption,
  VariantSwatchesStatus,
  useVariantSwatches,
  type Variant,
  type VariantOption,
  type VariantSelection,
} from "@/components/ecomcn/variant-swatches";
import {
  ProductBuyBox,
  ProductBuyBoxActions,
  ProductBuyBoxDelivery,
  ProductBuyBoxHeader,
  ProductBuyBoxPrice,
  ProductBuyBoxVariants,
  useProductBuyBox,
  type BuyBoxProduct,
  type BuyBoxVariant,
} from "@/components/ecomcn/product-buy-box";
import {
  ReviewSummary,
  ReviewSummaryFit,
  ReviewSummaryHistogram,
  ReviewSummaryList,
  ReviewSummaryScore,
  type Review,
} from "@/components/ecomcn/review-summary";
import { RelatedProducts } from "@/components/ecomcn/related-products";
import { PRODUCTS as CATALOGUE } from "@/demos/listing-data";
import { PriceTag } from "@/components/ecomcn/price-tag";
import { ProductPhoto } from "@/components/site/product-photo";
import { ControlBar, ControlLabel, Toggle } from "@/demos/controls";
import { cn } from "@/lib/utils";

/**
 * Product-stage demos. Site code, not registry code: adopters get the blocks,
 * never this sample content.
 */

/* ─── product-details-accordion ──────────────────────────────────────── */

const SECTIONS: ProductDetailsSectionData[] = [
  {
    id: "description",
    title: "Description",
    summary: "Waxed canvas, 24 litres",
    content: (
      <>
        <p>
          A market tote cut from dry-waxed cotton canvas that softens and darkens
          with use. The gusset takes a laptop sleeve, a jumper and the week&rsquo;s
          vegetables without losing its shape.
        </p>
        <p>
          Leather handles are saddle-stitched at both ends, so the load sits on the
          stitching, not the rivets.
        </p>
      </>
    ),
  },
  {
    id: "materials",
    title: "Materials",
    summary: "Organic cotton, vegetable-tanned leather",
    content: (
      <ProductDetailsSpecs
        items={[
          ["Body", "18 oz organic cotton canvas, paraffin wax"],
          ["Handles", "Vegetable-tanned leather"],
          ["Lining", "Unlined"],
          ["Dimensions", "38 × 42 × 14 cm"],
          ["Weight", "620 g"],
        ]}
      />
    ),
  },
  {
    id: "care",
    title: "Care",
    summary: "Spot clean, re-wax yearly",
    content: (
      <p>
        Brush off dry dirt, then spot clean with a damp cloth — never machine
        wash, which strips the wax. Re-wax once a year, or when the canvas
        stops beading water.
      </p>
    ),
  },
  {
    id: "shipping",
    title: "Shipping & returns",
    summary: "Free over $300 · 30-day returns",
    content: (
      <p>
        Ships in 1–2 working days. Free standard delivery over $300, otherwise $18.
        Returns are free within 30 days — <a href="#">start a return</a>.
      </p>
    ),
  },
  {
    id: "maker",
    title: "Made by",
    summary: "Aarhus Supply, Denmark",
    content: (
      <p>
        Cut and sewn by a family workshop outside Aarhus that has made bags for
        fishermen since 1962. <strong>Each tote is numbered inside.</strong>
      </p>
    ),
  },
];

/** A custom part: reads and sets the shared open state through context. */
function ExpandAll({ ids }: { ids: string[] }) {
  const { open, setOpen } = useProductDetailsAccordion();
  const all = ids.every((id) => open.includes(id));
  const Icon = all ? ChevronsDownUp : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={() => setOpen(all ? [] : ids)}
      className="ec-eyebrow -mr-2 inline-flex h-9 items-center gap-2 px-2 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {all ? "Collapse all" : "Expand all"}
      <Icon className="size-3.5" aria-hidden />
    </button>
  );
}

const COMPOSED = SECTIONS.filter((s) => s.id !== "maker");

export function ProductDetailsAccordionDemo() {
  const [mode, setMode] = React.useState<"default" | "composed">("default");
  const [open, setOpen] = React.useState<string[]>(["description"]);

  return (
    <div>
      <ControlBar>
        <ControlLabel>Layout</ControlLabel>
        <Toggle on={mode === "default"} onClick={() => setMode("default")}>
          One tag
        </Toggle>
        <Toggle on={mode === "composed"} onClick={() => setMode("composed")}>
          Composed
        </Toggle>
        <span className="ml-auto font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
          open: {open.length ? open.join(", ") : "none"}
        </span>
      </ControlBar>

      {/* Tall enough for every section open at once, so the preview frame
          keeps its height while sections open and close — the page around
          it never jumps. */}
      <div className="mx-auto max-w-xl sm:min-h-[48rem]">
        {mode === "default" ? (
          <ProductDetailsAccordion sections={SECTIONS} open={open} onOpenChange={setOpen} />
        ) : (
          <ProductDetailsAccordion open={open} onOpenChange={setOpen}>
            <div className="flex items-center justify-between pt-2 pb-4">
              <p className="ec-eyebrow text-muted-foreground">
                {COMPOSED.length} sections
              </p>
              <ExpandAll ids={COMPOSED.map((s) => s.id)} />
            </div>
            {COMPOSED.map((s) => (
              <ProductDetailsSection key={s.id} id={s.id} title={s.title} summary={s.summary}>
                {s.content}
              </ProductDetailsSection>
            ))}
          </ProductDetailsAccordion>
        )}
        <p className="mt-6 text-[12.5px] leading-relaxed text-muted-foreground">
          Every closed row still answers its question — the summary line is
          always on the page. The open state is shared through context, so a
          custom part like &ldquo;Expand all&rdquo; needs no props.
        </p>
      </div>
    </div>
  );
}

/* ─── size-guide-dialog ──────────────────────────────────────────────── */

const APPAREL_COLUMNS = ["Chest", "Waist", "Hip", "Inside leg"];
const APPAREL: SizeGuideRow[] = [
  { size: "XS", values: [[82, 86], [66, 70], [88, 92], 80] },
  { size: "S", values: [[87, 91], [71, 75], [93, 97], 81] },
  { size: "M", values: [[92, 96], [76, 80], [98, 102], 82] },
  { size: "L", values: [[97, 102], [81, 86], [103, 108], 83] },
  { size: "XL", values: [[103, 108], [87, 92], [109, 114], 84] },
];

const FOOTWEAR_COLUMNS = ["UK", "US", "Foot length"];
const FOOTWEAR: SizeGuideRow[] = [
  { size: "EU 39", values: ["6", "7", 24.5] },
  { size: "EU 40", values: ["6.5", "7.5", 25.2] },
  { size: "EU 41", values: ["7.5", "8.5", 25.9] },
  { size: "EU 42", values: ["8", "9", 26.5] },
  { size: "EU 43", values: ["9", "10", 27.2] },
  { size: "EU 44", values: ["9.5", "10.5", 27.9] },
];

/** A custom part: the selected size's chest measurement, in the current unit. */
function YourSize() {
  const { rows, selectedSize, columns, format, unit } = useSizeGuide();
  const row = rows.find((r) => r.size === selectedSize);
  if (!row) return null;
  const chest = columns.indexOf("Chest");
  return (
    <p className="text-sm text-muted-foreground">
      Size <span className="font-medium text-foreground">{row.size}</span> fits a{" "}
      {format(row.values[chest])} {unit} chest.
    </p>
  );
}

/** The two products the demo can show: the guide follows the catalogue. */
const PRODUCTS = {
  apparel: {
    brand: "Aarhus Supply",
    name: "Waxed Cotton Bomber",
    price: 285,
    photo: { id: "1591047139829-d91aecb6caea" },
    alt: "A rust waxed-cotton bomber jacket on a hanger",
    columns: APPAREL_COLUMNS,
    rows: APPAREL,
    fitNote: "Cut close through the chest. Between two sizes, take the larger.",
  },
  footwear: {
    brand: "Lindqvist",
    name: "Vester Chelsea Boot",
    price: 420,
    photo: { id: "1773425975272-35f0900a9d8f" },
    alt: "A tan leather Chelsea boot",
    columns: FOOTWEAR_COLUMNS,
    rows: FOOTWEAR,
    fitNote: "Lasted narrow — if you are between sizes, go up half a size.",
  },
} as const;

export function SizeGuideDialogDemo() {
  const [catalogue, setCatalogue] = React.useState<"apparel" | "footwear">("apparel");
  const [layout, setLayout] = React.useState<"default" | "composed">("default");
  const product = PRODUCTS[catalogue];
  const rows = product.rows;
  const [size, setSize] = React.useState("M");
  const selected = rows.some((r) => r.size === size) ? size : rows[2].size;

  return (
    <div>
      <ControlBar>
        <ControlLabel>Table</ControlLabel>
        <Toggle on={catalogue === "apparel"} onClick={() => setCatalogue("apparel")}>
          Apparel · ranges
        </Toggle>
        <Toggle on={catalogue === "footwear"} onClick={() => setCatalogue("footwear")}>
          Footwear · equivalents
        </Toggle>
        <ControlLabel className="ml-4">Layout</ControlLabel>
        <Toggle on={layout === "default"} onClick={() => setLayout("default")}>
          One tag
        </Toggle>
        <Toggle on={layout === "composed"} onClick={() => setLayout("composed")}>
          Composed
        </Toggle>
      </ControlBar>

      {/* A product page's first screen: the guide opens from the size label,
          and the frame is tall enough to show the whole dialog. */}
      <div className="grid gap-8 md:min-h-[44rem] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="aspect-[4/5] w-full self-start">
          <ProductPhoto
            key={catalogue}
            photo={product.photo}
            alt={product.alt}
            eager
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>

        <div className="flex flex-col gap-8 md:py-6">
          <div>
            <p className="ec-eyebrow text-muted-foreground">{product.brand}</p>
            <h2 className="ec-display mt-3 text-4xl sm:text-5xl">{product.name}</h2>
            <PriceTag price={product.price} className="mt-4" />
          </div>

          <div>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <p className="text-xs font-medium tracking-[0.14em] uppercase">
                Size{" "}
                <span className="ml-2 font-normal tracking-normal text-muted-foreground normal-case">
                  {selected}
                </span>
              </p>
              {layout === "default" ? (
                <SizeGuideDialog
                  key={catalogue}
                  columns={[...product.columns]}
                  rows={rows}
                  selectedSize={selected}
                  fitNote={product.fitNote}
                />
              ) : (
                <SizeGuideDialog
                  key={`${catalogue}-composed`}
                  columns={[...product.columns]}
                  rows={rows}
                  selectedSize={selected}
                  defaultUnit="in"
                  title="Size & fit"
                >
                  <SizeGuideTrigger>Size &amp; fit</SizeGuideTrigger>
                  <SizeGuideContent>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {catalogue === "apparel" ? <YourSize /> : <span />}
                      <SizeGuideUnitToggle />
                    </div>
                    <SizeGuideTable />
                    <SizeGuideNote className="text-muted-foreground">
                      Composed from parts, opening in inches — the unit lives in context,
                      so the sentence above follows the toggle.
                    </SizeGuideNote>
                  </SizeGuideContent>
                </SizeGuideDialog>
              )}
            </div>

            <div role="group" aria-label="Size" className="grid grid-cols-5 gap-px border bg-border">
              {rows.slice(0, 5).map((r) => (
                <button
                  key={r.size}
                  type="button"
                  aria-pressed={selected === r.size}
                  onClick={() => setSize(r.size)}
                  className={cn(
                    "h-12 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    selected === r.size ? "bg-foreground text-background" : "bg-background hover:bg-secondary"
                  )}
                >
                  {r.size.replace("EU ", "")}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="h-12 w-full bg-foreground text-sm font-medium tracking-[0.14em] text-background uppercase transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Add to bag
          </button>

          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Open the guide: it grows out of the link and folds back into it.
            The size you pick is marked in the table; switch to inches and the
            ranges convert to the nearest half inch, while the UK and US
            equivalents are text, so they are never converted.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── variant-swatches ───────────────────────────────────────────────── */

const BOOT_PHOTOS: Record<string, string> = {
  Tan: "1773425975272-35f0900a9d8f",
  Walnut: "1777987601677-3059be0e1388",
  Black: "1534233812932-59b8fa1b780c",
};

const BOOT_OPTIONS: VariantOption[] = [
  {
    name: "Colour",
    values: [
      { value: "Tan", swatch: "#a8764a" },
      { value: "Walnut", swatch: "#5b3d28" },
      { value: "Black", swatch: "#1c1b1a" },
    ],
  },
  { name: "Size", values: ["39", "40", "41", "42", "43", "44", "45", "46"] },
];

/**
 * Stock per colour, size 39 to 46. Tan is healthy with gaps, Walnut isn't
 * made in 46, and Black is down to one pair — so every state is on show.
 */
const BOOT_STOCK: Record<string, (number | null)[]> = {
  Tan: [4, 0, 2, 9, 12, 1, 6, 0],
  Walnut: [0, 5, 8, 0, 3, 7, 0, null],
  Black: [0, 0, 0, 1, 0, 0, 0, 0],
};

const BOOT_VARIANTS: Variant[] = Object.entries(BOOT_STOCK).flatMap(([colour, stock]) =>
  stock.flatMap((units, i) => {
    const size = String(39 + i);
    return units === null
      ? []
      : [{ id: `vester-${colour.toLowerCase()}-${size}`, options: { Colour: colour, Size: size }, stock: units }];
  })
);

const BOOT_GUIDE: SizeGuideRow[] = [
  ...FOOTWEAR,
  { size: "EU 45", values: ["10.5", "11.5", 28.6] },
  { size: "EU 46", values: ["11", "12", 29.2] },
];

const BOOT_PRICE = 420;

/** Add to bag, carrying the price — or saying what is still missing. */
function AddToBag({ variant, complete }: { variant?: Variant; complete: boolean }) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(BOOT_PRICE);
  const soldOut = complete && (!variant || variant.stock === 0);
  return (
    <button
      type="button"
      aria-disabled={!complete || undefined}
      className={cn(
        "h-12 w-full text-sm font-medium tracking-[0.14em] uppercase transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        soldOut ? "border border-foreground text-foreground" : "bg-foreground text-background hover:opacity-90",
        !complete && "opacity-60 hover:opacity-60"
      )}
    >
      {!complete ? "Select a size" : soldOut ? "Notify me" : `Add to bag — ${price}`}
    </button>
  );
}

/** A custom part: the buy button reads the resolved variant through context. */
function AddToBagPart() {
  const { variant, value, options } = useVariantSwatches();
  return <AddToBag variant={variant} complete={options.every((o) => value[o.name] !== undefined)} />;
}

export function VariantSwatchesDemo() {
  const [layout, setLayout] = React.useState<"default" | "composed">("default");
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState<VariantSelection>({ Colour: "Tan" });
  const colour = value.Colour ?? "Tan";
  const variant = BOOT_VARIANTS.find(
    (v) => v.options.Colour === value.Colour && v.options.Size === value.Size
  );

  const guide = (
    <SizeGuideDialog
      columns={[...FOOTWEAR_COLUMNS]}
      rows={BOOT_GUIDE}
      selectedSize={value.Size ? `EU ${value.Size}` : undefined}
      fitNote="Lasted narrow — if you are between sizes, go up half a size."
    />
  );

  return (
    <div>
      <ControlBar>
        <ControlLabel>Layout</ControlLabel>
        <Toggle on={layout === "default"} onClick={() => setLayout("default")}>
          One tag
        </Toggle>
        <Toggle on={layout === "composed"} onClick={() => setLayout("composed")}>
          Composed
        </Toggle>
        <ControlLabel className="ml-4">Stock</ControlLabel>
        <Toggle on={!loading} onClick={() => setLoading(false)}>
          Loaded
        </Toggle>
        <Toggle on={loading} onClick={() => setLoading(true)}>
          Loading
        </Toggle>
        <span className="ml-auto font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
          {variant ? `${variant.id} · ${variant.stock} in stock` : "no variant yet"}
        </span>
      </ControlBar>

      <div className="grid gap-8 md:min-h-[44rem] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="aspect-[4/5] w-full self-start">
          <ProductPhoto
            key={colour}
            photo={{ id: BOOT_PHOTOS[colour] }}
            alt={`The Vester Chelsea boot in ${colour.toLowerCase()} leather`}
            eager
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>

        <div className="flex flex-col gap-8 md:py-6">
          <div>
            <p className="ec-eyebrow text-muted-foreground">Lindqvist</p>
            <h2 className="ec-display mt-3 text-4xl sm:text-5xl">Vester Chelsea Boot</h2>
            <PriceTag price={BOOT_PRICE} className="mt-4" />
          </div>

          {layout === "default" ? (
            <>
              <VariantSwatches
                options={BOOT_OPTIONS}
                variants={BOOT_VARIANTS}
                value={value}
                onValueChange={setValue}
                sizeGuide={guide}
                loading={loading}
              />
              <AddToBag variant={variant} complete={Boolean(value.Colour && value.Size)} />
            </>
          ) : (
            <VariantSwatches
              options={BOOT_OPTIONS}
              variants={BOOT_VARIANTS}
              value={value}
              onValueChange={setValue}
              loading={loading}
              className="gap-7"
            >
              <VariantSwatchesOption name="Size" action={guide} columns={8} />
              <VariantSwatchesOption name="Colour" />
              <div>
                <AddToBagPart />
                <VariantSwatchesStatus />
              </div>
            </VariantSwatches>
          )}

          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Pick Black: every size but 42 is struck through — still focusable,
            still choosable, and the button turns to &ldquo;Notify me&rdquo;
            while the line under the grid says why. Sizes with a few pairs left
            say so. The mark slides from pick to pick; the arrow keys move
            without choosing, so the photo only changes when you do.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── product-buy-box ────────────────────────────────────────────────── */

/** The same boot, with Black at its own price — the buy box follows the variant. */
const BOOT: BuyBoxProduct = {
  id: "vester",
  brand: "Lindqvist",
  name: "Vester Chelsea Boot",
  price: BOOT_PRICE,
  rating: 4.6,
  reviewCount: 312,
  options: BOOT_OPTIONS,
  variants: BOOT_VARIANTS.map<BuyBoxVariant>((v) =>
    v.options.Colour === "Black" ? { ...v, price: 380, compareAt: 420 } : v,
  ),
};

/** A custom part: the photo follows the colour picked in the buy box. */
function BuyBoxPhoto() {
  const { selection } = useProductBuyBox();
  const colour = selection.Colour ?? "Tan";
  return (
    <div className="aspect-[4/5] w-full self-start">
      <ProductPhoto
        key={colour}
        photo={{ id: BOOT_PHOTOS[colour] }}
        alt={`The Vester Chelsea boot in ${colour.toLowerCase()} leather`}
        eager
        sizes="(min-width: 768px) 50vw, 100vw"
      />
    </div>
  );
}

export function ProductBuyBoxDemo() {
  const [layout, setLayout] = React.useState<"default" | "composed">("default");
  const [fail, setFail] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [bag, setBag] = React.useState(0);

  // A bag that takes a moment — and, when asked, refuses: the button rolls back.
  const addToBag = ({ quantity }: { quantity: number }) =>
    new Promise<void>((resolve, reject) =>
      window.setTimeout(() => {
        if (fail) reject(new Error("Network"));
        else {
          setBag((n) => n + quantity);
          resolve();
        }
      }, 700),
    );

  const shared = {
    product: BOOT,
    defaultValue: { Colour: "Tan" },
    onAddToBag: addToBag,
    onNotify: () => {},
    delivery: { minDays: 2, maxDays: 4, cutoffHour: 15, label: "Free delivery" },
    loading,
  };
  const guide = (
    <SizeGuideDialog
      columns={[...FOOTWEAR_COLUMNS]}
      rows={BOOT_GUIDE}
      fitNote="Lasted narrow — if you are between sizes, go up half a size."
    />
  );

  return (
    <div>
      <ControlBar>
        <ControlLabel>Layout</ControlLabel>
        <Toggle on={layout === "default"} onClick={() => setLayout("default")}>
          One tag
        </Toggle>
        <Toggle on={layout === "composed"} onClick={() => setLayout("composed")}>
          Composed
        </Toggle>
        <ControlLabel className="ml-4">Next add</ControlLabel>
        <Toggle on={!fail} onClick={() => setFail(false)}>
          Succeeds
        </Toggle>
        <Toggle on={fail} onClick={() => setFail(true)}>
          Fails
        </Toggle>
        <ControlLabel className="ml-4">Data</ControlLabel>
        <Toggle on={!loading} onClick={() => setLoading(false)}>
          Loaded
        </Toggle>
        <Toggle on={loading} onClick={() => setLoading(true)}>
          Loading
        </Toggle>
        <span className="ml-auto font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
          bag: {bag}
        </span>
      </ControlBar>

      {layout === "default" ? (
        <div className="grid gap-8 md:min-h-[46rem] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="aspect-[4/5] w-full self-start">
            <ProductPhoto
              photo={{ id: BOOT_PHOTOS.Tan }}
              alt="The Vester Chelsea boot in tan leather"
              eager
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <ProductBuyBox {...shared} headingLevel="h2" className="md:py-6" />
        </div>
      ) : (
        // Composed: the root wraps the photo too, so it reads the same pick.
        <ProductBuyBox
          {...shared}
          className="grid gap-8 md:min-h-[46rem] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14"
        >
          <BuyBoxPhoto />
          <div className="flex flex-col gap-8 md:py-6">
            <div className="flex flex-col gap-4">
              <ProductBuyBoxHeader headingLevel="h2" />
              <ProductBuyBoxPrice />
            </div>
            <ProductBuyBoxVariants sizeGuide={guide} />
            <ProductBuyBoxActions />
            <ProductBuyBoxDelivery />
          </div>
        </ProductBuyBox>
      )}

      <p className="mt-8 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
        Press add before choosing a size: the button asks, and focus goes to
        the sizes. Pick one and the button carries the total. Set the next add
        to fail: it says &ldquo;Added&rdquo; at once, then rolls back with a
        line under it. Black has its own price, and the composed photo follows
        the colour.
      </p>
    </div>
  );
}

/* ─── review-summary ─────────────────────────────────────────────────── */

const REVIEWS: Review[] = [
  { id: "r1", rating: 5, title: "Worth the break-in week", body: "Stiff for the first five or six wears, then they shape to your foot. Two winters in and the sole is barely worn.", author: "Mara K.", date: "2026-09-21", verified: true, fit: -0.4, variant: "Tan · EU 41" },
  { id: "r2", rating: 5, title: "The colour is better in person", body: "Tan reads almost cognac in daylight. Took my usual size, a little snug across the toes at first.", author: "Jonas P.", date: "2026-09-12", verified: true, fit: -0.3, variant: "Tan · EU 43" },
  { id: "r3", rating: 4, title: "Size up half", body: "Lovely boot, narrow last. I swapped a 42 for a 43 and they are perfect with wool socks.", author: "Ines R.", date: "2026-08-30", verified: true, fit: -0.8, variant: "Walnut · EU 43" },
  { id: "r4", rating: 5, title: "Resoled, still going", body: "Third year. Had them resoled in the spring — the welt made that easy and cheap.", author: "Tom B.", date: "2026-08-18", fit: 0, variant: "Black · EU 44" },
  { id: "r5", rating: 3, title: "Elastic loosened", body: "Leather is great, but the side elastic went slack faster than I expected.", author: "Priya S.", date: "2026-08-02", verified: true, fit: 0.2, variant: "Walnut · EU 40" },
  { id: "r6", rating: 4, title: "Smart enough for the office", body: "Wear them with suits and with jeans. Took a week to stop squeaking.", author: "Daniel O.", date: "2026-07-25", verified: true, fit: -0.2, variant: "Black · EU 42" },
  { id: "r7", rating: 2, title: "Too narrow for me", body: "I have wide feet and even a size up pinched. Returns were painless.", author: "Ruth A.", date: "2026-07-11", verified: true, fit: -1, variant: "Tan · EU 42" },
  { id: "r8", rating: 5, title: "Rain-proof enough", body: "Waxed them once and walked through a wet October without damp socks.", author: "Kofi M.", date: "2026-06-30", fit: 0, variant: "Tan · EU 44" },
  { id: "r9", rating: 1, title: "Sole separated", body: "Toe of the sole came away after two months. Replaced quickly, to be fair.", author: "Lena W.", date: "2026-06-14", verified: true, variant: "Walnut · EU 39" },
];

/** The product's counts across all 312 reviews; the list is one page of them. */
const DISTRIBUTION: [number, number, number, number, number] = [4, 3, 18, 61, 226];

export function ReviewSummaryDemo() {
  const [state, setState] = React.useState<"loaded" | "loading" | "empty">("loaded");
  const [layout, setLayout] = React.useState<"default" | "composed">("default");
  const reviews = state === "empty" ? [] : REVIEWS;
  const distribution = state === "empty" ? undefined : DISTRIBUTION;

  return (
    <div>
      <ControlBar>
        <ControlLabel>Layout</ControlLabel>
        <Toggle on={layout === "default"} onClick={() => setLayout("default")}>
          One tag
        </Toggle>
        <Toggle on={layout === "composed"} onClick={() => setLayout("composed")}>
          Composed
        </Toggle>
        <ControlLabel className="ml-4">Data</ControlLabel>
        {(["loaded", "loading", "empty"] as const).map((s) => (
          <Toggle key={s} on={state === s} onClick={() => setState(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </Toggle>
        ))}
      </ControlBar>

      {/* Tall enough for the longest list, so the frame keeps its height
          while the list filters and the page around it never jumps. */}
      <div className="sm:min-h-[60rem]">
        {layout === "default" ? (
          <ReviewSummary
            id="reviews"
            reviews={reviews}
            distribution={distribution}
            loading={state === "loading"}
            action={
              <a
                href="#"
                className="w-fit text-sm underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                Write a review
              </a>
            }
          />
        ) : (
          <ReviewSummary
            reviews={reviews}
            distribution={distribution}
            loading={state === "loading"}
            title="What owners say"
            pageSize={3}
          >
            <div className="grid gap-10 pt-8 md:grid-cols-2">
              <ReviewSummaryScore />
              <ReviewSummaryFit />
            </div>
            <ReviewSummaryHistogram className="mt-8 max-w-md" />
            <ReviewSummaryList className="mt-10" />
          </ReviewSummary>
        )}
      </div>
    </div>
  );
}

/* ─── related-products ───────────────────────────────────────────────── */

export function RelatedProductsDemo() {
  const [loading, setLoading] = React.useState(false);
  const [added, setAdded] = React.useState<string | null>(null);
  return (
    <div>
      <ControlBar>
        <ControlLabel>Data</ControlLabel>
        <Toggle on={!loading} onClick={() => setLoading(false)}>
          Loaded
        </Toggle>
        <Toggle on={loading} onClick={() => setLoading(true)}>
          Loading
        </Toggle>
        <span className="ml-auto font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
          {added ?? "quick-add or save a card"}
        </span>
      </ControlBar>
      <RelatedProducts
        products={CATALOGUE.slice(0, 8)}
        loading={loading}
        onQuickAdd={(product) => setAdded(`added ${product.name}`)}
        cardProps={{
          onWishlistChange: (saved, product) => setAdded(`${saved ? "saved" : "removed"} ${product.name}`),
        }}
      />
    </div>
  );
}
