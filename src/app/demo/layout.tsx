import type { Metadata } from "next";

import { DemoBar, StoreHeader } from "@/demos/store";
import { socialMetadata } from "@/lib/site";

const description =
  "A small shop built from nothing but ecomcn blocks: a filterable listing, a product page for every product, and a bag.";

export const metadata: Metadata = {
  title: "Demo store",
  description,
  ...socialMetadata("Demo store · ecomcn", description),
};

/**
 * The demo store sits outside the docs layout: no site header, no smooth
 * scrolling — a shop, as a shopper would see it, with a thin bar saying what
 * it is made of.
 */
export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <DemoBar />
      <StoreHeader />
      <main className="mx-auto w-full max-w-295 flex-1 px-5 py-10 sm:px-8">{children}</main>
      <footer className="ec-rule mt-16 border-t">
        <p className="mx-auto max-w-295 px-5 py-8 text-[12px] text-muted-foreground sm:px-8">
          A demo: no payments, no accounts — your bag lives in this browser. Photos from Unsplash.
        </p>
      </footer>
    </>
  );
}
