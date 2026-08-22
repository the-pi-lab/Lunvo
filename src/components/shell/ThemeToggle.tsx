"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { initTheme, toggleTheme, getActiveTheme, type Theme } from "@/lib/design/theme";

export default function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(initTheme());
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  if (!mounted) {
    return <div className={collapsed ? "h-9 w-9 mx-auto" : "h-9 w-full"} aria-hidden />;
  }

  return (
    <button
      onClick={handleToggle}
      title={theme === "dark" ? "Switch to light" : "Switch to dark"}
      className={
        collapsed
          ? "h-9 w-9 mx-auto flex items-center justify-center rounded-[8px] text-on-surface-variant hover:bg-surface-container hover:text-on-background transition-colors"
          : "w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-background transition-colors"
      }
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 shrink-0" />
      )}
      {!collapsed && (
        <span className="uppercase tracking-wider text-xs font-bold">
          {getActiveTheme() === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
