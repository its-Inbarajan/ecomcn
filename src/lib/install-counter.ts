import registry from "../../registry.json";

/**
 * Install counter for the hosted registry.
 *
 * The item JSON under /r is a static file, so nothing of ours runs when the
 * shadcn CLI fetches it. src/proxy.ts sits in front of those files, and every
 * fetch the CLI makes (it identifies itself as `User-Agent: shadcn`) adds one
 * to a count in Upstash Redis, over its REST API — no client library.
 *
 * What a count means: one item fetched by the CLI. Installing product-grid
 * also fetches product-card and price-tag, and shadcn's Registry Health runs
 * a weekly `add --dry-run`; both count. Read the numbers as reach, not seats.
 *
 * Until Upstash is connected (the Vercel Marketplace integration sets the
 * env vars below), everything here is a no-op.
 */

/** Item names, from the include paths in the root registry.json. */
export const REGISTRY_ITEMS: string[] = registry.include.map(
  (path) => path.split("/").at(-2) ?? "",
);

const env = () => ({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const counterConfigured = () => {
  const { url, token } = env();
  return Boolean(url && token);
};

async function upstash<T>(path: "" | "/pipeline", body: unknown): Promise<T> {
  const { url, token } = env();
  const response = await fetch(`${url}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Upstash responded ${response.status}`);
  return response.json() as Promise<T>;
}

const DAY_KEY_TTL = 60 * 60 * 24 * 400; // daily counts outlive a year of charts

/** One fetch of one item: the running total, today's count, and the start date. */
export function recordInstall(item: string, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  return upstash("/pipeline", [
    ["INCR", `installs:${item}`],
    ["INCR", `installs:${item}:${day}`],
    ["EXPIRE", `installs:${item}:${day}`, DAY_KEY_TTL],
    ["SET", "installs:since", day, "NX"],
  ]);
}

export interface InstallCounts {
  since: string | null;
  total: number;
  items: Record<string, number>;
}

/** Running totals for every item, in registry order. */
export async function readInstalls(): Promise<InstallCounts> {
  const { result } = await upstash<{ result: (string | null)[] }>("", [
    "MGET",
    "installs:since",
    ...REGISTRY_ITEMS.map((item) => `installs:${item}`),
  ]);
  const [since, ...counts] = result;
  const items = Object.fromEntries(
    REGISTRY_ITEMS.map((item, i) => [item, Number(counts[i] ?? 0)]),
  );
  return {
    since: since ?? null,
    total: Object.values(items).reduce((sum, n) => sum + n, 0),
    items,
  };
}
