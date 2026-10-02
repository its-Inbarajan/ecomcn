"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { animate, useReducedMotion, type AnimationPlaybackControls } from "motion/react";

import { GitHubButton, HEADER_BUTTON } from "@/components/site/github-button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BLOCKS, EXAMPLES } from "@/lib/blocks";
import { cn } from "@/lib/utils";

/** The house settle curve — the same one every ecomcn morph uses. */
const MORPH = { duration: 0.45, ease: [0.2, 0, 0, 1] } as const;

export type NavItem = { href: string; label: string };

const SHIPPED = BLOCKS.filter((b) => b.status === "shipped");

type MorphState = {
  origin: React.RefObject<HTMLElement | null>;
  closing: boolean;
  finishClose: () => void;
};

/**
 * The site menu below the sm breakpoint: a full-screen Sheet that grows out
 * of the menu button as a circle and shrinks back into it. The Sheet's own
 * slide keyframes are off; Motion plays the open and the close, and the Sheet
 * stays open until the close has played. Reduced motion gets a fade.
 */
export function MobileNav({ nav, stars }: { nav: NavItem[]; stars: number | null }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // `open` is what the visitor asked for; `mounted` keeps the Sheet on screen
  // while the close animation plays.
  const [mounted, setMounted] = React.useState(false);
  if (open && !mounted) setMounted(true);
  const closing = mounted && !open;

  // A link to another page closes the menu once the route has changed.
  const [path, setPath] = React.useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setOpen(false);
  }

  const origin = React.useRef<HTMLSpanElement>(null);
  const finishClose = React.useCallback(() => setMounted(false), []);
  const morph = React.useMemo(() => ({ origin, closing, finishClose }), [closing, finishClose]);

  const isCurrent = (href: string) => !href.includes("#") && pathname === href;

  return (
    <Sheet
      open={mounted}
      onOpenChange={(next) => {
        if (next !== open) setOpen(next);
      }}
    >
      <SheetTrigger aria-label="Open menu" className={cn(HEADER_BUTTON, "w-9 px-0 sm:hidden")}>
        <span ref={origin} className="grid place-items-center">
          <Menu className="size-4" aria-hidden />
        </span>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        // Full width, every breakpoint. The primitive positions the panel and
        // traps focus; its keyframes are switched off so Motion owns the open.
        className="w-full gap-0 border-0 bg-transparent p-0 shadow-none animate-none! transition-none! sm:max-w-none"
      >
        <MorphPanel {...morph}>
          <div className="ec-rule-strong flex h-15 shrink-0 items-center justify-between gap-4 border-b px-5">
            <SheetTitle className="ec-display text-3xl leading-none font-normal">ecomcn</SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
            {/* Where the menu button was, so the circle closes back into it. */}
            <SheetClose aria-label="Close menu" className={cn(HEADER_BUTTON, "w-9 px-0")}>
              <X className="size-4" aria-hidden />
            </SheetClose>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <nav aria-label="Main" className="px-5 pt-4">
              <ul>
                {[...nav, ...EXAMPLES.map((e) => ({ href: `/examples/${e.slug}`, label: e.title }))].map(
                  (item) => (
                    <li key={item.href} className="ec-rule border-b">
                      <Link
                        href={item.href}
                        aria-current={isCurrent(item.href) ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-brand"
                      >
                        <span className="ec-display text-4xl">{item.label}</span>
                        <ArrowUpRight
                          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <section aria-labelledby="mobile-nav-shipped" className="px-5 pt-8 pb-6">
              <p id="mobile-nav-shipped" className="ec-eyebrow text-muted-foreground">
                Shipped blocks · {SHIPPED.length}
              </p>
              <ul className="ec-rule mt-3 grid grid-cols-2 border-t border-l">
                {SHIPPED.map((block) => (
                  <li key={block.slug} className="ec-rule border-r border-b">
                    <Link
                      href={`/blocks/${block.slug}`}
                      aria-current={pathname === `/blocks/${block.slug}` ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="block truncate px-3 py-2.5 font-mono text-[12px] outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset aria-[current=page]:bg-secondary"
                    >
                      {block.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="ec-rule-strong flex shrink-0 items-center justify-between gap-3 border-t px-5 py-4">
            <GitHubButton stars={stars} showLabel="always" />
            <ThemeToggle />
          </div>
        </MorphPanel>
      </SheetContent>
    </Sheet>
  );
}

/**
 * The visible surface. Rendered inside the portal and animated from a layout
 * effect, so its first frame is already clipped to the button — it never
 * flashes full screen before the circle starts growing.
 */
function MorphPanel({ origin, closing, finishClose, children }: MorphState & { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const surface = React.useRef<HTMLDivElement>(null);
  const contents = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const panel = surface.current;
    const inner = contents.current;
    if (!panel || !inner) return;
    const overlay = panel
      .closest<HTMLElement>('[data-slot="sheet-content"]')
      ?.parentElement?.querySelector<HTMLElement>(':scope > [data-slot="sheet-overlay"]');
    const running: AnimationPlaybackControls[] = [];
    let cancelled = false;

    // A circle centred on the menu button, from nothing to past the far corner.
    const at = () => {
      const r = origin.current?.getBoundingClientRect();
      return r ? `${r.left + r.width / 2}px ${r.top + r.height / 2}px` : "100% 0%";
    };
    const full = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight));

    if (!closing) {
      if (reduce) {
        panel.style.opacity = "0";
        running.push(animate(panel, { opacity: [0, 1] }, { duration: 0.15 }));
      } else {
        const center = at();
        panel.style.clipPath = `circle(0px at ${center})`;
        inner.style.opacity = "0";
        running.push(
          animate(panel, { clipPath: [`circle(0px at ${center})`, `circle(${full}px at ${center})`] }, MORPH),
          animate(inner, { opacity: 1 }, { duration: 0.25, delay: 0.15, ease: "easeOut" }),
        );
      }
      return () => {
        cancelled = true;
        running.forEach((a) => a.stop());
      };
    }

    if (reduce) {
      running.push(animate(panel, { opacity: 0 }, { duration: 0.15 }));
    } else {
      const center = at();
      running.push(
        animate(inner, { opacity: 0 }, { duration: 0.12, ease: "easeIn" }),
        animate(panel, { clipPath: `circle(0px at ${center})` }, { ...MORPH, duration: 0.38, delay: 0.06 }),
      );
    }
    if (overlay) running.push(animate(overlay, { opacity: 0 }, { duration: 0.3, delay: 0.1 }));

    // Should a frame never come (a background tab), close anyway.
    const fallback = window.setTimeout(() => !cancelled && finishClose(), 800);
    Promise.all(running.map((a) => a.finished)).then(() => {
      window.clearTimeout(fallback);
      if (!cancelled) finishClose();
    });
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      running.forEach((a) => a.stop());
    };
    // Runs on open and on close; `reduce` is read, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  return (
    <div ref={surface} data-slot="mobile-nav-panel" className="flex h-dvh w-full flex-col bg-background text-foreground">
      <div ref={contents} className="flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
