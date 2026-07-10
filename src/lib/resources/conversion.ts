import type { ResourceType } from "@/lib/types";

/**
 * Internal normalization to Build Units (BU).
 * Productive capacity requires verification before Project Tokens are released.
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
    description: "Liquid network capital — settles immediately.",
  },
  STABLECOIN: {
    resourceType: "STABLECOIN",
    unitLabel: "USD",
    label: "Stablecoin",
    buildUnitsPerUnit: 1,
    requiresVerification: false,
    description: "Liquid capital — settles immediately.",
  },
  AMD_GPU_HOURS: {
    resourceType: "AMD_GPU_HOURS",
    unitLabel: "GPU hours",
    label: "AMD GPU hours",
    buildUnitsPerUnit: 50,
    requiresVerification: true,
    description: "Productive compute — tokens release after verification.",
  },
  AGENT_HOURS: {
    resourceType: "AGENT_HOURS",
    unitLabel: "agent hours",
    label: "Agent hours",
    buildUnitsPerUnit: 100,
    requiresVerification: true,
    description: "Coding-agent capacity — tokens release after verification.",
  },
  AGENT_TOKENS: {
    resourceType: "AGENT_TOKENS",
    unitLabel: "credits",
    label: "Agentic credits",
    buildUnitsPerUnit: 0.0002,
    requiresVerification: true,
    description:
      "Inference/agentic credits normalized to Build Units (provider tokens are not equivalent 1:1).",
  },
  COMPUTE_UNITS: {
    resourceType: "COMPUTE_UNITS",
    unitLabel: "CU",
    label: "Compute units",
    buildUnitsPerUnit: 10,
    requiresVerification: true,
    description: "Normalized compute — tokens release after verification.",
  },
};

export type SettlementStatus =
  | "IMMEDIATE"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REWARD_RELEASED";

export function getConversionRate(type: ResourceType): ResourceConversionRate {
  return CONVERSION_RATES[type] ?? CONVERSION_RATES.VIBE;
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
  const nftEligible =
    input.projectId === "proj-collabmesh" &&
    !rate.requiresVerification &&
    buildUnits >= (input.nftThresholdBu ?? 2000);

  return {
    rate,
    buildUnits,
    estimatedTokens,
    requiresVerification: rate.requiresVerification,
    settlement: rate.requiresVerification
      ? ("PENDING_VERIFICATION" as const)
      : ("IMMEDIATE" as const),
    nftEligible,
  };
}

export const RESOURCE_OPTIONS: ResourceType[] = [
  "VIBE",
  "AMD_GPU_HOURS",
  "AGENT_HOURS",
  "AGENT_TOKENS",
];
