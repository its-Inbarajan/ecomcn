import Link from "next/link";

import { GitHubButton, HEADER_BUTTON } from "@/components/site/github-button";
import { MobileNav, type NavItem } from "@/components/site/mobile-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { getRepoStars } from "@/lib/github";

const NAV: NavItem[] = [
  { href: "/blocks", label: "Blocks" },
  { href: "/examples", label: "Examples" },
  { href: "/demo", label: "Demo store" },
  { href: "/#install", label: "Install" },
];

/**
 * Fixed, not sticky: the page below scrolls inside ScrollSmoother, which
 * moves its content with a transform, and sticky stops working there. The
 * layout pads the content by the header's height (h-15) instead.
 */
export async function SiteHeader() {
  const stars = await getRepoStars();

  return (
    <header className="ec-rule-strong fixed inset-x-0 top-0 z-40 h-15 border-b bg-background/92 backdrop-blur">
      <div className="mx-auto flex h-full max-w-295 items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="ec-display text-3xl leading-none">ecomcn</span>
          <span className="ec-eyebrow hidden text-muted-foreground lg:inline">
            shadcn/ui registry
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={HEADER_BUTTON}>
                {item.label}
              </Link>
            ))}
          </nav>
          <GitHubButton stars={stars} />
          <ThemeToggle />
          <MobileNav nav={NAV} stars={stars} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="ec-rule-strong mt-24 border-t">
      <div className="mx-auto flex max-w-295 flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
        <p className="ec-eyebrow text-muted-foreground">
          ecomcn · MIT · built with shadcn/ui
        </p>
        <p className="text-[12px] text-muted-foreground">
          Source you own, not a package you fight. Demo photos from{" "}
          <a
            href="https://unsplash.com/license"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Unsplash
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
