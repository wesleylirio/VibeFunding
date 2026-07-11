"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoRole } from "@/lib/types";
import { VibeWordmark } from "@/components/brand/logo";
import { GemmaOrb } from "@/components/gemma/gemma-orb";

const COLLAPSE_KEY = "vf-sidebar-collapsed";

type NavItem =
  | { href: string; label: string; kind: "icon"; icon: LucideIcon }
  | { href: string; label: string; kind: "gemma" };

const investorNav: NavItem[] = [
  { href: "/discover", label: "Discover", kind: "icon", icon: Compass },
  { href: "/portfolio", label: "Portfolio", kind: "icon", icon: Briefcase },
  { href: "/activity", label: "Activity", kind: "icon", icon: Activity },
  { href: "/gemma", label: "Gemma", kind: "gemma" },
];

export function Sidebar({ role }: { role: DemoRole }) {
  const pathname = usePathname();
  const nav = investorNav;
  void role;
  /** Closed by default — user can expand; preference persists */
  const [collapsed, setCollapsed] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      // Default closed unless user explicitly expanded ("0")
      if (stored === "0") setCollapsed(false);
      else setCollapsed(true);
    } catch {
      setCollapsed(true);
    }
    setReady(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const homeHref = "/discover";

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex",
        collapsed ? "w-[72px]" : "w-56"
      )}
      data-collapsed={collapsed ? "true" : "false"}
      data-ready={ready ? "true" : "false"}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border px-3 py-4",
          collapsed ? "justify-center" : "justify-between gap-2 px-4"
        )}
      >
        <Link
          href={homeHref}
          className="flex min-w-0 items-center justify-center"
          title="VibeFunding"
        >
          {collapsed ? (
            <span
              className="vf-wordmark-vibe font-display text-[11px] font-semibold tracking-tight"
              aria-label="VibeFunding"
            >
              Vibe
            </span>
          ) : (
            <VibeWordmark size="sm" />
          )}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-sidebar-foreground"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="flex shrink-0 justify-center border-b border-border py-2">
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-sidebar-foreground"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Always visible — does not scroll away with page content */}
      <nav className="flex min-h-0 flex-1 flex-col space-y-1 overflow-y-auto px-2 py-4">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 rounded-[var(--vf-radius-sm)] px-3 py-2.5 text-sm vf-transition",
                collapsed && "justify-center px-2",
                active
                  ? "bg-primary/12 text-primary shadow-inner"
                  : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-sidebar-foreground"
              )}
            >
              {item.kind === "gemma" ? (
                <GemmaOrb size={18} state="idle" pulse={false} />
              ) : (
                <item.icon className="h-4 w-4 shrink-0" />
              )}
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="shrink-0 border-t border-border px-4 py-3 text-[11px] text-sidebar-foreground/40">
          Investor
        </div>
      ) : null}
    </aside>
  );
}
