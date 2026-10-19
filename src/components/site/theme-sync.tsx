"use client";

import * as React from "react";

import { SYSTEM_DARK, THEME_KEY, applyTheme, resolvedTheme, storedTheme, systemTheme } from "@/lib/theme";

/**
 * Keeps <html>'s `dark` class right after the inline script has set it:
 *
 * - In development, Strict Mode remounts the root and resets <html> to the
 *   attributes React manages, clearing the class the script added. This
 *   puts it back before paint — on every page, the previews included, not
 *   only those with a theme toggle. A no-op in production.
 * - While the visitor hasn't chosen, it follows the operating system live.
 * - A choice made in another tab applies here too.
 *
 * Mounted once, in the root layout. Renders nothing.
 */
export function ThemeSync() {
  React.useLayoutEffect(() => {
    applyTheme(resolvedTheme());

    const media = matchMedia(SYSTEM_DARK);
    const onSystemChange = () => {
      if (!storedTheme()) applyTheme(systemTheme());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null) applyTheme(resolvedTheme());
    };

    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
