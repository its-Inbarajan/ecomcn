"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Demo-only controls. They drive the previews; they are not blocks. */

export function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "ec-eyebrow ec-rule border px-2.5 py-1.5 transition-colors",
        on ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

export function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="ec-eyebrow mb-3 text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function ControlBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="ec-rule mb-6 flex flex-wrap items-center gap-2 border-b pb-3">{children}</div>
  );
}

export function ControlLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("ec-eyebrow mr-1 text-muted-foreground", className)}>{children}</span>;
}
