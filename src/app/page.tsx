import { ArrowDown, ArrowRight, Check } from "lucide-react";

import { InstallCommand } from "@/components/site/copy-button";
import { LiveDemo } from "@/components/site/live-demo";
import { ProductArt } from "@/components/site/product-art";
import { BLOCKS, DESIGN_RULES, STAGES, byStage, shipped } from "@/lib/blocks";
import { cn } from "@/lib/utils";

const NAMESPACE = "npx shadcn@latest registry add @ecomcn=https://ecomcn.dev/r/{name}.json";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 sm:px-8">
      <Hero />
      <Stats />
      <Demo />
      <Catalogue />
      <DesignRules />
      <Install />
    </main>
  );
}

/* ---------------------------------------------------------------- hero --- */

function Hero() {
  return (
    <section className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div>
        <p className="ec-eyebrow flex items-center gap-3 text-brand">
          <span className="h-px w-8 bg-brand" aria-hidden />
          Open-source shadcn/ui registry
        </p>

        <h1 className="ec-display mt-5 text-[clamp(2.75rem,8vw,5.5rem)]">
          The <span className="whitespace-nowrap">e-commerce</span> blocks
          <br />
          <span className="text-brand italic">shadcn doesn&rsquo;t ship.</span>
        </h1>

        <p className="mt-6 max-w-xl text-[15.5px] leading-[1.75] text-muted-foreground">
          shadcn/ui gives you forty primitives and a few dashboard blocks. It has
          never shipped a buy box, a faceted filter panel, or an order summary —
          the three things every store rebuilds from scratch. ecomcn fills
          exactly that gap, and hands you the source.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#blocks"
            className="ec-eyebrow flex items-center gap-2 bg-primary px-5 py-3 text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            Browse the catalogue <ArrowDown className="size-3.5" aria-hidden />
          </a>
          <span className="ec-eyebrow ec-rule flex items-center border px-5 py-3 text-muted-foreground">
            MIT · zero config · source you own
          </span>
        </div>
      </div>

      <div className="ec-rule grid grid-cols-2 gap-px self-start border bg-border">
        {(["chair", "lamp", "tote", "bottle"] as const).map((kind) => (
          <div key={kind} className="ec-grain aspect-square bg-background">
            <ProductArt kind={kind} className="size-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- stats --- */

function Stats() {
  const facts = [
    { k: String(shipped.length), v: "blocks shipped", accent: true },
    { k: String(BLOCKS.length), v: "specified for v1" },
    { k: "5", v: "funnel stages" },
    { k: "1", v: "command to install any of them" },
  ];
  return (
    <section className="ec-rule grid border-t border-l sm:grid-cols-2 lg:grid-cols-4">
      {facts.map((f) => (
        <div key={f.v} className="ec-rule border-r border-b p-6">
          <p
            className={cn(
              "ec-display ec-num text-5xl",
              f.accent ? "text-brand" : "text-foreground",
            )}
          >
            {f.k}
          </p>
          <p className="ec-eyebrow mt-2 text-muted-foreground">{f.v}</p>
        </div>
      ))}
    </section>
  );
}

/* ---------------------------------------------------------------- demo --- */

function Demo() {
  return (
    <section className="py-20">
      <header className="ec-rule-strong mb-8 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="ec-eyebrow text-brand">Running, not screenshotted</p>
          <h2 className="ec-display mt-2 text-4xl sm:text-5xl">
            Three shipped blocks, wired together
          </h2>
        </div>
        <p className="max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
          Quick-add is keyboard reachable. The promo code is{" "}
          <code className="ec-rule border px-1 py-px font-mono text-[12px] text-foreground">
            ARCHIVE20
          </code>{" "}
          — anything else returns an inline error.
        </p>
      </header>

      <div className="ec-rule border p-5 sm:p-8">
        <LiveDemo />
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- catalogue --- */

function Catalogue() {
  return (
    <section id="blocks" className="scroll-mt-20 py-6">
      <header className="ec-rule-strong border-b pb-5">
        <p className="ec-eyebrow text-brand">The catalogue</p>
        <h2 className="ec-display mt-2 text-5xl sm:text-6xl">
          {BLOCKS.length} blocks, five stages,
          <br />
          one purchase funnel.
        </h2>
        <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
          Organised by the decision a buyer is making — not &ldquo;cards, forms,
          navigation&rdquo;, which is how generic kits are structured and why
          nobody can tell them apart.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {STAGES.map((stage) => (
          <div key={stage.name}>
            <div className="ec-rule mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b pb-2">
              <h3 className="ec-display text-3xl">{stage.name}</h3>
              <p className="max-w-md text-[13px] text-muted-foreground">{stage.blurb}</p>
            </div>

            <ul className="ec-rule grid border-t border-l sm:grid-cols-2 lg:grid-cols-3">
              {byStage(stage.name).map((block) => (
                <li
                  key={block.slug}
                  className="ec-rule flex flex-col gap-2 border-r border-b p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <code className="font-mono text-[12px]">{block.slug}</code>
                    {block.status === "shipped" ? (
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
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- design --- */

function DesignRules() {
  return (
    <section id="design" className="scroll-mt-20 py-20">
      <header className="ec-rule-strong border-b pb-4">
        <p className="ec-eyebrow text-brand">House style</p>
        <h2 className="ec-display mt-2 text-4xl sm:text-5xl">
          Six rules that keep it from looking generated
        </h2>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
          A registry lives or dies on whether the screenshots look like something
          a person decided. Every block holds all six, without exception.
        </p>
      </header>

      <div className="ec-rule mt-px grid border-t border-l sm:grid-cols-2 lg:grid-cols-3">
        {DESIGN_RULES.map((rule) => (
          <article key={rule.n} className="ec-rule border-r border-b p-6">
            <p className="ec-eyebrow ec-num text-brand">{rule.n}</p>
            <h3 className="ec-display mt-3 text-2xl">{rule.title}</h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
              {rule.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- install --- */

function Install() {
  return (
    <section id="install" className="ec-rule-strong scroll-mt-20 border-t py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="ec-eyebrow text-brand">Install</p>
          <h2 className="ec-display mt-2 text-4xl sm:text-5xl">
            Two commands, then it&rsquo;s your code.
          </h2>
          <p className="mt-4 max-w-lg text-[14.5px] leading-[1.75] text-muted-foreground">
            Register the namespace once, then add blocks by name. Nothing is
            installed at runtime — the CLI copies source into your repo and
            resolves the shadcn primitives each block needs.
          </p>

          <div className="mt-6 space-y-2">
            <InstallCommand command={NAMESPACE} />
            <InstallCommand command="npx shadcn@latest add @ecomcn/product-card" />
          </div>

          <a
            href="#blocks"
            className="ec-eyebrow mt-6 inline-flex items-center gap-2 text-foreground underline-offset-4 hover:text-brand hover:underline"
          >
            See what else is in there <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>

        <div>
          <h3 className="ec-display text-3xl">Why a registry, not a package</h3>
          <p className="mt-4 text-[14.5px] leading-[1.75] text-muted-foreground">
            An npm component library forces its API and its styling on you, and
            every customisation becomes a fight with the abstraction. A registry
            hands over source. For e-commerce — where every store needs a
            slightly different buy box, a different tax line, a different size
            grid — that is the only model that survives contact with a real
            store.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              ["States included", "Loading, empty, out-of-stock, undo — the states people forget."],
              ["Accessible by construction", "Keyboard paths for hover affordances, no colour-only state."],
              ["Internationalised pricing", "Intl.NumberFormat and currency props from day one."],
              ["Framework-neutral", "No next/image, no next/link. Paste it into Vite and it compiles."],
            ].map(([title, body]) => (
              <li key={title} className="border-l-2 border-l-brand pl-4">
                <p className="text-[14px]">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
