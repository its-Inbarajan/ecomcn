import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { BLOCKS, EXAMPLES, STAGES, byStage } from "@/lib/blocks";

export const metadata: Metadata = {
  title: "Blocks",
  description: `All ${BLOCKS.length} ecomcn blocks, organised by the decision a buyer is making — from landing surface to order tracking.`,
};

export default function BlocksIndex() {
  const shipped = BLOCKS.filter((b) => b.status === "shipped").length;

  return (
    <main className="mx-auto w-full max-w-925 flex-1 px-5 py-12 sm:px-8">
      <header className="ec-rule-strong border-b pb-5">
        <p className="ec-eyebrow text-brand">The catalogue</p>
        <h1 className="ec-display mt-3 text-5xl sm:text-6xl">
          {BLOCKS.length} blocks, five stages,
          <br />
          one purchase funnel.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {shipped} are installable today; the rest are specified and waiting.
          Every one maps to a decision a buyer makes — that is how you find the
          block for the problem you actually have.
        </p>
      </header>

      <div className="mt-10 space-y-14">
        {STAGES.map((stage) => (
          <section key={stage.name}>
            <div className="ec-rule mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b pb-2">
              <h2 className="ec-display text-3xl">{stage.name}</h2>
              <p className="max-w-md text-[13px] text-muted-foreground">
                {stage.blurb}
              </p>
            </div>

            {EXAMPLES.filter((e) => e.stage === stage.name).map((example) => (
              <Link
                key={example.slug}
                href={`/examples/${example.slug}`}
                className="group mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-l-2 border-l-brand py-1 pl-4"
              >
                <span>
                  <span className="ec-eyebrow text-brand">Composed example</span>
                  <span className="ec-display ml-3 text-2xl group-hover:text-brand">
                    {example.title}
                  </span>
                </span>
                <span className="ec-eyebrow flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground">
                  {example.blocks.length} blocks, one page <ArrowRight className="size-3" aria-hidden />
                </span>
              </Link>
            ))}

            <ul className="ec-rule grid border-t border-l sm:grid-cols-2 lg:grid-cols-3">
              {byStage(stage.name).map((block) => {
                const live = block.status === "shipped";
                const body = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <code className="font-mono text-[12px]">
                        {block.slug}
                      </code>
                      {live ? (
                        <span className="ec-eyebrow flex shrink-0 items-center gap-1 text-success">
                          <Check className="size-3" aria-hidden /> Shipped
                        </span>
                      ) : (
                        <span className="ec-eyebrow shrink-0 text-muted-foreground">
                          Planned
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {block.summary}
                    </p>
                    {live && (
                      <p className="ec-eyebrow mt-auto flex items-center gap-1.5 pt-1 text-brand">
                        Read the docs{" "}
                        <ArrowRight className="size-3" aria-hidden />
                      </p>
                    )}
                  </>
                );

                return (
                  <li key={block.slug} className="ec-rule border-r border-b">
                    {live ? (
                      <Link
                        href={`/blocks/${block.slug}`}
                        className="flex h-full flex-col gap-2 p-4 transition-colors hover:bg-secondary/60"
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="flex h-full flex-col gap-2 p-4">
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
