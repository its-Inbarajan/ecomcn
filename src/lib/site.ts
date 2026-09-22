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
