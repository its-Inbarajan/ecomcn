import { Star } from "lucide-react";

import { REPO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The header's button style: one height, one rule, one hover. Nav links, the
 * GitHub link, the theme toggle and the menu button all share it, so the row
 * reads as a single set of controls.
 */
export const HEADER_BUTTON =
  "ec-eyebrow ec-rule inline-flex h-9 shrink-0 items-center justify-center gap-2 border px-3 text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:bg-secondary";

/** lucide-react no longer ships brand marks; this is GitHub's own. */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/**
 * The repo link, with its star count once GitHub has answered. On a phone
 * the word "GitHub" gives way to the mark; the count stays.
 */
export function GitHubButton({
  stars,
  showLabel = "sm",
  className,
}: {
  stars: number | null;
  /** When the word "GitHub" shows: from the sm breakpoint, or always. */
  showLabel?: "sm" | "always";
  className?: string;
}) {
  const label =
    stars === null
      ? "ecomcn on GitHub"
      : `ecomcn on GitHub, ${stars.toLocaleString("en")} ${stars === 1 ? "star" : "stars"}`;

  return (
    <a href={REPO_URL} aria-label={label} className={cn(HEADER_BUTTON, className)}>
      <GitHubMark className="size-3.5" />
      <span className={showLabel === "sm" ? "hidden sm:inline" : undefined}>GitHub</span>
      {stars !== null ? (
        <span className="ec-rule -mr-3 flex h-full items-center gap-1.5 border-l px-3 tabular-nums">
          <Star className="size-3" aria-hidden />
          {compact.format(stars)}
        </span>
      ) : null}
    </a>
  );
}
