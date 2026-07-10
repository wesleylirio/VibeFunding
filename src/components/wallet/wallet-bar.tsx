"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Eye, EyeOff, Wallet } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type WalletData = {
  vibeBalance: number;
  simulatedTotal: number;
  tokenHoldings: {
    id: string;
    symbol: string;
    name: string;
    amount: number;
    projectName?: string;
    projectSlug?: string;
  }[];
  nftHoldings: {
    id: string;
    name: string;
    amount: number;
    projectName?: string;
  }[];
  pendingContributions?: {
    id: string;
    projectName?: string;
    resourceType: string;
    amount: number;
    rewardTokens: number;
  }[];
  verifiedContributions?: {
    id: string;
    projectName?: string;
    settlementStatus?: string;
    rewardTokens: number;
  }[];
};

const HIDDEN_KEY = "vf-wallet-hidden";

export function WalletBar({
  initialBalance,
  userName,
  initials,
  className,
}: {
  initialBalance: number;
  userName?: string;
  initials?: string;
  className?: string;
}) {
  const [data, setData] = useState<WalletData | null>(null);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(HIDDEN_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as WalletData;
      setData(json);
      setTick((t) => t + 1);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    const onAlloc = () => refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("vf:wallet-refresh", onAlloc);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("vf:wallet-refresh", onAlloc);
    };
  }, [refresh]);

  const balance = data?.vibeBalance ?? initialBalance;
  const display = hidden ? "••••••" : formatNumber(balance);
  const pending = data?.pendingContributions || [];
  const verified = data?.verifiedContributions || [];

  function toggleHidden() {
    setHidden((h) => {
      const next = !h;
      try {
        localStorage.setItem(HIDDEN_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 pl-2.5">
        <Wallet className="h-3.5 w-3.5 text-vibe" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-1 py-1 text-sm"
        >
          <span className="hidden text-muted-foreground lg:inline">Wallet</span>
          <span
            key={tick}
            className={cn(
              "font-semibold tabular-nums text-foreground",
              tick > 0 && "animate-wallet-tick"
            )}
          >
            {display}
            {!hidden ? (
              <span className="ml-1 text-xs font-medium text-vibe">VIBE</span>
            ) : null}
          </span>
          {userName ? (
            <span className="hidden items-center gap-1 border-l border-border pl-2 text-xs text-muted-foreground xl:inline-flex">
              <span className="font-semibold text-foreground">{initials}</span>
              <span className="max-w-[90px] truncate">{userName}</span>
            </span>
          ) : null}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={toggleHidden}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={hidden ? "Show balances" : "Hide balances"}
        >
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close wallet"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 animate-reveal-up rounded-2xl border border-border bg-card p-3 shadow-xl">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              VIBE
            </div>
            <div className="mb-3 text-lg font-semibold tabular-nums">
              {hidden ? "••••••" : formatNumber(balance)}
            </div>

            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Project Tokens
            </div>
            <div className="max-h-28 space-y-1.5 overflow-y-auto scrollbar-thin">
              {(data?.tokenHoldings || []).length === 0 ? (
                <p className="text-xs text-muted-foreground">No project tokens yet</p>
              ) : (
                data?.tokenHoldings.map((t) => (
                  <Link
                    key={t.id}
                    href={t.projectSlug ? `/projects/${t.projectSlug}` : "/portfolio"}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <span>
                      <span className="font-medium">{t.symbol}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {t.projectName}
                      </span>
                    </span>
                    <span className="tabular-nums">
                      {hidden ? "••••" : formatNumber(t.amount)}
                    </span>
                  </Link>
                ))
              )}
            </div>

            <div className="mb-2 mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              NFTs
            </div>
            <div className="space-y-1.5">
              {(data?.nftHoldings || []).length === 0 ? (
                <p className="text-xs text-muted-foreground">No NFTs yet</p>
              ) : (
                data?.nftHoldings.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm"
                  >
                    <span className="font-medium">{n.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {hidden ? "••••" : `×${n.amount}`}
                    </span>
                  </div>
                ))
              )}
            </div>

            {pending.length > 0 ? (
              <>
                <div className="mb-2 mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Pending productive contributions
                </div>
                <div className="space-y-1.5">
                  {pending.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-amber-500/20 bg-[var(--warning-soft)] px-2 py-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p.projectName}</span>
                        <Badge variant="pending">Pending</Badge>
                      </div>
                      <div className="mt-0.5 text-muted-foreground">
                        {p.resourceType} · est. {formatNumber(p.rewardTokens)} tokens
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {verified.length > 0 ? (
              <>
                <div className="mb-2 mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent settled contributions
                </div>
                <div className="max-h-24 space-y-1 overflow-y-auto scrollbar-thin">
                  {verified.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg px-2 py-1 text-xs text-muted-foreground"
                    >
                      <span>{v.projectName}</span>
                      <Badge variant="success">
                        {v.settlementStatus === "IMMEDIATE"
                          ? "Immediate"
                          : "Released"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <Link
              href="/portfolio"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-lg border border-border py-2 text-center text-xs font-medium text-accent hover:bg-muted"
            >
              View in portfolio
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function notifyWalletRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vf:wallet-refresh"));
  }
}
