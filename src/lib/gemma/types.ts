import type {
  GemmaChatInput,
  GemmaInsight,
  GemmaResponse,
} from "@/lib/types";

export interface ProjectAnalysisInput {
  projectId: string;
  projectSlug?: string;
  investorId?: string;
}

export interface PortfolioAnalysisInput {
  investorId: string;
}

export interface ProofSummaryInput {
  proofId: string;
}

export interface FounderAssistInput {
  projectId: string;
  buildRoundId?: string;
  mode: "review" | "stakeholder-update" | "clarity";
  draft?: string;
}

export interface FounderAssistResponse {
  content: string;
  missingFields?: string[];
  suggestions?: string[];
  sensitiveHints?: string[];
  draftUpdate?: string;
  provider: GemmaResponse["provider"];
  latencyMs: number;
}

export interface GemmaGateway {
  chat(input: GemmaChatInput): Promise<GemmaResponse>;
  analyzeProject(input: ProjectAnalysisInput): Promise<GemmaInsight>;
  analyzePortfolio(input: PortfolioAnalysisInput): Promise<GemmaInsight>;
  summarizeProof(input: ProofSummaryInput): Promise<GemmaInsight>;
  assistFounder(input: FounderAssistInput): Promise<FounderAssistResponse>;
}
