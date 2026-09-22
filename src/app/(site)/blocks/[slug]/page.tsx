import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

import { BlockPreview } from "@/components/site/block-preview";
import { CodeViewer } from "@/components/site/code-viewer";
import { InstallSteps } from "@/components/site/install-steps";
import { BLOCKS } from "@/lib/blocks";
import { extractPropsInterfaces, loadRegistryItem } from "@/lib/registry-source";

export const dynamicParams = false;

const shipped = BLOCKS.filter((b) => b.status === "shipped");

export function generateStaticParams() {
  return shipped.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const block = shipped.find((b) => b.slug === slug);
  if (!block) return {};
  return {
    title: block.title,
    description: block.summary,
    openGraph: { title: `${block.title} · ecomcn`, description: block.summary },
  };
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const block = shipped.find((b) => b.slug === slug);
  const item = loadRegistryItem(slug);
  if (!block || !item) notFound();

  const index = shipped.findIndex((b) => b.slug === slug);
  const previous = shipped[index - 1];
  const next = shipped[index + 1];

  const props = item.files.flatMap((file) => extractPropsInterfaces(file.content));

  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-12 sm:px-8">
      <Link
        href="/blocks"
        className="ec-eyebrow inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> All blocks
      </Link>

      <header className="ec-rule-strong mt-5 border-b pb-5">
        <p className="ec-eyebrow flex flex-wrap items-center gap-2 text-brand">
          {block.stage}
          <span className="text-muted-foreground opacity-50">/</span>
          <span className="text-muted-foreground">{item.type.replace("registry:", "")}</span>
        </p>
        <h1 className="ec-display mt-3 text-5xl sm:text-6xl">{block.title}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-10">
          <InstallSteps
            slug={slug}
            needsNamespace={item.registryDependencies.some((dep) =>
              dep.startsWith("@ecomcn/"),
            )}
          />

          <BlockPreview slug={slug} title={block.title} />

          {props.length > 0 && (
            <section>
              <h2 className="ec-display mb-3 text-3xl">Props</h2>
              <p className="mb-4 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
                Read straight out of the source at build time, so this cannot
                drift from the file you install.
              </p>
              <div className="space-y-4">
                {props.map((p) => (
                  <CodeViewer key={p.name} label={p.name} code={p.body} maxHeight="24rem" />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="ec-display mb-4 text-3xl">Source</h2>
            <div className="space-y-4">
              {item.files.map((file) => (
                <CodeViewer key={file.path} label={file.displayPath} code={file.content} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          {block.designNote && (
            <Note label="Design decision" body={block.designNote} />
          )}
          {block.hardPart && <Note label="The hard part" body={block.hardPart} accent />}

          <Meta label="Registry dependencies">
            {item.registryDependencies.length === 0 ? (
              <span className="text-[13px] text-muted-foreground">None</span>
            ) : (
              <ul className="space-y-1.5">
                {item.registryDependencies.map((dep) => {
                  const local = dep.replace("@ecomcn/", "");
                  const isOurs = dep.startsWith("@ecomcn/");
                  return (
                    <li key={dep}>
                      {isOurs && shipped.some((b) => b.slug === local) ? (
                        <Link
                          href={`/blocks/${local}`}
                          className="font-mono text-[12px] text-brand underline-offset-4 hover:underline"
                        >
                          {dep}
                        </Link>
                      ) : (
                        <code className="font-mono text-[12px] text-muted-foreground">{dep}</code>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Meta>

          <Meta label="npm dependencies">
            {item.dependencies.length === 0 ? (
              <span className="text-[13px] text-muted-foreground">None</span>
            ) : (
              <ul className="space-y-1.5">
                {item.dependencies.map((dep) => (
                  <li key={dep} className="font-mono text-[12px] text-muted-foreground">
                    {dep}
                  </li>
                ))}
              </ul>
            )}
          </Meta>

          <Meta label="Installs to">
            <ul className="space-y-1.5">
              {item.files.map((file) => (
                <li key={file.path} className="font-mono text-[12px] break-all text-muted-foreground">
                  {file.target ?? file.path}
                </li>
              ))}
            </ul>
          </Meta>

          <a
            href={`/r/${slug}.json`}
            className="ec-eyebrow inline-flex items-center gap-1.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Registry JSON <ExternalLink className="size-3" aria-hidden />
          </a>
        </aside>
      </div>

      <nav className="ec-rule-strong mt-16 grid gap-px border-t pt-5 sm:grid-cols-2">
        {previous ? (
          <Link href={`/blocks/${previous.slug}`} className="group">
            <p className="ec-eyebrow text-muted-foreground">Previous</p>
            <p className="ec-display mt-1 text-2xl group-hover:text-brand">{previous.title}</p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/blocks/${next.slug}`} className="group sm:text-right">
            <p className="ec-eyebrow text-muted-foreground">Next</p>
            <p className="ec-display mt-1 flex items-center gap-2 text-2xl group-hover:text-brand sm:justify-end">
              {next.title} <ArrowRight className="size-4" aria-hidden />
            </p>
          </Link>
        )}
      </nav>
    </main>
  );
}

function Note({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? "border-l-2 border-l-brand pl-4" : "ec-rule border-l-2 pl-4"}>
      <p className={`ec-eyebrow mb-2 ${accent ? "text-brand" : "text-muted-foreground"}`}>
        {label}
      </p>
      <p className="text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ec-rule border-t pt-4">
      <p className="ec-eyebrow mb-2.5 text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
