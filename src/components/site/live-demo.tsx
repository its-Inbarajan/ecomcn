"use client";

import * as React from "react";

import { ProductCard, type ProductCardProduct } from "@/components/ecomcn/product-card";
import { OrderSummary } from "@/components/ecomcn/order-summary";
import { PRODUCTS as CATALOGUE } from "@/demos/listing-data";

/** A tote, a lamp and a mug from the demo catalogue — photos and colourways included. */
const PRODUCTS = CATALOGUE.slice(0, 3);

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
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} onQuickAdd={addToBag} />
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
