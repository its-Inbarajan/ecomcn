"use client";

import * as React from "react";

import { PriceTag } from "@/components/ecomcn/price-tag";
import {
  ProductCard,
  ProductCardBody,
  ProductCardBrand,
  ProductCardImage,
  ProductCardMedia,
  ProductCardPrice,
  ProductCardQuickAdd,
  ProductCardSwatches,
  ProductCardTitle,
  useProductCard,
} from "@/components/ecomcn/product-card";
import { ProductGrid } from "@/components/ecomcn/product-grid";
import { OrderSummary } from "@/components/ecomcn/order-summary";
import { Labelled, Toggle } from "@/demos/controls";
import { PRODUCTS } from "@/demos/listing-data";

/**
 * Demo fixtures for the preview routes. Deliberately not part of any registry
 * item — adopters get the block, never our sample data.
 */

/** The first six products of the Browse catalogue, photos included. */
const GRID = PRODUCTS.slice(0, 6);

export function PriceTagDemo() {
  return (
    <div className="flex flex-wrap items-end gap-x-12 gap-y-8">
      <Labelled label="Regular">
        <PriceTag price={310} />
      </Labelled>
      <Labelled label="Marked down">
        <PriceTag price={195} compareAt={240} />
      </Labelled>
      <Labelled label="Small / inline">
        <PriceTag price={128} compareAt={165} size="sm" />
      </Labelled>
      <Labelled label="Euro, de-DE">
        <PriceTag price={1240.5} currency="EUR" locale="de-DE" />
      </Labelled>
      <Labelled label="Rupee, en-IN">
        <PriceTag price={8499} currency="INR" locale="en-IN" />
      </Labelled>
    </div>
  );
}


/** A custom part: reads the shared colour through useProductCard(). */
function ColourName() {
  const { product, color } = useProductCard();
  if (!color) return null;
  return (
    <p className="mt-2 text-[12px] text-muted-foreground">
      {color.name}
      <span className="opacity-60"> · {product.colors?.length} colourways</span>
    </p>
  );
}

export function ProductCardDemo() {
  const [a, b] = [PRODUCTS[0], PRODUCTS[1]];
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-2 gap-x-5 gap-y-9">
      <div>
        <p className="ec-eyebrow mb-3 text-muted-foreground">Default — one tag</p>
        <ProductCard product={a} onQuickAdd={() => {}} />
      </div>
      <div>
        <p className="ec-eyebrow mb-3 text-muted-foreground">Composed from parts</p>
        <ProductCard product={b} onQuickAdd={() => {}}>
          <ProductCardMedia>
            <ProductCardImage />
            <ProductCardQuickAdd />
          </ProductCardMedia>
          <ProductCardBody>
            <ProductCardTitle className="text-base" />
            <ProductCardBrand className="mt-1" />
            <ColourName />
            <ProductCardSwatches className="mt-2" />
            <ProductCardPrice className="mt-3" />
          </ProductCardBody>
        </ProductCard>
      </div>
      <p className="col-span-2 text-[12.5px] leading-relaxed text-muted-foreground">
        Pick a swatch: the image changes with it. The swatches and the image are
        separate parts that never talk to each other — both read the selected
        colour from the card&apos;s context.
      </p>
    </div>
  );
}

export function ProductGridDemo() {
  const [mode, setMode] = React.useState<"default" | "loading" | "empty">("default");
  const [density, setDensity] = React.useState<"comfortable" | "compact">("comfortable");

  return (
    <div>
      <div className="ec-rule mb-6 flex flex-wrap items-center gap-2 border-b pb-3">
        <span className="ec-eyebrow mr-1 text-muted-foreground">State</span>
        {(["default", "loading", "empty"] as const).map((m) => (
          <Toggle key={m} on={mode === m} onClick={() => setMode(m)}>
            {m}
          </Toggle>
        ))}
        <span className="ec-eyebrow mr-1 ml-4 text-muted-foreground">Density</span>
        {(["comfortable", "compact"] as const).map((d) => (
          <Toggle key={d} on={density === d} onClick={() => setDensity(d)}>
            {d}
          </Toggle>
        ))}
      </div>

      <ProductGrid
        products={mode === "empty" ? [] : GRID}
        loading={mode === "loading"}
        density={density}
        onQuickAdd={() => {}}
        onResetFilters={() => setMode("default")}
      />
    </div>
  );
}


export function OrderSummaryDemo() {
  const [code, setCode] = React.useState<string | null>(null);
  return (
    <div className="mx-auto max-w-sm">
      <OrderSummary
        lines={[
          { id: "p1", unitPrice: 195, quantity: 1 },
          { id: "p3", unitPrice: 84, quantity: 2 },
        ]}
        freeShippingThreshold={400}
        flatShipping={18}
        taxRate={0.08}
        appliedCode={code}
        discountRate={0.2}
        onApplyCode={(entered) => {
          if (entered !== "ARCHIVE20") throw new Error("That code isn't valid.");
          setCode(entered);
        }}
        onRemoveCode={() => setCode(null)}
      />
    </div>
  );
}
