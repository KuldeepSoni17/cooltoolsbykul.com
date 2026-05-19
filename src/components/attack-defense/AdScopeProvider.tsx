"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type AdTheme = "light" | "dark";

const THEME_KEY = "ad:theme";

const ThemeCtx = createContext<{
  theme: AdTheme;
  setTheme: (t: AdTheme) => void;
  toggleTheme: () => void;
} | null>(null);

export function useAdTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useAdTheme must be used within AdScopeProvider");
  return ctx;
}

export function AdScopeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      if (stored === "dark" || stored === "light") setThemeState(stored);
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: AdTheme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(THEME_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className="ad-scope ad-ad-shell" data-theme={mounted ? theme : "light"} suppressHydrationWarning>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}
