"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notifyWalletRefresh } from "@/components/wallet/wallet-bar";

export function DemoResetButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  async function reset() {
    if (!confirm("Reset platform data to the original state?")) return;
    setMsg(null);
    const res = await fetch("/api/demo/reset", { method: "POST" });
    if (!res.ok) {
      setMsg("Reset failed");
      return;
    }
    notifyWalletRefresh();
    startTransition(() => {
      router.push("/portfolio");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={reset}
        disabled={pending}
        title="Reset data"
        className="hidden sm:inline-flex"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Reset</span>
      </Button>
      {msg ? <span className="text-xs text-danger">{msg}</span> : null}
    </div>
  );
}
