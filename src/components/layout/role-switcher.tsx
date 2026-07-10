"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DemoRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoleSwitcher({
  role,
  userName,
}: {
  role: DemoRole;
  userName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function switchRole(next: DemoRole) {
    if (next === role) return;
    setError(null);
    try {
      const res = await fetch("/api/demo/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) {
        // fallback for older path
        await fetch("/api/demo/switch-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: next }),
        });
      }
      startTransition(() => {
        router.push(next === "FOUNDER" ? "/founder" : "/portfolio");
        router.refresh();
      });
    } catch {
      setError("Could not switch role");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right xl:block">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Viewing as
        </div>
        <div className="max-w-[120px] truncate text-xs font-medium">{userName}</div>
      </div>
      <div className="inline-flex rounded-xl border border-border bg-muted/40 p-0.5">
        {(["INVESTOR", "FOUNDER"] as DemoRole[]).map((r) => (
          <button
            key={r}
            type="button"
            disabled={pending}
            onClick={() => switchRole(r)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition sm:px-3",
              role === r
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r === "INVESTOR" ? "Investor" : "Founder"}
          </button>
        ))}
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
