import { CopyButton } from "@/components/site/copy-button";
import { cn } from "@/lib/utils";

/**
 * Plain mono, no highlighter. A syntax theme is a dependency and a second
 * palette to maintain; the source reads fine without one, and the copy
 * button is what people are actually here for.
 */
export function CodeViewer({
  label,
  code,
  className,
  maxHeight = "34rem",
}: {
  label: string;
  code: string;
  className?: string;
  maxHeight?: string | false;
}) {
  const lines = code.split("\n").length;

  return (
    <figure className={cn("ec-rule border", className)}>
      <figcaption className="ec-rule ec-eyebrow flex items-center justify-between gap-3 border-b bg-secondary/60 px-3 py-2 text-muted-foreground">
        <code className="truncate font-mono tracking-normal normal-case">{label}</code>
        <span className="flex items-center gap-3">
          <span className="ec-num hidden sm:inline">{lines} lines</span>
          <CopyButton value={code} className="border-transparent" />
        </span>
      </figcaption>
      <pre
        className="overflow-auto p-4 text-[12.5px] leading-[1.65]"
        style={maxHeight ? { maxHeight } : undefined}
        tabIndex={0}
      >
        <code className="font-mono">{code}</code>
      </pre>
    </figure>
  );
}
