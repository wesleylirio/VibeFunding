"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "overview", label: "Overview", href: (s: string) => `/projects/${s}` },
  {
    key: "rounds",
    label: "Build Rounds",
    href: (s: string) => `/projects/${s}#build-rounds`,
  },
  {
    key: "agents",
    label: "Agents",
    href: (s: string) => `/projects/${s}/agents`,
  },
  {
    key: "proofs",
    label: "Proofs",
    href: (s: string) => `/projects/${s}#proofs`,
  },
  {
    key: "community",
    label: "Community",
    href: (s: string) => `/projects/${s}/community`,
  },
  {
    key: "team",
    label: "Team",
    href: (s: string) => `/projects/${s}#team`,
  },
  {
    key: "one-paper",
    label: "One-Paper",
    href: (s: string) => `/projects/${s}#one-paper`,
  },
];

export function ProjectTabs({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/30 p-1 scrollbar-thin">
      {tabs.map((tab) => {
        const href = tab.href(slug);
        const active =
          tab.key === "overview"
            ? pathname === `/projects/${slug}`
            : tab.key === "agents"
              ? pathname.includes("/agents")
              : tab.key === "community"
                ? pathname.includes("/community")
                : false;
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
