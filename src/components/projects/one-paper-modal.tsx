"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

type Round = {
  title: string;
  objective: string;
  targetValue: number;
  fundedValue: number;
  expectedDeliverables: string[];
  risks: string[];
  returns: { title: string; description: string; type: string }[];
  resources: { label: string; targetAmount: number; fundedAmount: number; unit: string }[];
} | null | undefined;

export function OnePaperModal({
  project,
  activeRound,
}: {
  project: {
    name: string;
    shortDescription: string;
    category: string;
    stage: string;
    tokenSymbol?: string | null;
    tokenName?: string | null;
    risks: string[];
  };
  activeRound: Round;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <FileText className="h-3.5 w-3.5" /> One-Paper
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  One-Paper
                </div>
                <h2 className="text-lg font-semibold">{project.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-5 p-5 text-sm">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Positioning
                </h3>
                <p className="mt-1 text-muted-foreground">{project.shortDescription}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">{project.category}</Badge>
                  <Badge variant="outline">{project.stage}</Badge>
                </div>
              </section>

              {activeRound ? (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Build Round
                  </h3>
                  <p className="mt-1 font-medium">{activeRound.title}</p>
                  <p className="mt-1 text-muted-foreground">{activeRound.objective}</p>
                  <p className="mt-2 text-muted-foreground">
                    Target {formatNumber(activeRound.targetValue)} BU · Funded{" "}
                    {formatNumber(activeRound.fundedValue)} BU
                  </p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {activeRound.expectedDeliverables.map((d) => (
                      <li key={d}>• {d}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Economic model
                </h3>
                <p className="mt-1 text-muted-foreground">
                  Resources convert to Build Units. Liquid capital (VIBE) settles
                  immediately into Project Tokens. Productive capacity (GPU hours, agent
                  hours, agentic credits) settles after contribution verification.
                </p>
                {project.tokenSymbol ? (
                  <p className="mt-2 text-muted-foreground">
                    Token: <span className="text-foreground">{project.tokenName}</span> (
                    {project.tokenSymbol})
                  </p>
                ) : null}
                {activeRound?.returns.map((r) => (
                  <div key={r.title} className="mt-2 rounded-xl border border-border p-3">
                    <div className="font-medium">{r.title}</div>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                ))}
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Risks
                </h3>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {(activeRound?.risks || project.risks).map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
