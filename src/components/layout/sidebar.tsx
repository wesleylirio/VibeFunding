"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Briefcase,
  Compass,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoRole } from "@/lib/types";
import { VibeMark } from "@/components/brand/logo";

const investorNav = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/gemma", label: "Gemma", icon: Sparkles },
];

const founderNav = [
  { href: "/founder", label: "Dashboard", icon: LayoutDashboard },
  { href: "/founder/projects", label: "Projects", icon: Briefcase },
  { href: "/founder/quickstart", label: "Quickstart", icon: Sparkles },
  { href: "/discover", label: "Discover", icon: Compass },
];

export function Sidebar({ role }: { role: DemoRole }) {
  const pathname = usePathname();
  const nav = role === "FOUNDER" ? founderNav : investorNav;

  return (
    <aside className="hidden w-[72px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex xl:w-56">
      <div className="border-b border-white/10 px-3 py-5 xl:px-4">
        <Link
          href={role === "FOUNDER" ? "/founder" : "/portfolio"}
          className="flex items-center gap-3"
        >
          <VibeMark size={36} />
          <div className="hidden xl:block">
            <div className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              VibeFunding
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
              Agentic capital
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 xl:px-3">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-white/10 text-white shadow-inner"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden xl:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
