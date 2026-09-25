import { notFound } from "next/navigation";

import {
  OrderSummaryDemo,
  PriceTagDemo,
  ProductCardDemo,
  ProductGridDemo,
} from "@/demos";
import {
  EmptyResultsDemo,
  FilterPanelDemo,
  FilterSheetDemo,
  ListingPageDemo,
  LoadMoreDemo,
  ProductQuickViewDemo,
  SortToolbarDemo,
} from "@/demos/browse";
import { BLOCKS, EXAMPLES } from "@/lib/blocks";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...BLOCKS.filter((b) => b.status === "shipped").map((b) => ({ slug: b.slug })),
    ...EXAMPLES.map((e) => ({ slug: e.slug })),
  ];
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
    case "sort-toolbar":
      return <SortToolbarDemo />;
    case "empty-results":
      return <EmptyResultsDemo />;
    case "filter-panel":
      return <FilterPanelDemo />;
    case "filter-sheet":
      return <FilterSheetDemo />;
    case "load-more":
      return <LoadMoreDemo />;
    case "product-quick-view":
      return <ProductQuickViewDemo />;
    case "order-summary":
      return <OrderSummaryDemo />;
    case "listing-page":
      return <ListingPageDemo />;
    default:
      notFound();
  }
}
