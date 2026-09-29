import { counterConfigured, readInstalls } from "@/lib/install-counter";

/**
 * GET /api/installs — CLI fetches per registry item since counting began.
 * See src/lib/install-counter.ts for what a count means.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!counterConfigured()) {
    return Response.json(
      { configured: false, message: "Connect Upstash Redis to start counting." },
      { status: 503 },
    );
  }
  try {
    return Response.json(
      { configured: true, ...(await readInstalls()) },
      // Five minutes at the CDN keeps Redis reads to a trickle.
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return Response.json({ configured: true, error: "Counter unavailable." }, { status: 502 });
  }
}
