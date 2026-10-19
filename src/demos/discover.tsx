"use client";

import * as React from "react";
import Link from "next/link";

import { AnnouncementBar } from "@/components/ecomcn/announcement-bar";
import { CategoryRail } from "@/components/ecomcn/category-rail";
import { CollectionGrid } from "@/components/ecomcn/collection-grid";
import { HeroEditorial } from "@/components/ecomcn/hero-editorial";
import { LookbookStrip } from "@/components/ecomcn/lookbook-strip";
import { buttonVariants } from "@/components/ui/button";
import { ControlBar, ControlLabel, Toggle } from "@/demos/controls";
import { PRODUCTS } from "@/demos/listing-data";

/**
 * Discover-stage demos. Site code, not registry code: adopters get the
 * blocks, never this sample content.
 */

/** A photo from Unsplash's CDN, cropped to a ratio around a focal point. */
const photo = (id: string, width: number, ratio: string, fpX = 0.5) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=75&ar=${ratio}&fit=crop&crop=focalpoint&fp-x=${fpX}&fp-y=0.5&auto=format`;

const img = (id: string, alt: string, width: number, ratio: string, fpX?: number, eager = false) => (
  // eslint-disable-next-line @next/next/no-img-element -- demo photos straight from the CDN
  <img src={photo(id, width, ratio, fpX)} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />
);

const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

/* ─── announcement-bar ───────────────────────────────────────────────── */

const ANNOUNCEMENTS = [
  { id: "ship", content: "Free delivery on orders over $300" },
  { id: "returns", content: "30-day returns, collected from your door" },
  { id: "drop", content: "The autumn edit is in — shop new arrivals", href: "/demo" },
];

export function AnnouncementBarDemo() {
  const [variant, setVariant] = React.useState<"static" | "marquee">("marquee");
  const [round, setRound] = React.useState(0);
  return (
    <div>
      <ControlBar>
        <ControlLabel>Variant</ControlLabel>
        <Toggle on={variant === "marquee"} onClick={() => setVariant("marquee")}>
          Marquee
        </Toggle>
        <Toggle on={variant === "static"} onClick={() => setVariant("static")}>
          Static
        </Toggle>
        <button
          type="button"
          onClick={() => setRound((r) => r + 1)}
          className="ec-eyebrow ml-2 px-2 py-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Bring it back
        </button>
      </ControlBar>
      {/* A new version each round, so a dismissed bar returns — as a changed announcement would. */}
      <AnnouncementBar items={ANNOUNCEMENTS} variant={variant} storageKey="ecomcn-demo-announcement" version={`demo-${round}`} />
      <p className="mt-6 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
        The marquee holds still under the pointer or focus, and the pause
        button stops it for good. Dismiss it and reload: it stays gone, until
        the announcement changes — Bring it back stands in for that. With
        reduced motion on, the marquee shows as the static bar.
      </p>
    </div>
  );
}

/* ─── hero-editorial ─────────────────────────────────────────────────── */

const CHAIR = byId("p6");

export function HeroEditorialDemo() {
  return (
    <HeroEditorial
      eyebrow="Autumn / Winter 2026"
      title="Made to be sat in for forty years."
      description="Saddle leather that darkens where you rest, on a frame we'll repair for as long as you own it."
      actions={
        <>
          <Link href="/demo" className={buttonVariants({ size: "lg" })}>
            Shop the collection
          </Link>
          <Link href="/demo/p6" className={buttonVariants({ size: "lg", variant: "outline" })}>
            The Halden chair
          </Link>
        </>
      }
      image={{
        src: photo("1572297794908-f2ee5a2930d6", 1200, "4:5"),
        srcSet: [640, 960, 1200, 1600].map((w) => `${photo("1572297794908-f2ee5a2930d6", w, "4:5")} ${w}w`).join(", "),
        alt: "A saddle-leather lounge chair on a slim steel base, lit warm against a pale wall",
        width: 1200,
        height: 1500,
      }}
      caption={{ eyebrow: "In the picture", title: CHAIR.name, price: CHAIR.price, href: "/demo/p6" }}
    />
  );
}

/* ─── category-rail ──────────────────────────────────────────────────── */

const CATEGORIES: { id: string; label: string; photo: string; product: string }[] = [
  { id: "furniture", label: "Furniture", photo: "1580480055273-228ff5388ef8", product: "p6" },
  { id: "lighting", label: "Lighting", photo: "1580130281320-0ef0754f2bf7", product: "p2" },
  { id: "footwear", label: "Footwear", photo: "1773425975272-35f0900a9d8f", product: "p4" },
  { id: "tableware", label: "Tableware", photo: "1615894632464-c746c61feb6d", product: "p3" },
  { id: "glassware", label: "Glassware", photo: "1647943746660-1640133068d5", product: "p5" },
  { id: "bags", label: "Bags", photo: "1574365569389-a10d488ca3fb", product: "p1" },
];

export function CategoryRailDemo() {
  const [loading, setLoading] = React.useState(false);
  const [few, setFew] = React.useState(false);
  const items = CATEGORIES.slice(0, few ? 3 : undefined).map((c) => ({
    id: c.id,
    label: c.label,
    href: "/demo",
    count: PRODUCTS.filter((p) => p.category === byId(c.product).category).length,
    image: img(c.photo, "", 600, "4:5"),
  }));
  return (
    <div>
      <ControlBar>
        <ControlLabel>Categories</ControlLabel>
        <Toggle on={!few} onClick={() => setFew(false)}>
          Six
        </Toggle>
        <Toggle on={few} onClick={() => setFew(true)}>
          Three
        </Toggle>
        <Toggle on={loading} onClick={() => setLoading((l) => !l)}>
          Loading
        </Toggle>
      </ControlBar>
      <CategoryRail items={items} loading={loading} />
      <p className="mt-6 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
        Drag or swipe the rail, or use the arrows. Switch to three categories
        on a wide screen: they all fit, so the arrows fade away rather than
        sitting there disabled. Tab through the tiles — one off to the side
        scrolls into view.
      </p>
    </div>
  );
}

/* ─── collection-grid ────────────────────────────────────────────────── */

export function CollectionGridDemo() {
  return (
    <CollectionGrid
      title="The edit"
      tiles={[
        {
          id: "rooms",
          eyebrow: "Autumn edit",
          title: "Rooms that slow you down",
          description: "Oak, wool and low light — furniture made to be lived with, then handed on.",
          href: "/demo",
          image: img("1580480055273-228ff5388ef8", "An oak-legged lounge chair in a quiet, pale room", 1400, "7:8"),
        },
        {
          id: "light",
          eyebrow: "Lighting",
          title: "After dark",
          href: "/demo",
          image: img("1580130281320-0ef0754f2bf7", "A ceramic table lamp glowing on a wooden sideboard", 900, "16:10"),
        },
        {
          id: "table",
          eyebrow: "Tableware",
          title: "Set the table",
          href: "/demo",
          image: img("1615894632464-c746c61feb6d", "A terracotta stoneware mug on a pale surface", 900, "16:10"),
        },
      ]}
    />
  );
}

/* ─── lookbook-strip ─────────────────────────────────────────────────── */

const LOOK = "1448582649076-3981753123b5";
const DUFFEL = byId("p13");
const STOOL = byId("p16");

export function LookbookStripDemo() {
  return (
    <div>
      <LookbookStrip
        title="Packed for the weekend"
        image={img(LOOK, "A tan canvas duffel on a wooden floor beside a white chair with oak legs", 1800, "2:1")}
        mobileImage={img(LOOK, "A tan canvas duffel on a wooden floor beside a white chair with oak legs", 900, "4:3")}
        aspectRatio="2 / 1"
        mobileAspectRatio="4 / 3"
        hotspots={[
          // The 2:1 crop trims top and bottom; the 4:3 phone crop trims the sides.
          {
            id: "duffel",
            x: 33,
            y: 71,
            mobile: { x: 31, y: 66 },
            product: { name: DUFFEL.name, brand: DUFFEL.brand, href: "/demo/p13", price: DUFFEL.price, image: img(LOOK, "", 200, "1:1", 0.33, true) },
          },
          {
            id: "chair",
            x: 75,
            y: 16,
            mobile: { x: 78, y: 22 },
            product: { name: STOOL.name, brand: STOOL.brand, href: "/demo/p16", price: STOOL.price, compareAt: 360, image: img(LOOK, "", 200, "1:1", 0.75, true) },
          },
        ]}
      />
      <p className="mt-6 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
        Hover a ring, or tap it: the card grows out of it and folds back in.
        Hover a product in the list and its ring answers. Narrow the window
        past the phone breakpoint — the crop changes, and each ring moves to
        where its product now sits.
      </p>
    </div>
  );
}
