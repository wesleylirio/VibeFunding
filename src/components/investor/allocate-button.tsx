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
  label = "Allocate resources",
  variant = "accent" as const,
}: {
  buildRoundId: string;
  projectId: string;
  projectName: string;
  roundTitle: string;
  tokenSymbol?: string | null;
  vibeBalance: number;
  label?: string;
  variant?: "primary" | "secondary" | "accent" | "gemma";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant={variant} onClick={() => setOpen(true)}>
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
      />
    </>
  );
}
