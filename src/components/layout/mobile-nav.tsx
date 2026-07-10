"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Briefcase, Compass, LayoutDashboard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoRole } from "@/lib/types";

export function MobileNav({ role }: { role: DemoRole }) {
  const pathname = usePathname();
  const items =
    role === "FOUNDER"
      ? [
          { href: "/founder", label: "Home", icon: LayoutDashboard },
          { href: "/founder/quickstart", label: "Create", icon: Sparkles },
          { href: "/discover", label: "Discover", icon: Compass },
          { href: "/gemma", label: "Gemma", icon: Sparkles },
        ]
      : [
          { href: "/discover", label: "Discover", icon: Compass },
          { href: "/portfolio", label: "Portfolio", icon: Briefcase },
          { href: "/activity", label: "Activity", icon: Activity },
          { href: "/gemma", label: "Gemma", icon: Sparkles },
        ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#07080c]/95 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                active ? "text-accent" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
