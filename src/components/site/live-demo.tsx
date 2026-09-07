"use client";

import * as React from "react";

import { ProductCard, type ProductCardProduct } from "@/components/ecomcn/product-card";
import { OrderSummary } from "@/components/ecomcn/order-summary";
import { ProductArt, type ArtKind } from "@/components/site/product-art";

const art = (kind: ArtKind) => (
  <ProductArt kind={kind} className="size-full transition-transform duration-700 group-hover:scale-[1.04]" />
);

const PRODUCTS: (ProductCardProduct & { art: ArtKind })[] = [
  {
    id: "p1",
    name: "Field Tote 24L",
    href: "#",
    brand: "Aarhus Supply",
    price: 195,
    compareAt: 240,
    rating: 4.7,
    reviewCount: 1022,
    art: "tote",
    colors: [
      { name: "Canvas", hex: "#cbbfa6" },
      { name: "Olive", hex: "#5d6446" },
      { name: "Black", hex: "#1c1b1a" },
    ],
  },
  {
    id: "p2",
    name: "Ora Table Lamp",
    href: "#",
    brand: "Mensa",
    price: 310,
    badge: "New",
    rating: 4.4,
    reviewCount: 431,
    art: "lamp",
    colors: [
      { name: "Chalk", hex: "#e7e3da" },
      { name: "Ink", hex: "#232120" },
      { name: "Sage", hex: "#7d8b7a" },
    ],
  },
  {
    id: "p3",
    name: "Kiln Mug, Set of 4",
    href: "#",
    brand: "Mira Studio",
    price: 84,
    rating: 4.8,
    reviewCount: 596,
    art: "mug",
    colors: [
      { name: "Terracotta", hex: "#b5563a" },
      { name: "Bone", hex: "#e2dbcd" },
    ],
  },
];

/** Not a screenshot — these are the installed blocks, running. */
export function LiveDemo() {
  const [bag, setBag] = React.useState<{ id: string; unitPrice: number; quantity: number }[]>([
    { id: "p1", unitPrice: 195, quantity: 1 },
  ]);
  const [code, setCode] = React.useState<string | null>(null);

  const addToBag = (product: ProductCardProduct) =>
    setBag((lines) => {
      const found = lines.find((l) => l.id === product.id);
      return found
        ? lines.map((l) => (l.id === product.id ? { ...l, quantity: l.quantity + 1 } : l))
        : [...lines, { id: product.id, unitPrice: product.price, quantity: 1 }];
    });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3">
        {PRODUCTS.map(({ art: kind, ...product }) => (
          <ProductCard
            key={product.id}
            product={{ ...product, image: art(kind) }}
            onQuickAdd={addToBag}
          />
        ))}
      </div>

      <OrderSummary
        lines={bag}
        freeShippingThreshold={300}
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
