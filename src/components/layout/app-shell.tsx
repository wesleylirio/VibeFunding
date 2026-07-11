"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { FloatingGemma } from "@/components/gemma/floating-gemma";
import type { DemoRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({
  role,
  userName,
  initials = "IN",
  title,
  subtitle,
  vibeBalance = 0,
  children,
  hideGemma = false,
}: {
  role: DemoRole;
  userName: string;
  initials?: string;
  title?: string;
  subtitle?: string;
  vibeBalance?: number;
  children: React.ReactNode;
  hideGemma?: boolean;
}) {
  const [gemmaOpen, setGemmaOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar role={role} />
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-200",
          /* Desktop Gemma panel reserves space so content stays visible */
          gemmaOpen && !hideGemma && "md:mr-[400px]"
        )}
      >
        <Header
          role={role}
          userName={userName}
          initials={initials}
          title={title}
          subtitle={subtitle}
          vibeBalance={vibeBalance}
        />
        {/* Only main content scrolls — sidebar stays fixed */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-[var(--vf-content-max)]">
            {children}
          </div>
        </main>
      </div>
      <MobileNav role={role} />
      {!hideGemma ? (
        <FloatingGemma
          open={gemmaOpen}
          onOpenChange={setGemmaOpen}
          userName={userName}
        />
      ) : null}
    </div>
  );
}
