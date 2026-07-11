"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  VIBE_AMD_CONVERSION_LABEL,
  VIBE_PER_AMD_GPU_HOUR,
  formatAmdGpuHours,
  previewAllocation,
} from "@/lib/resources/conversion";
import { formatNumber } from "@/lib/utils";
import { notifyWalletRefresh } from "@/components/wallet/wallet-bar";
import { saveInvestOutcome } from "@/lib/demo/invest-outcome";
import { cn } from "@/lib/utils";

export function AllocationModal({
  open,
  onClose,
  buildRoundId,
  projectId,
  projectName,
  roundTitle,
  tokenSymbol,
  vibeBalance,
  primaryProofId,
}: {
  open: boolean;
  onClose: () => void;
  buildRoundId: string;
  projectId: string;
  projectName: string;
  roundTitle: string;
  tokenSymbol?: string | null;
  vibeBalance: number;
  deliverables?: string[];
  objective?: string;
  primaryProofId?: string | null;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("1000");
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [pending, startTransition] = useTransition();

  const preview = useMemo(() => {
    const n = Number(amount) || 0;
    return previewAllocation({
      projectId,
      resourceType: "VIBE",
      amount: n,
    });
  }, [amount, projectId]);

  if (!open) return null;

  const n = Number(amount) || 0;

  function resetAndClose() {
    if (redirecting) return;
    setError(null);
    setRedirecting(false);
    onClose();
  }

  async function confirm() {
    if (pending || redirecting) return;
    setError(null);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a positive VIBE amount.");
      return;
    }
    if (n > vibeBalance) {
      setError("Amount exceeds your VIBE balance.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/rounds/${buildRoundId}/allocate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceType: "VIBE", amount: n }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Investment failed");

        const proofId = primaryProofId || data.proofId;
        if (!proofId) {
          throw new Error("Proof of Build was not created. Please try again.");
        }
        const tokens = data.tokensReleased || data.rewardTokens || 0;

        saveInvestOutcome({
          projectSlug: data.projectSlug,
          projectName: data.projectName || projectName,
          proofId,
          amount: data.amount ?? n,
          tokens,
          tokenSymbol: data.tokenSymbol || tokenSymbol || "TOKEN",
          amdGpuHours: data.amdGpuHours ?? preview.amdGpuHours,
          // +1 for the current investor; seed may already have others
          supportersCount: Math.max(3, Number(data.supportersCount) || 12),
          nft: data.nft
            ? {
                name: data.nft.name,
                imageEmoji: data.nft.imageEmoji,
                rarity: data.nft.rarity,
              }
            : null,
          createdAt: new Date().toISOString(),
        });

        notifyWalletRefresh();
        setRedirecting(true);
        // Short beat so backdrop dim is felt, then straight into Proof / agents
        window.setTimeout(() => {
          router.push(`/proofs/${proofId}`);
          router.refresh();
        }, 450);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Investment failed");
      }
    });
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4",
        redirecting
          ? "bg-black/80 backdrop-blur-md"
          : "bg-black/55 backdrop-blur-sm"
      )}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invest-title"
        onClick={(e) => e.stopPropagation()}
      >
        {redirecting ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal" />
            <div className="text-sm font-semibold">Funding AMD GPU…</div>
            <p className="text-xs text-muted-foreground">
              Taking you to Proof of Build so you can watch agents execute.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 id="invest-title" className="text-lg font-semibold">
                  Invest with VIBE
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {projectName} · {roundTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3 rounded-2xl border border-compute/30 bg-compute/5 px-3 py-3">
                <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-compute" />
                <div className="min-w-0 text-sm">
                  <div className="font-semibold text-foreground">
                    {VIBE_AMD_CONVERSION_LABEL}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    After invest you watch agents run. Tokens settle when the
                    run completes.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    VIBE amount
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Available: {formatNumber(vibeBalance)} VIBE
                  </span>
                </div>
                <Input
                  className="mt-2"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[500, 1000, 2500, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                        n === preset
                          ? "border-primary bg-vibe-soft text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {formatNumber(preset)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
                <Row
                  label="→ AMD GPU"
                  value={formatAmdGpuHours(preview.amdGpuHours)}
                />
                <Row
                  label="Est. tokens (after run)"
                  value={`${formatNumber(preview.estimatedTokens)} ${tokenSymbol || ""}`.trim()}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Settlement</span>
                  <Badge variant="outline">After agent execution</Badge>
                </div>
                <p className="pt-1 text-[11px] text-muted-foreground">
                  {VIBE_PER_AMD_GPU_HOUR} VIBE per AMD GPU Hour · tokens unlock
                  when Proof of Build is sealed.
                </p>
              </div>

              {error ? <p className="text-sm text-danger">{error}</p> : null}

              <div className="flex justify-between gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetAndClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  onClick={confirm}
                  disabled={pending}
                >
                  {pending ? "Investing…" : "Confirm · watch agents"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}
