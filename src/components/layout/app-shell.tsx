"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { FloatingGemma } from "@/components/gemma/floating-gemma";
import type { DemoRole } from "@/lib/types";

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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          role={role}
          userName={userName}
          initials={initials}
          title={title}
          subtitle={subtitle}
          vibeBalance={vibeBalance}
        />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 pb-28 md:px-6 md:pb-10">
          {children}
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
