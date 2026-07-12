"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VibeWordmark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#hero", label: "Story" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#proof", label: "Proof of Build" },
  { href: "#gemma", label: "Gemma" },
];

export function IndexHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[var(--vf-index-max-width)] items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="shrink-0">
          <VibeWordmark size="md" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="vf-transition hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-[var(--vf-radius-sm)] border border-border px-3 py-2 text-sm font-medium vf-transition hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
