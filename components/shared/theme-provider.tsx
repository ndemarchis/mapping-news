"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeChoice;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeChoice) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "mn-theme";

const getSystemTheme = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as ThemeChoice | null) : null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (nextTheme: ThemeChoice) => {
      const resolved = nextTheme === "system" ? getSystemTheme() : nextTheme;
      setResolvedTheme(resolved);
      const root = document.documentElement;

      if (nextTheme === "system") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", nextTheme);
      }

      root.style.colorScheme = resolved;
      localStorage.setItem(STORAGE_KEY, nextTheme);
    };

    applyTheme(theme);

    const listener = (event: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme("system");
      } else {
        setResolvedTheme(event.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
