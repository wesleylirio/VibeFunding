export type DemoRole = "INVESTOR" | "FOUNDER";

export type ResourceType =
  | "VIBE"
  | "STABLECOIN"
  | "AGENT_TOKENS"
  | "AGENT_HOURS"
  | "AMD_GPU_HOURS"
  | "COMPUTE_UNITS";

export type GemmaContext =
  | "GLOBAL_DISCOVERY"
  | "INVESTOR_PORTFOLIO"
  | "PROJECT_DILIGENCE"
  | "BUILD_ROUND_ANALYSIS"
  | "PROOF_OF_BUILD"
  | "FOUNDER_PROJECT"
  | "FOUNDER_BUILD_ROUND"
  | "FOUNDER_STAKEHOLDER_UPDATE";

export type GemmaProvider = "AMD_GEMMA" | "CACHE" | "DEMO";

export interface GemmaInsight {
  title: string;
  summary: string;
  risks?: string[];
  strengths?: string[];
  questions?: string[];
  portfolioImpact?: string;
  sources?: string[];
  generatedAt: string;
  provider: GemmaProvider;
  /** Optional structured fields from live AMD JSON */
  importantChanges?: string[];
  projectsNeedingAttention?: string[];
  opportunitySuggestions?: string[];
  executionAssessment?: string;
  buildRoundAssessment?: string;
  portfolioRelevance?: string;
  whatWasFunded?: string;
  whatWasProduced?: string;
  whatEvidenceExists?: string;
  whatRemainsUnverified?: string;
}

export interface GemmaChatInput {
  message: string;
  context: GemmaContext;
  projectId?: string;
  projectSlug?: string;
  proofId?: string;
  buildRoundId?: string;
  role?: DemoRole;
}

export interface GemmaResponse {
  content: string;
  insight?: GemmaInsight;
  provider: GemmaProvider;
  latencyMs: number;
  model?: string;
}

/** Product-facing labels — never expose internal demo jargon in UI. */
export const RESOURCE_LABELS: Record<ResourceType, string> = {
  VIBE: "VIBE",
  STABLECOIN: "Stablecoin",
  AGENT_TOKENS: "Model credits",
  AGENT_HOURS: "Agent hours",
  AMD_GPU_HOURS: "AMD GPU Hours",
  COMPUTE_UNITS: "Compute units",
};

/** Product copy: VIBE funds AMD GPU Cloud Credits for agent work. */
export const CONTRIBUTION_BLURB =
  "Contribute with VIBE. VIBE allocates AMD GPU Cloud Credits that power agent work — demo rate: 1,000 VIBE = 1 AMD GPU Hour.";
