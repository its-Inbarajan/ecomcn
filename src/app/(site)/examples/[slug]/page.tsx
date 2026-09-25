import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlockPreview } from "@/components/site/block-preview";
import { InstallCommand } from "@/components/site/copy-button";
import { BLOCKS, EXAMPLES } from "@/lib/blocks";
import { NAMESPACE, registerCommand, socialMetadata } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return EXAMPLES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const example = EXAMPLES.find((e) => e.slug === slug);
  if (!example) return {};
  return {
    title: example.title,
    description: example.summary,
    ...socialMetadata(`${example.title} · ecomcn`, example.summary),
  };
}

export default async function ExamplePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const example = EXAMPLES.find((e) => e.slug === slug);
  if (!example) notFound();

  const blocks = example.blocks
    .map((s) => BLOCKS.find((b) => b.slug === s))
    .filter((b) => b !== undefined);

  // Registry dependencies pull the rest in: filter-sheet brings filter-panel,
  // product-grid and product-quick-view bring product-card and price-tag.
  const install = `npx shadcn@latest add ${["sort-toolbar", "filter-sheet", "product-grid", "product-quick-view", "load-more", "empty-results"]
    .map((s) => `${NAMESPACE}/${s}`)
    .join(" ")}`;

  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-12 sm:px-8">
      <Link
        href="/blocks"
        className="ec-eyebrow inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> All blocks
      </Link>

      <header className="ec-rule-strong mt-5 grid gap-6 border-b pb-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="ec-eyebrow text-brand">{example.stage} / composed example</p>
          <h1 className="ec-display mt-3 text-5xl sm:text-6xl">{example.title}</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {example.summary}
          </p>
        </div>
        <div className="space-y-3 self-end">
          <InstallCommand command={registerCommand} />
          <InstallCommand command={install} />
        </div>
      </header>

      <div className="mt-8">
        <BlockPreview slug={example.slug} title={example.title} />
      </div>

      <section className="mt-12">
        <h2 className="ec-display mb-4 text-3xl">What it is made of</h2>
        <ul className="ec-rule grid border-t border-l sm:grid-cols-2 lg:grid-cols-4">
          {blocks.map((block) => (
            <li key={block.slug} className="ec-rule border-r border-b">
              <Link
                href={`/blocks/${block.slug}`}
                className="flex h-full flex-col gap-2 p-4 transition-colors hover:bg-secondary/60"
              >
                <code className="font-mono text-[12px]">{block.slug}</code>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{block.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          Try it at the mobile width: the sidebar panel gives way to the filter
          sheet, which stages changes and applies them once. Every filter — and
          how many pages are loaded — is in the preview frame&apos;s URL, and the
          browser&apos;s Back button undoes filters one at a time. Open a quick view
          to see the card image morph into the dialog.
        </p>
      </section>
    </main>
  );
}
