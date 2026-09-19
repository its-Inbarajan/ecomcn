"use client";

import * as React from "react";

import { PriceTag } from "@/components/ecomcn/price-tag";
import { ProductCard, type ProductCardProduct } from "@/components/ecomcn/product-card";
import { ProductGrid } from "@/components/ecomcn/product-grid";
import { OrderSummary } from "@/components/ecomcn/order-summary";
import { ProductArt, type ArtKind } from "@/components/site/product-art";

/**
 * Demo fixtures for the preview routes. Deliberately not part of any registry
 * item — adopters get the block, never our sample data.
 */

const art = (kind: ArtKind) => (
  <ProductArt
    kind={kind}
    className="size-full transition-transform duration-700 group-hover:scale-[1.04]"
  />
);

const CATALOGUE: (Omit<ProductCardProduct, "image"> & { art: ArtKind })[] = [
  {
    id: "p1", name: "Field Tote 24L", href: "#", brand: "Aarhus Supply",
    price: 195, compareAt: 240, rating: 4.7, reviewCount: 1022, art: "tote",
    colors: [
      { name: "Canvas", hex: "#cbbfa6" },
      { name: "Olive", hex: "#5d6446" },
      { name: "Black", hex: "#1c1b1a" },
    ],
  },
  {
    id: "p2", name: "Ora Table Lamp", href: "#", brand: "Mensa",
    price: 310, badge: "New", rating: 4.4, reviewCount: 431, art: "lamp",
    colors: [
      { name: "Chalk", hex: "#e7e3da" },
      { name: "Ink", hex: "#232120" },
      { name: "Sage", hex: "#7d8b7a" },
    ],
  },
  {
    id: "p3", name: "Kiln Mug, Set of 4", href: "#", brand: "Mira Studio",
    price: 84, rating: 4.8, reviewCount: 596, art: "mug",
    colors: [
      { name: "Terracotta", hex: "#b5563a" },
      { name: "Bone", hex: "#e2dbcd" },
    ],
  },
  {
    id: "p4", name: "Vester Chelsea Boot", href: "#", brand: "Lindqvist",
    price: 420, badge: "Restocked", rating: 4.5, reviewCount: 307, art: "boot",
    colors: [
      { name: "Espresso", hex: "#4a332a" },
      { name: "Black", hex: "#1c1b1a" },
    ],
  },
  {
    id: "p5", name: "Bellwether Carafe", href: "#", brand: "Nordhaus",
    price: 128, compareAt: 165, rating: 4.6, reviewCount: 214, art: "bottle",
    colors: [
      { name: "Smoke", hex: "#6b6a66" },
      { name: "Amber", hex: "#b4762f" },
    ],
  },
  {
    id: "p6", name: "Halden Lounge Chair", href: "#", brand: "Verk",
    price: 1240, rating: 4.9, reviewCount: 88, art: "chair",
    colors: [
      { name: "Oak", hex: "#c8a173" },
      { name: "Walnut", hex: "#5b3d28" },
    ],
  },
];

const withImages = CATALOGUE.map(({ art: kind, ...p }) => ({ ...p, image: art(kind) }));

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

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="ec-eyebrow mb-3 text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function ProductCardDemo() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-2 gap-x-5 gap-y-9">
      {withImages.slice(0, 2).map((product) => (
        <ProductCard key={product.id} product={product} onQuickAdd={() => {}} />
      ))}
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
        products={mode === "empty" ? [] : withImages}
        loading={mode === "loading"}
        density={density}
        onQuickAdd={() => {}}
        onResetFilters={() => setMode("default")}
      />
    </div>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={
        "ec-eyebrow ec-rule border px-2.5 py-1.5 transition-colors " +
        (on ? "bg-primary text-primary-foreground" : "hover:bg-secondary")
      }
    >
      {children}
    </button>
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
