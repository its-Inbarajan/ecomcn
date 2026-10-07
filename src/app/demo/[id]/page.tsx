import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PRODUCTS } from "@/demos/listing-data";
import { StoreProduct } from "@/demos/store";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  return product ? { title: `${product.name} · Demo store` } : {};
}

export default async function DemoProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!PRODUCTS.some((p) => p.id === id)) notFound();
  return <StoreProduct id={id} />;
}
