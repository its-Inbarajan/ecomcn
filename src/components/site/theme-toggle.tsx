"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ecomcn-theme", next ? "dark" : "light");
    } catch {
      /* private mode — the choice just won't persist */
    }
  };

  return (
    <Button
      type="button"
      size={"icon-sm"}
      data-size={"icon-sm"}
      variant={"secondary"}
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="ec-rule grid bg-transparent shrink-0 place-items-center rounded-none border transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
