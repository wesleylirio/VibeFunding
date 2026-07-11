"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Tab = {
  key: string;
  label: string;
  href: (s: string) => string;
};

export function ProjectTabs({
  slug,
  showCommunity = false,
  onePaper,
}: {
  slug: string;
  /** Community unlocks after the investor funds this project */
  showCommunity?: boolean;
  /** Optional One-Paper control rendered as a tab next to Overview */
  onePaper?: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { key: "overview", label: "Overview", href: (s) => `/projects/${s}` },
    ...(showCommunity
      ? [
          {
            key: "community",
            label: "Community",
            href: (s: string) => `/projects/${s}/community`,
          },
        ]
      : []),
  ];

  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/30 p-1">
      {tabs.map((tab) => {
        const href = tab.href(slug);
        const active =
          tab.key === "overview"
            ? pathname === `/projects/${slug}`
            : pathname.includes("/community");
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
      {onePaper}
    </div>
  );
}
