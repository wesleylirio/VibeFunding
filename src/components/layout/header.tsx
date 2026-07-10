"use client";

import { RoleSwitcher } from "./role-switcher";
import { DemoResetButton } from "./demo-reset-button";
import { WalletBar } from "@/components/wallet/wallet-bar";
import { ThemeSelector } from "@/lib/brand/theme";
import type { DemoRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({
  role,
  userName,
  initials,
  title,
  subtitle,
  vibeBalance,
}: {
  role: DemoRole;
  userName: string;
  initials: string;
  title?: string;
  subtitle?: string;
  vibeBalance: number;
}) {
  const router = useRouter();

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
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          ) : (
            <h1 className="truncate text-lg font-semibold tracking-tight lg:hidden">
              VibeFunding
            </h1>
          )}
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ThemeSelector className="hidden sm:inline-flex" />
          <WalletBar initialBalance={vibeBalance} userName={userName} initials={initials} />
          <DemoResetButton />
          <RoleSwitcher role={role} userName={userName} />
          <div
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent sm:flex"
            title={userName}
          >
            {initials}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Logout"
            className="hidden md:inline-flex"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
