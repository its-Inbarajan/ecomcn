import type { Metadata } from "next";

/**
 * One place for anything that changes when the domain does. The registry's
 * `homepage` and every install command on the site read from here, so moving
 * to a custom domain is a single edit plus a rebuild.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ecomcn.vercel.app";

export const NAMESPACE = "@ecomcn";

/**
 * `{name}` is literal — the CLI substitutes the item name itself. Registering
 * the namespace is what lets a block's own `@ecomcn/…` dependencies resolve;
 * the CLI never adds a registry on its own.
 */
export const registerCommand = `npx shadcn@latest registry add ${NAMESPACE}=${SITE_URL}/r/{name}.json`;

export const addCommand = (slug: string) => `npx shadcn@latest add ${NAMESPACE}/${slug}`;

export const REPO_URL = "https://github.com/its-Inbarajan/ecomcn";

/**
 * The site-wide social card, `src/app/opengraph-image.png` (alt text in the
 * `.alt.txt` beside it). A page that sets its own `openGraph` replaces the
 * root one wholesale — image included — so such pages pass it back in here.
 */
export const SOCIAL_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "ecomcn — the e-commerce blocks shadcn doesn't ship. An open-source shadcn/ui registry.",
};

/** Open Graph and X card for a page with its own title, keeping the site card image. */
export function socialMetadata(title: string, description: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { type: "website", siteName: "ecomcn", title, description, images: [SOCIAL_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SOCIAL_IMAGE] },
  };
}
