"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ResourceType } from "@/lib/types";
import {
  CONVERSION_RATES,
  RESOURCE_OPTIONS,
  previewAllocation,
} from "@/lib/resources/conversion";
import { formatNumber } from "@/lib/utils";
import { notifyWalletRefresh } from "@/components/wallet/wallet-bar";

type SuccessState = {
  settlementStatus: string;
  requiresVerification: boolean;
  rewardTokens: number;
  tokensReleased: number;
  tokenSymbol?: string | null;
  buildUnits: number;
  projectSlug: string;
  projectName: string;
  nft?: {
    id: string;
    name: string;
    description: string;
    imageEmoji: string;
    rarity: string;
    utility: string[];
    released: boolean;
  } | null;
  resourceLabel: string;
  amount: number;
  allocationId: string;
};

export function AllocationModal({
  open,
  onClose,
  buildRoundId,
  projectId,
  projectName,
  roundTitle,
  tokenSymbol,
  vibeBalance,
}: {
  open: boolean;
  onClose: () => void;
  buildRoundId: string;
  projectId: string;
  projectName: string;
  roundTitle: string;
  tokenSymbol?: string | null;
  vibeBalance: number;
}) {
  const router = useRouter();
  const [resourceType, setResourceType] = useState<ResourceType>("VIBE");
  const [amount, setAmount] = useState("1000");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [pending, startTransition] = useTransition();
  const [verifying, setVerifying] = useState(false);

  const preview = useMemo(() => {
    const n = Number(amount) || 0;
    return previewAllocation({
      projectId,
      resourceType,
      amount: n,
    });
  }, [amount, resourceType, projectId]);

  if (!open) return null;

  async function confirm() {
    if (pending || success) return;
    setError(null);
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (resourceType === "VIBE" && n > vibeBalance) {
      setError("Amount exceeds your VIBE balance.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/rounds/${buildRoundId}/allocate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceType, amount: n }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Allocation failed");
        setSuccess({
          settlementStatus: data.settlementStatus,
          requiresVerification: data.requiresVerification,
          rewardTokens: data.rewardTokens,
          tokensReleased: data.tokensReleased,
          tokenSymbol: data.tokenSymbol,
          buildUnits: data.buildUnits,
          projectSlug: data.projectSlug,
          projectName: data.projectName,
          nft: data.nft,
          resourceLabel: data.resourceLabel,
          amount: data.amount,
          allocationId: data.allocationId,
        });
        notifyWalletRefresh();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Allocation failed");
      }
    });
  }

  async function verifyNow() {
    if (!success) return;
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch(`/api/allocations/${success.allocationId}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setSuccess({
        ...success,
        settlementStatus: "REWARD_RELEASED",
        requiresVerification: false,
        tokensReleased: data.tokensReleased,
        nft: success.nft
          ? { ...success.nft, released: data.nftReleased || success.nft.released }
          : null,
      });
      notifyWalletRefresh();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold">
              {success ? "Allocation complete" : "Allocate resources"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {projectName} · {roundTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="space-y-4 p-5 animate-reveal-up">
            <div className="flex items-center gap-2">
              {success.settlementStatus === "PENDING_VERIFICATION" ? (
                <Badge variant="pending">
                  <Clock className="mr-1 h-3 w-3" /> Pending verification
                </Badge>
              ) : success.settlementStatus === "REWARD_RELEASED" ? (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Reward released
                </Badge>
              ) : (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Immediate
                </Badge>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/10 to-gemma/10 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Contribution
              </div>
              <div className="mt-1 text-lg font-semibold">
                {formatNumber(success.amount)} {success.resourceLabel}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {formatNumber(success.buildUnits, 1)} Build Units →{" "}
                {success.tokensReleased > 0 ||
                success.settlementStatus !== "PENDING_VERIFICATION" ? (
                  <span className="font-medium text-foreground">
                    {formatNumber(
                      success.tokensReleased || success.rewardTokens
                    )}{" "}
                    {success.tokenSymbol}
                    {success.settlementStatus === "PENDING_VERIFICATION"
                      ? " estimated"
                      : " received"}
                  </span>
                ) : (
                  <span className="font-medium text-warning">
                    {formatNumber(success.rewardTokens)} {success.tokenSymbol}{" "}
                    estimated after verification
                  </span>
                )}
              </div>
            </div>

            {success.tokensReleased > 0 ? (
              <div className="rounded-2xl border border-success/30 bg-[var(--success-soft)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                  <Sparkles className="h-4 w-4" />
                  {formatNumber(success.tokensReleased)} {success.tokenSymbol}{" "}
                  added to wallet
                </div>
              </div>
            ) : null}

            {success.nft && (success.nft.released || success.settlementStatus === "PENDING_VERIFICATION") ? (
              <div className="rounded-2xl border border-gemma/30 bg-gemma-soft p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card text-2xl shadow-inner">
                    {success.nft.imageEmoji}
                  </div>
                  <div>
                    <div className="text-xs text-gemma">
                      {success.nft.released ? "NFT unlocked" : "NFT reserved"}
                    </div>
                    <div className="font-semibold">{success.nft.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {success.nft.rarity}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {success.nft.description}
                    </p>
                    <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                      {success.nft.utility.map((u) => (
                        <li key={u}>• {u}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            {success.settlementStatus === "PENDING_VERIFICATION" ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Productive capacity is pledged. Project Tokens release after
                  contribution verification.
                </p>
                <Button
                  type="button"
                  variant="accent"
                  onClick={verifyNow}
                  disabled={verifying}
                >
                  {verifying ? "Verifying…" : "Verify contribution"}
                </Button>
              </div>
            ) : null}

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/portfolio"
                className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-medium text-neutral-950 dark:bg-white"
              >
                View holding
              </Link>
              <Link
                href={`/projects/${success.projectSlug}/agents`}
                className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium"
              >
                Watch agents
              </Link>
              <Link
                href={`/projects/${success.projectSlug}/community`}
                className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium"
              >
                Join community
              </Link>
              <Button type="button" variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Resource type
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {RESOURCE_OPTIONS.map((opt) => {
                  const rate = CONVERSION_RATES[opt];
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setResourceType(opt)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition ${
                        resourceType === opt
                          ? "border-accent bg-accent-soft"
                          : "border-border hover:bg-white/5"
                      }`}
                    >
                      <div className="text-sm font-medium">{rate.label}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {rate.requiresVerification
                          ? "Pending verification"
                          : "Immediate settlement"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Amount ({preview.rate.unitLabel})
                </label>
                {resourceType === "VIBE" ? (
                  <span className="text-xs text-muted-foreground">
                    Available: {formatNumber(vibeBalance)} VIBE
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Capacity pledge
                  </span>
                )}
              </div>
              <Input
                className="mt-2"
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Conversion preview
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Build Units</span>
                <span className="font-medium tabular-nums">
                  {formatNumber(preview.buildUnits, 1)} BU
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {preview.requiresVerification
                    ? "Estimated Project Tokens"
                    : "Project Tokens"}
                </span>
                <span className="font-medium tabular-nums">
                  {formatNumber(preview.estimatedTokens)} {tokenSymbol || "TOKEN"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Settlement</span>
                <Badge variant={preview.requiresVerification ? "pending" : "success"}>
                  {preview.requiresVerification ? "Pending verification" : "Immediate"}
                </Badge>
              </div>
              {preview.nftEligible ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NFT reward</span>
                  <span className="text-gemma">Builder Presence Pass</span>
                </div>
              ) : null}
              <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
                {preview.requiresVerification
                  ? `Estimated reward: ${formatNumber(preview.estimatedTokens)} ${tokenSymbol || "tokens"} after contribution verification. Provider credit units are normalized into Build Units.`
                  : `You will receive ${formatNumber(preview.estimatedTokens)} ${tokenSymbol || "tokens"} immediately.`}
              </p>
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="accent" onClick={confirm} disabled={pending}>
                {pending ? "Confirming…" : "Confirm allocation"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
