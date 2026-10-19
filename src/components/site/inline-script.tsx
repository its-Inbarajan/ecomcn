/**
 * A script that runs while the server's HTML is parsed, and never again.
 *
 * React warns in development whenever it renders a <script>, and a script
 * React inserts on the client never executes anyway. So it is a real
 * script in the server HTML and inert text on the client;
 * suppressHydrationWarning covers the `type` difference. From Next's
 * "Preventing flash before hydration" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
