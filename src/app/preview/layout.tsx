import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

/**
 * Deliberately bare. Docs pages iframe these routes so site chrome and site
 * CSS can never leak into a block preview — what you see is what installs.
 */
export default function PreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The id is the measurement target for BlockPreview. Measuring <body>
  // instead would deadlock: the root layout gives html/body full height, so
  // body.scrollHeight always equals the iframe's current height and the frame
  // can never shrink back down.
  return (
    <div id="ecomcn-preview-root" className="bg-background p-5 sm:p-8">
      {children}
    </div>
  );
}
