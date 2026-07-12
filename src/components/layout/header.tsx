"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { WalletBar } from "@/components/wallet/wallet-bar";
import type { DemoRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Header({
  role: _role,
  userName,
  initials,
  title,
  vibeBalance,
}: {
  role: DemoRole;
  userName: string;
  initials: string;
  title?: string;
  subtitle?: string;
  vibeBalance: number;
}) {
  void _role;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function logout() {
    await fetch("/api/demo/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-[color-mix(in_oklab,var(--background)_88%,transparent)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="min-w-0">
          {title ? (
            <h1 className="truncate font-display text-lg font-semibold tracking-tight">
              {title}
            </h1>
          ) : (
            <h1 className="truncate font-display text-lg font-semibold tracking-tight lg:hidden">
              <span className="vf-wordmark-vibe">Vibe</span>
              <span className="vf-wordmark-funding">Funding</span>
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <WalletBar
            initialBalance={vibeBalance}
            userName={userName}
            initials={initials}
          />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 py-1 pl-1 pr-2 transition hover:bg-muted"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vibe-soft text-xs font-semibold text-vibe">
                {initials}
              </span>
              <span className="hidden max-w-[100px] truncate text-sm font-medium md:inline">
                {userName}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition",
                  menuOpen && "rotate-180"
                )}
              />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
              >
                <div className="border-b border-border px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{userName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Investor
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
