import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { PRODUCTS } from "@/demos/listing-data";
import { EXAMPLES } from "@/lib/blocks";
import { socialMetadata } from "@/lib/site";

const description =
  "ecomcn blocks composed into whole pages — and a demo store you can shop through, built from nothing else.";

export const metadata: Metadata = {
  title: "Examples",
  description,
  ...socialMetadata("Examples · ecomcn", description),
};

/** Every block that appears in the demo store, counted once. */
const STORE_BLOCKS = new Set([
  ...EXAMPLES.flatMap((e) => e.blocks),
  "order-summary",
  "cart-sheet",
  "cart-line-item",
  "checkout-stepper",
]);

export default function ExamplesIndex() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-12 sm:px-8">
      <header className="ec-rule-strong border-b pb-6">
        <p className="ec-eyebrow text-brand">Examples</p>
        <h1 className="ec-display mt-3 text-5xl sm:text-6xl">The blocks, together.</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          A block on its own shows you its API. These show you what you get: whole
          pages, and a shop you can walk through, made of ecomcn blocks and nothing else.
        </p>
      </header>

      <Link
        href="/demo"
        className="group ec-rule mt-8 grid gap-6 border p-6 transition-colors hover:bg-secondary/50 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
      >
        <div>
          <p className="ec-eyebrow flex items-center gap-2 text-brand">
            <ShoppingBag className="size-3.5" aria-hidden /> Demo store
          </p>
          <h2 className="ec-display mt-3 text-4xl sm:text-5xl group-hover:text-brand">
            Shop it, start to bag.
          </h2>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
            Filter the collection, open any of its {PRODUCTS.length} products,
            pick a colour and a size, add to the bag and apply a code. Built from{" "}
            {STORE_BLOCKS.size} ecomcn blocks — a real route, not a preview frame.
          </p>
        </div>
        <span className="ec-eyebrow flex items-center gap-2 text-foreground">
          Open the demo store
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>

      <section className="mt-12">
        <h2 className="ec-display mb-4 text-3xl">Composed pages</h2>
        <ul className="ec-rule grid border-t border-l md:grid-cols-2">
          {EXAMPLES.map((example) => (
            <li key={example.slug} className="ec-rule border-r border-b">
              <Link
                href={`/examples/${example.slug}`}
                className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-secondary/60"
              >
                <p className="ec-eyebrow text-muted-foreground">{example.stage}</p>
                <p className="ec-display flex items-center gap-2 text-3xl group-hover:text-brand">
                  {example.title} <ArrowRight className="size-4" aria-hidden />
                </p>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">{example.summary}</p>
                <p className="mt-auto pt-2 font-mono text-[11.5px] text-muted-foreground">
                  {example.blocks.length} blocks · {example.blocks.join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
