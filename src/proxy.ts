import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import { REGISTRY_ITEMS, counterConfigured, recordInstall } from "@/lib/install-counter";

const ITEM_JSON = /^\/r\/([a-z0-9-]+)\.json$/;
const KNOWN = new Set(REGISTRY_ITEMS);

/**
 * Counts registry installs, then lets the static file through untouched.
 * The count is written after the response is sent (waitUntil), so a slow or
 * missing counter never delays or breaks an install.
 */
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const item = ITEM_JSON.exec(request.nextUrl.pathname)?.[1];
  const fromCli = /^shadcn\b/i.test(request.headers.get("user-agent") ?? "");

  if (request.method === "GET" && item && KNOWN.has(item) && fromCli && counterConfigured()) {
    event.waitUntil(recordInstall(item).catch(() => {}));
  }

  return NextResponse.next();
}

// Only the registry: every other page skips the proxy entirely.
export const config = { matcher: "/r/:path*" };
