"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, CustomEase);

/** The house settle curve, [0.2, 0, 0, 1], as a GSAP ease. */
const SETTLE = CustomEase.create("ecomcn-settle", "M0,0 C0.2,0 0,1 1,1");

/** The fixed header's height (h-15) plus breathing room above a jump target. */
const HEADER_OFFSET = 76;

/**
 * Smooth scrolling and scroll-triggered reveals for the site — never for the
 * blocks. Every block demo runs in an iframe (/preview/[slug]) with its own
 * document, which this never reaches; the home page's inline demo only uses
 * CSS transitions. Reveals touch only elements marked `data-reveal`.
 *
 * ScrollSmoother runs only with a fine pointer and no reduced-motion
 * preference. Touch keeps native momentum scrolling, and reduced motion keeps
 * plain scrolling with no reveals.
 *
 * Three things ScrollSmoother would otherwise break, handled here:
 * - `position: sticky` inside the moved content: `data-smooth-pin` elements
 *   are pinned with ScrollTrigger instead (from lg up, like the aside's
 *   `lg:sticky`). The value is the top offset in px.
 * - In-page links (#install): they glide to the target, clear of the header.
 * - Focus and find-in-page: both scroll the overflow-hidden wrapper to bring
 *   a match into view; that scroll is handed over to the smoother instead.
 */
export function SmoothScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const wrapper = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const smoother = React.useRef<ScrollSmoother | null>(null);
  const pathname = usePathname();

  // Created once: the site layout, and so the smoother, outlives navigations.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const w = wrapper.current!;
      const s = ScrollSmoother.create({
        wrapper: w,
        content: content.current!,
        smooth: 0.9,
        smoothTouch: false,
        effects: false,
      });
      smoother.current = s;

      const onWrapperScroll = () => {
        const delta = w.scrollTop;
        if (!delta) return;
        w.scrollTop = 0;
        s.scrollTo(s.scrollTop() + delta, false);
      };
      w.addEventListener("scroll", onWrapperScroll);

      const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
        const link = (event.target as Element | null)?.closest?.("a[href]");
        if (!(link instanceof HTMLAnchorElement)) return;
        const url = new URL(link.href, location.href);
        if (!url.hash || url.origin !== location.origin || url.pathname !== location.pathname) return;
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!target || !content.current?.contains(target)) return;
        event.preventDefault();
        history.pushState(history.state, "", url.hash);
        s.scrollTo(target, true, `top ${HEADER_OFFSET}px`);
      };
      // Capture, ahead of next/link: a Link still runs its own onClick (the
      // menu closes) but skips navigating, since the default is prevented.
      document.addEventListener("click", onClick, true);

      return () => {
        w.removeEventListener("scroll", onWrapperScroll);
        document.removeEventListener("click", onClick, true);
        s.kill();
        smoother.current = null;
      };
    });
  });

  // Per page: snap to wherever the router left the scroll (the top, a hash,
  // or a restored position on Back) instead of gliding there from the last
  // page's position, then set up this page's pins and reveals.
  useGSAP(
    () => {
      const s = smoother.current;
      if (s) {
        s.scrollTo(s.scrollTop(), false);
        ScrollTrigger.refresh();
      }

      const mm = gsap.matchMedia();

      if (s) {
        mm.add("(min-width: 1024px)", () => {
          gsap.utils.toArray<HTMLElement>("[data-smooth-pin]", content.current).forEach((el) => {
            const top = Number(el.dataset.smoothPin) || 0;
            // The element's own sticky offset would add to the pin's; the
            // context restores it when the smoother or the breakpoint goes.
            gsap.set(el, { position: "relative", top: "auto" });
            ScrollTrigger.create({
              trigger: el,
              pin: true,
              pinSpacing: false,
              start: `top top+=${top}`,
              endTrigger: el.parentElement,
              end: () => `bottom top+=${top + el.offsetHeight}`,
              invalidateOnRefresh: true,
            });
          });
        });
      }

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]", content.current).forEach((el) => {
          // Already on screen: leave it be, so nothing above the fold blinks.
          if (ScrollTrigger.isInViewport(el, 0.05)) return;
          gsap.from(el, {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: SETTLE,
            clearProps: "opacity,transform",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      });

      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={wrapper} data-slot="smooth-wrapper">
      <div ref={content} data-slot="smooth-content" className={className}>
        {children}
      </div>
    </div>
  );
}
