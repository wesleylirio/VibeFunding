"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Coins,
  Gift,
  PartyPopper,
  Users,
} from "lucide-react";
import { AgentReplay, type ReplayEvent } from "@/components/agents/agent-replay";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import {
  clearInvestOutcome,
  readInvestOutcome,
  type InvestOutcome,
} from "@/lib/demo/invest-outcome";

type RunShape = {
  id: string;
  taskTitle: string;
  agentName: string;
  harness: string;
  model: string;
  provider: string;
  status: string;
  computeSource: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  computeTimeSeconds?: number | null;
  filesChanged?: number | null;
  testsPassed?: number | null;
  testsTotal?: number | null;
  commitHash?: string | null;
  replayLabel: string;
  publicSummary?: string | null;
};

function useCountUp(target: number, active: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target <= 0) {
      setValue(active ? target : 0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);
  return value;
}

/**
 * Proof page body: agents → rewards (dopamine) → technical evidence → Community.
 */
export function PostInvestProofFlow({
  run,
  events,
  role,
  projectName,
  projectSlug,
  accentColor,
  roundTitle,
  communityHref,
  tokenSymbol,
  defaultSupporters,
  technicalEvidence,
}: {
  run: RunShape | null;
  events: ReplayEvent[];
  role: "INVESTOR" | "FOUNDER";
  projectName?: string;
  projectSlug?: string;
  accentColor: string;
  roundTitle?: string;
  communityHref: string;
  tokenSymbol?: string | null;
  defaultSupporters: number;
  technicalEvidence: React.ReactNode;
}) {
  const [outcome, setOutcome] = useState<InvestOutcome | null>(null);
  const [execDone, setExecDone] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const completedOnce = useRef(false);

  useEffect(() => {
    const o = readInvestOutcome();
    if (o && (!projectSlug || o.projectSlug === projectSlug)) {
      setOutcome(o);
    }
  }, [projectSlug]);

  const handleComplete = useCallback(() => {
    if (completedOnce.current) return;
    completedOnce.current = true;
    setExecDone(true);
    setShowBurst(true);
    window.setTimeout(() => setShowBurst(false), 2200);
  }, []);

  useEffect(() => {
    if (!run || events.length === 0) handleComplete();
  }, [run, events.length, handleComplete]);

  const tokens = outcome?.tokens ?? 0;
  const symbol = outcome?.tokenSymbol || tokenSymbol || "TOKEN";
  const supporters = outcome?.supportersCount ?? defaultSupporters;
  const nft = outcome?.nft;
  const fromInvest = Boolean(outcome);
  const counted = useCountUp(tokens, execDone && tokens > 0);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gemma/30 bg-gemma-soft/40 px-4 py-3 text-sm">
        <span className="font-medium text-gemma">
          {fromInvest ? "After invest · Agents running" : "Proof of Build"}
        </span>
        <span className="text-muted-foreground">
          {fromInvest
            ? " — watch the agent finish. Tokens unlock when the run completes."
            : " — Agents at work → rewards → Community → Portfolio"}
        </span>
      </div>

      {/* 1 · Agents */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Agents at work</h2>
        <p className="text-sm text-muted-foreground">
          {fromInvest
            ? "Your VIBE is funding this AMD GPU run. ~60s at 1x — use 2x if you want it faster."
            : "Recorded agent execution that produced this proof. ~60s at 1x."}
        </p>
        {run ? (
          <AgentReplay
            run={run}
            events={events}
            role={role}
            projectName={projectName}
            accentColor={accentColor}
            roundTitle={roundTitle}
            onComplete={handleComplete}
          />
        ) : (
          <div className="card-surface p-6 text-sm text-muted-foreground">
            No agent replay for this proof.
          </div>
        )}
      </section>

      {!execDone ? (
        <p className="text-center text-xs text-muted-foreground">
          Tokens and NFT unlock when this agent run finishes…
        </p>
      ) : null}

      {/* 2 · Rewards with dopamine */}
      {execDone ? (
        <section className="relative space-y-3">
          {showBurst ? (
            <div
              className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl"
              aria-hidden
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/3 h-2 w-2 rounded-full"
                  style={
                    {
                      background:
                        i % 3 === 0
                          ? "var(--vibe)"
                          : i % 3 === 1
                            ? "var(--gemma)"
                            : "var(--teal)",
                      animation: "reward-burst 1.1s ease-out forwards",
                      animationDelay: `${i * 0.03}s`,
                      ["--a" as string]: `${i * 20}deg`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ) : null}

          <div
            className={cn(
              "card-surface relative overflow-hidden p-5 md:p-7",
              "animate-reward-pop border-vibe/40"
            )}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
              style={{ background: "var(--vibe)" }}
            />
            <div className="relative z-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vibe-soft text-vibe">
                <PartyPopper className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-vibe">
                You earned
              </p>
              {fromInvest && tokens > 0 ? (
                <p className="mt-1 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  +{formatNumber(counted)}{" "}
                  <span className="text-vibe">${symbol}</span>
                </p>
              ) : (
                <p className="mt-1 font-display text-2xl font-semibold">
                  Execution complete
                </p>
              )}
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {fromInvest && tokens > 0
                  ? "Tokens are now in your portfolio — agents finished the run and sealed the proof."
                  : "Project tokens settle when the agent run completes and Proof of Build is sealed."}
              </p>
            </div>

            <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Distributed to
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {supporters}
                </p>
                <p className="text-xs text-muted-foreground">
                  supporters this round (including you)
                </p>
              </div>
              {nft ? (
                <div className="rounded-xl border border-gemma/30 bg-gemma-soft/50 p-4 text-left animate-reward-pop">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gemma">
                    <Gift className="h-3.5 w-3.5" />
                    NFT unlocked
                  </div>
                  <p className="mt-2 text-sm">
                    <span className="mr-2 text-2xl" aria-hidden>
                      {nft.imageEmoji}
                    </span>
                    <strong>{nft.name}</strong>
                    <Badge variant="outline" className="ml-2">
                      {nft.rarity}
                    </Badge>
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/40 p-4 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Coins className="h-3.5 w-3.5" />
                    Proof sealed
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Hashes and tests verified for this deliverable.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* 3 · Technical evidence (expandable) */}
      {execDone ? (
        <details className="card-surface group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold">
            <span>
              Technical evidence
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                hashes · artifacts
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-border p-4">{technicalEvidence}</div>
        </details>
      ) : null}

      {/* 4 · Community — after technical evidence */}
      {execDone ? (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Next: Community</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Meet other supporters and follow Build Round updates.
              </p>
            </div>
            <Link
              href={communityHref}
              onClick={() => clearInvestOutcome()}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Open Community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            After Community → Portfolio
          </p>
        </section>
      ) : null}
    </div>
  );
}
