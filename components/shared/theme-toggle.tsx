"use client";

import React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, ThemeChoice } from "./theme-provider";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const nextMode: ThemeChoice =
    theme === "system"
      ? resolvedTheme === "dark"
        ? "light"
        : "dark"
      : theme === "dark"
      ? "light"
      : "dark";

  const icon =
    nextMode === "light" ? (
      <Sun className="h-4 w-4" />
    ) : nextMode === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  const label =
    nextMode === "light" ? "Light" : nextMode === "dark" ? "Dark" : "System";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextMode)}
      className="border-subtle bg-surface-strong shadow-elevated text-primary hover:bg-surface-muted flex items-center justify-center rounded-full border p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      aria-label={`Switch to ${label} theme (current: ${theme}, prefers ${resolvedTheme}).`}
    >
      {icon}
    </button>
  );
}
