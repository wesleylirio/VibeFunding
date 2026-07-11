"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GemmaOrb } from "@/components/gemma/gemma-orb";

export function OnboardingCard({
  firstName,
  recommendedSlug = "collabmesh",
}: {
  firstName: string;
  recommendedSlug?: string;
}) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function finish() {
    await fetch("/api/demo/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingSeen: true }),
    });
    setDismissed(true);
    router.refresh();
  }

  return (
    <div className="card-surface card-glow relative overflow-hidden p-5 md:p-6">
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start">
        <GemmaOrb size={48} state="reporting" />
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gemma">
            Welcome, {firstName}
          </div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            How VibeFunding works
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">1. VIBE → AMD GPU</strong> — 50
              VIBE funds 1 AMD GPU Hour on a Build Round.
            </li>
            <li>
              <strong className="text-foreground">2. Gemma recommends</strong> —
              matches and diligence, not auto-invest.
            </li>
            <li>
              <strong className="text-foreground">3. You allocate</strong> — open{" "}
              <Link
                href={`/projects/${recommendedSlug}`}
                className="text-accent hover:underline"
              >
                CollabMesh
              </Link>{" "}
              and invest VIBE.
            </li>
            <li>
              <strong className="text-foreground">4. Proof of Build</strong> — see
              what shipped and track portfolio upside.
            </li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/projects/${recommendedSlug}`}
              className="inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-medium text-white"
            >
              Open CollabMesh
            </Link>
            <Link
              href="/proofs/proof-collabmesh-1"
              className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium"
            >
              View Proof of Build
            </Link>
            <Button type="button" variant="ghost" onClick={finish}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
