"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  resolved: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme() {
  const root = document.documentElement;
  root.classList.remove("light");
  root.classList.add("dark");
  root.style.colorScheme = "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme();
  }, []);

  const value = useMemo(() => ({ resolved: "dark" as const }), []);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}
