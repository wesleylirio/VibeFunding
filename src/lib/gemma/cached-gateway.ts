import type { GemmaGateway } from "./types";
import type { GemmaChatInput, GemmaInsight, GemmaResponse } from "@/lib/types";
import type { FounderAssistResponse } from "./types";
import { MockGemmaGateway } from "./mock-gateway";

/**
 * CachedGemmaGateway wraps another gateway and labels responses as CACHE
 * when served from deterministic seed/cache paths. In Demo Mode this is
 * primarily the mock with cache semantics for diligence cards.
 */
export class CachedGemmaGateway implements GemmaGateway {
  constructor(private inner: GemmaGateway = new MockGemmaGateway()) {}

  async chat(input: GemmaChatInput): Promise<GemmaResponse> {
    const res = await this.inner.chat(input);
    // Structured diligence/portfolio pulls are treated as cached demo content
    if (
      input.context === "PROJECT_DILIGENCE" ||
      input.context === "INVESTOR_PORTFOLIO" ||
      input.context === "PROOF_OF_BUILD"
    ) {
      return {
        ...res,
        provider: res.provider === "AMD_GEMMA" ? "AMD_GEMMA" : "CACHE",
      };
    }
    return res;
  }

  async analyzeProject(input: { projectId: string }): Promise<GemmaInsight> {
    const insight = await this.inner.analyzeProject(input);
    return {
      ...insight,
      provider: insight.provider === "AMD_GEMMA" ? "AMD_GEMMA" : "CACHE",
    };
  }

  async analyzePortfolio(input: {
    investorId: string;
  }): Promise<GemmaInsight> {
    const insight = await this.inner.analyzePortfolio(input);
    return {
      ...insight,
      provider: insight.provider === "AMD_GEMMA" ? "AMD_GEMMA" : "CACHE",
    };
  }

  async summarizeProof(input: { proofId: string }): Promise<GemmaInsight> {
    const insight = await this.inner.summarizeProof(input);
    return {
      ...insight,
      provider: insight.provider === "AMD_GEMMA" ? "AMD_GEMMA" : "CACHE",
    };
  }

  async assistFounder(input: {
    projectId: string;
    buildRoundId?: string;
    mode: "review" | "stakeholder-update" | "clarity";
    draft?: string;
  }): Promise<FounderAssistResponse> {
    return this.inner.assistFounder(input);
  }
}
