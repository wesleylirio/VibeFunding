"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemePreference = "light" | "dark" | "system";

const THEME_KEY = "vf-theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: "light" | "dark";
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as ThemePreference | null;
      const pref =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "system";
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
      localStorage.setItem(THEME_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [preference, ready]);

  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = resolveTheme("system");
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference]
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

export function ThemeSelector({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();
  const options: { id: ThemePreference; icon: typeof Sun; label: string }[] = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-border bg-muted/40 p-0.5",
        className
      )}
      role="group"
      aria-label="Theme"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = preference === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={active}
            onClick={() => setPreference(opt.id)}
            className={cn(
              "rounded-lg p-1.5 transition",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
