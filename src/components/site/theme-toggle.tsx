"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { setTheme } from "@/lib/theme";

/**
 * The `dark` class on <html> is the source of truth — an inline script in the
 * root layout sets it before first paint, and ThemeSync keeps it there.
 * Mirroring it into React state meant syncing the two in an effect;
 * subscribing to it instead means there is only ever one copy, and anything
 * else that toggles the class stays in step.
 */
function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const dark = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className="ec-rule grid size-9 shrink-0 place-items-center border transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
