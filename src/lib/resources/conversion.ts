import type { ResourceType } from "@/lib/types";

/**
 * Contribution model
 * ──────────────────
 * Investors contribute VIBE.
 * VIBE converts into AMD GPU Cloud Credits (measured as AMD GPU Hours)
 * that power agent execution on the Build Round — the product framing for
 * AMD Developer Hackathon Track 3 (agentic startups + compute-backed builds).
 *
 * Rate:
 *   50 VIBE = 1 AMD GPU Hour
 *
 * Build Units remain an internal normalization (1 VIBE → 1 BU) for token math.
 */

/** How many VIBE equal one AMD GPU hour. */
export const VIBE_PER_AMD_GPU_HOUR = 50;

/** Product-facing conversion line for UI. */
export const VIBE_AMD_CONVERSION_LABEL = "50 VIBE = 1 AMD GPU Hour";

/**
 * Internal normalization to Build Units (BU).
 * Investor contributions use VIBE; other resource types remain for seed/history.
 */
export interface ResourceConversionRate {
  resourceType: ResourceType;
  unitLabel: string;
  label: string;
  buildUnitsPerUnit: number;
  requiresVerification: boolean;
  description: string;
}

/** Tokens received per Build Unit for each project (configurable). */
export const PROJECT_TOKEN_PER_BU: Record<string, number> = {
  "proj-collabmesh": 0.8,
  "proj-inferlane": 1.1,
  "proj-auditforge": 1.0,
};

export const CONVERSION_RATES: Record<ResourceType, ResourceConversionRate> = {
  VIBE: {
    resourceType: "VIBE",
    unitLabel: "VIBE",
    label: "VIBE",
    buildUnitsPerUnit: 1,
    requiresVerification: false,
    description:
      "Invest VIBE to fund AMD GPU Cloud Credits for agent execution. Converts immediately — 50 VIBE = 1 AMD GPU Hour.",
  },
  STABLECOIN: {
    resourceType: "STABLECOIN",
    unitLabel: "USD",
    label: "Stablecoin",
    buildUnitsPerUnit: 1,
    requiresVerification: false,
    description: "Contribute with VIBE to fund this Build Round.",
  },
  AMD_GPU_HOURS: {
    resourceType: "AMD_GPU_HOURS",
    unitLabel: "GPU hours",
    label: "AMD GPU Hours",
    buildUnitsPerUnit: VIBE_PER_AMD_GPU_HOUR,
    requiresVerification: true,
    description:
      "AMD GPU Cloud Credits funded through VIBE conversion (50 VIBE = 1 hour).",
  },
  AGENT_HOURS: {
    resourceType: "AGENT_HOURS",
    unitLabel: "agent hours",
    label: "Agent hours",
    buildUnitsPerUnit: 100,
    requiresVerification: true,
    description: "Contribute with VIBE to fund agent execution.",
  },
  AGENT_TOKENS: {
    resourceType: "AGENT_TOKENS",
    unitLabel: "credits",
    label: "Model credits",
    buildUnitsPerUnit: 0.0002,
    requiresVerification: true,
    description: "Contribute with VIBE to fund model compute.",
  },
  COMPUTE_UNITS: {
    resourceType: "COMPUTE_UNITS",
    unitLabel: "CU",
    label: "Compute units",
    buildUnitsPerUnit: 10,
    requiresVerification: true,
    description: "Contribute with VIBE to fund productive compute.",
  },
};

export type SettlementStatus =
  | "IMMEDIATE"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REWARD_RELEASED";

/** Investor contribution options in product UI. */
export const RESOURCE_OPTIONS: ResourceType[] = ["VIBE"];

export function getConversionRate(type: ResourceType): ResourceConversionRate {
  return CONVERSION_RATES[type] ?? CONVERSION_RATES.VIBE;
}

/** Convert VIBE amount into AMD GPU Hours (cloud credits). */
export function vibeToAmdGpuHours(vibeAmount: number): number {
  if (!Number.isFinite(vibeAmount) || vibeAmount <= 0) return 0;
  return Math.round((vibeAmount / VIBE_PER_AMD_GPU_HOUR) * 1000) / 1000;
}

/** Convert AMD GPU Hours back to VIBE (for targets / display). */
export function amdGpuHoursToVibe(hours: number): number {
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.round(hours * VIBE_PER_AMD_GPU_HOUR * 1000) / 1000;
}

export function formatAmdGpuHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0 AMD GPU Hours";
  if (hours < 0.01) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `~${mins} min of AMD GPU`;
  }
  const rounded =
    hours >= 10 ? Math.round(hours) : Math.round(hours * 100) / 100;
  return `${rounded} AMD GPU Hour${rounded === 1 ? "" : "s"}`;
}

export function toBuildUnits(type: ResourceType, amount: number): number {
  const rate = getConversionRate(type);
  return Math.round(amount * rate.buildUnitsPerUnit * 1000) / 1000;
}

export function estimateProjectTokens(
  projectId: string,
  buildUnits: number
): number {
  const perBu = PROJECT_TOKEN_PER_BU[projectId] ?? 1;
  return Math.round(buildUnits * perBu * 100) / 100;
}

export function previewAllocation(input: {
  projectId: string;
  resourceType: ResourceType;
  amount: number;
  nftThresholdBu?: number;
}) {
  const rate = getConversionRate(input.resourceType);
  const buildUnits = toBuildUnits(input.resourceType, input.amount);
  const estimatedTokens = estimateProjectTokens(input.projectId, buildUnits);
  const amdGpuHours =
    input.resourceType === "VIBE"
      ? vibeToAmdGpuHours(input.amount)
      : input.resourceType === "AMD_GPU_HOURS"
        ? input.amount
        : 0;
  const nftEligible =
    input.projectId === "proj-collabmesh" &&
    !rate.requiresVerification &&
    buildUnits >= (input.nftThresholdBu ?? 2000);

  return {
    rate,
    buildUnits,
    estimatedTokens,
    amdGpuHours,
    conversionLabel: VIBE_AMD_CONVERSION_LABEL,
    requiresVerification: rate.requiresVerification,
    settlement: rate.requiresVerification
      ? ("PENDING_VERIFICATION" as const)
      : ("IMMEDIATE" as const),
    nftEligible,
  };
}
