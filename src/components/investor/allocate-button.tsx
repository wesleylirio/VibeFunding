"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AllocationModal } from "./allocation-modal";

export function AllocateButton({
  buildRoundId,
  projectId,
  projectName,
  roundTitle,
  tokenSymbol,
  vibeBalance,
  label = "Invest with VIBE",
  variant = "accent" as const,
  deliverables = [],
  objective,
  primaryProofId,
  disabled = false,
}: {
  buildRoundId: string;
  projectId: string;
  projectName: string;
  roundTitle: string;
  tokenSymbol?: string | null;
  vibeBalance: number;
  label?: string;
  variant?: "primary" | "secondary" | "accent" | "gemma";
  deliverables?: string[];
  objective?: string;
  primaryProofId?: string | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant={variant} onClick={() => setOpen(true)} disabled={disabled}>
        {label}
      </Button>
      <AllocationModal
        open={open}
        onClose={() => setOpen(false)}
        buildRoundId={buildRoundId}
        projectId={projectId}
        projectName={projectName}
        roundTitle={roundTitle}
        tokenSymbol={tokenSymbol}
        vibeBalance={vibeBalance}
        deliverables={deliverables}
        objective={objective}
        primaryProofId={primaryProofId}
      />
    </>
  );
}
