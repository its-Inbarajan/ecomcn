import { notFound } from "next/navigation";

import {
  OrderSummaryDemo,
  PriceTagDemo,
  ProductCardDemo,
  ProductGridDemo,
} from "@/demos";
import { BLOCKS } from "@/lib/blocks";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOCKS.filter((b) => b.status === "shipped").map((b) => ({ slug: b.slug }));
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // An explicit switch, not a lookup table: the demos live in a "use client"
  // module, and a server component can render those references but cannot
  // index a plain object of them.
  switch (slug) {
    case "price-tag":
      return <PriceTagDemo />;
    case "product-card":
      return <ProductCardDemo />;
    case "product-grid":
      return <ProductGridDemo />;
    case "order-summary":
      return <OrderSummaryDemo />;
    default:
      notFound();
  }
}
