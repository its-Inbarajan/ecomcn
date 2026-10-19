import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { InlineScript } from "@/components/site/inline-script";
import { ThemeSync } from "@/components/site/theme-sync";
import { SITE_URL as url } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Rule 03: one high-contrast display serif, used for names, prices and heads.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: "ecomcn — e-commerce blocks for shadcn/ui",
    template: "%s · ecomcn",
  },
  description:
    "Buy boxes, faceted filters, cart sheets and order summaries — installed the same way you install a button. An open-source shadcn/ui registry.",
  keywords: [
    "shadcn",
    "shadcn/ui",
    "registry",
    "e-commerce",
    "React",
    "Tailwind CSS",
    "components",
  ],
  openGraph: {
    type: "website",
    url,
    siteName: "ecomcn",
    title: "ecomcn — e-commerce blocks for shadcn/ui",
    description:
      "The blocks shadcn/ui doesn't ship. Open source, MIT, one command to install.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ecomcn — e-commerce blocks for shadcn/ui",
    description:
      "The blocks shadcn/ui doesn't ship. Open source, MIT, one command to install.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <head>
        {/* The theme, before first paint: no flash of the paper palette. */}
        <InlineScript html={THEME_SCRIPT} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* …and kept right after: the dev remount, the OS, other tabs. */}
        <ThemeSync />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
