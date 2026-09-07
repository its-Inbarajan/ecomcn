import Link from "next/link";

import { ThemeToggle } from "@/components/site/theme-toggle";

const NAV = [
  { href: "#blocks", label: "Blocks" },
  { href: "#design", label: "Design" },
  { href: "#install", label: "Install" },
];

export function SiteHeader() {
  return (
    <header className="ec-rule-strong sticky top-0 z-40 border-b bg-background/92 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="ec-display text-3xl leading-none">ecomcn</span>
          <span className="ec-eyebrow hidden text-muted-foreground sm:inline">
            shadcn/ui registry
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="ec-rule hidden items-center gap-px border sm:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="ec-eyebrow px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="https://github.com/ecomcn/ecomcn"
            className="ec-eyebrow ec-rule border px-3 py-2 transition-colors hover:bg-secondary"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="ec-rule-strong mt-24 border-t">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
        <p className="ec-eyebrow text-muted-foreground">
          ecomcn · MIT · built with shadcn/ui
        </p>
        <p className="text-[12px] text-muted-foreground">
          Source you own, not a package you fight.
        </p>
      </div>
    </footer>
  );
}
