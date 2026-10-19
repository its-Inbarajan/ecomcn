/*
 * The site's light/dark theme. The `dark` class on <html> is the single
 * source of truth; the visitor's choice lives in localStorage, and without
 * one the theme follows the operating system.
 *
 * No "use client": the root layout (a Server Component) inlines
 * THEME_SCRIPT into <head>, and a string exported from a client module
 * would reach it as a client reference, not as the string.
 */

export type Theme = "light" | "dark";

export const THEME_KEY = "ecomcn-theme";

export const SYSTEM_DARK = "(prefers-color-scheme: dark)";

/**
 * Runs while the HTML is parsed, before first paint, so a dark-mode visitor
 * never sees a flash of the paper palette. Kept tiny and dependency-free:
 * it is inlined into every page.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var d=s?s==="dark":matchMedia("${SYSTEM_DARK}").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

/** The visitor's saved choice, or null when they've never chosen. */
export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null; // storage blocked: private mode, or cookies off
  }
}

export function systemTheme(): Theme {
  return matchMedia(SYSTEM_DARK).matches ? "dark" : "light";
}

/** What the page should show right now: the choice, else the system. */
export function resolvedTheme(): Theme {
  return storedTheme() ?? systemTheme();
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** Show a theme and remember it. */
export function setTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode — the choice just won't persist */
  }
}
