"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Activity, Briefcase, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoRole } from "@/lib/types";
import { GemmaOrb } from "@/components/gemma/gemma-orb";

type NavItem =
  | { href: string; label: string; kind: "icon"; icon: LucideIcon }
  | { href: string; label: string; kind: "gemma" };

export function MobileNav({ role }: { role: DemoRole }) {
  const pathname = usePathname();
  void role;
  const items: NavItem[] = [
    { href: "/discover", label: "Discover", kind: "icon", icon: Compass },
    { href: "/portfolio", label: "Portfolio", kind: "icon", icon: Briefcase },
    { href: "/activity", label: "Activity", kind: "icon", icon: Activity },
    { href: "/gemma", label: "Gemma", kind: "gemma" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[color-mix(in_oklab,var(--surface-1)_94%,transparent)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium vf-transition",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.kind === "gemma" ? (
                <GemmaOrb size={18} state="idle" pulse={false} />
              ) : (
                <item.icon className="h-4 w-4" />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
