"use client";

import * as React from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

import { cn } from "@/lib/utils";

const WIDTHS = { desktop: "100%", tablet: "768px", mobile: "390px" } as const;
type View = keyof typeof WIDTHS;

const VIEWS = [
  ["desktop", Monitor],
  ["tablet", Tablet],
  ["mobile", Smartphone],
] as const;

/**
 * The block runs in an iframe rather than inline: docs-page CSS can't reach
 * it, and the width toggle tests breakpoints without opening devtools.
 */
export function BlockPreview({ slug, title }: { slug: string; title: string }) {
  const [view, setView] = React.useState<View>("desktop");
  const [height, setHeight] = React.useState(520);
  const frame = React.useRef<HTMLIFrameElement>(null);

  // Size the frame to its content so the page never nests two scrollbars.
  // Measure the preview wrapper, not <body>: the root layout gives html and
  // body full height, so body.scrollHeight just echoes the iframe back.
  const measure = React.useCallback(() => {
    const target = frame.current?.contentDocument?.getElementById("ecomcn-preview-root");
    if (!target) return;
    const next = Math.max(160, Math.ceil(target.getBoundingClientRect().height));
    setHeight((current) => (Math.abs(current - next) > 2 ? next : current));
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(measure, 400);
    return () => window.clearInterval(id);
  }, [measure]);

  return (
    <div className="ec-rule border">
      <div className="ec-rule ec-eyebrow flex items-center justify-between border-b px-3 py-2 text-muted-foreground">
        <span>Preview — live</span>
        <div className="flex items-center gap-3">
          <span className="ec-num">{WIDTHS[view]}</span>
          <div className="ec-rule flex items-center gap-px border">
            {VIEWS.map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-label={`${key} width`}
                aria-pressed={view === key}
                className={cn(
                  "grid size-7 place-items-center transition-colors",
                  view === key
                    ? "bg-primary text-primary-foreground"
                    : "hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-secondary/40 p-4 sm:p-6">
        <iframe
          ref={frame}
          onLoad={measure}
          src={`/preview/${slug}`}
          title={`${title} preview`}
          loading="lazy"
          className="mx-auto block w-full border-0 bg-background transition-[max-width] duration-300"
          style={{ maxWidth: WIDTHS[view], height }}
        />
      </div>
    </div>
  );
}
