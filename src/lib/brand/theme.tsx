"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Product UI only exposes light/dark. System is still accepted if previously stored. */
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_KEY = "vf-theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref;
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as ThemePreference | null;
      let pref: ThemePreference =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "dark";
      // Migrate system → resolved dark/light for product UI
      if (pref === "system") {
        pref = resolveTheme("system");
      }
      setPreferenceState(pref);
      const r = resolveTheme(pref);
      setResolved(r);
      applyTheme(r);
    } catch {
      applyTheme("dark");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const r = resolveTheme(preference);
    setResolved(r);
    applyTheme(r);
    try {
      // Persist only light/dark in product UI
      const store = preference === "system" ? r : preference;
      localStorage.setItem(THEME_KEY, store);
    } catch {
      /* ignore */
    }
  }, [preference, ready]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p === "system" ? resolveTheme("system") : p);
  }, []);

  const toggle = useCallback(() => {
    setPreferenceState((prev) => {
      const current = prev === "system" ? resolveTheme("system") : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggle }),
    [preference, resolved, setPreference, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}

/** Single sun/moon toggle — Light and Dark only (no System in product UI). */
export function ThemeSelector({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      title={isDark ? "Switch to light" : "Switch to dark"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggle}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground transition hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
