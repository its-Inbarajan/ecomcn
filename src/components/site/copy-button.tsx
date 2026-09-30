"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

export function InstallCommand({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the text is selectable either way */
    }
  };

  return (
    <div
      className={cn(
        // contain: inline-size — the box takes its width from the column it
        // sits in, never from the command. Without it a long command is the
        // min-content width of every grid or flex parent, and the title and
        // summary beside it stretch to match.
        "ec-rule flex min-w-0 items-center justify-between gap-3 border bg-secondary/60 px-3 py-2.5 [contain:inline-size]",
        className,
      )}
    >
      <code className="ec-scroll-x min-w-0 flex-1 overflow-x-auto font-mono text-[12.5px] whitespace-nowrap">
        <span className="text-muted-foreground select-none">$ </span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="ec-eyebrow ec-rule flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {copied ? (
          <Check className="size-3 text-success" aria-hidden />
        ) : (
          <Copy className="size-3" aria-hidden />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked \u2014 the text is selectable either way */
        }
      }}
      className={cn(
        "ec-eyebrow ec-rule flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3 text-success" aria-hidden />
      ) : (
        <Copy className="size-3" aria-hidden />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
