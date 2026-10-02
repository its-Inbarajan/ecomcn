import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { SmoothScroll } from "@/components/site/smooth-scroll";

/**
 * Chrome lives here rather than in the root layout, so /preview/[slug] can
 * render a block with nothing around it. Docs pages iframe those routes.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {/* pt-15 clears the fixed header. min-h-dvh and flex keep the footer
          at the bottom of a short page, as the body's flex column did. */}
      <SmoothScroll className="flex min-h-dvh flex-col pt-15">
        {children}
        <SiteFooter />
      </SmoothScroll>
    </>
  );
}
