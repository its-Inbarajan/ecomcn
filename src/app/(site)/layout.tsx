import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";

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
      {children}
      <SiteFooter />
    </>
  );
}
