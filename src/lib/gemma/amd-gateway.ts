import type { GemmaChatInput, GemmaInsight, GemmaResponse } from "@/lib/types";
import type {
  FounderAssistInput,
  FounderAssistResponse,
  GemmaGateway,
  PortfolioAnalysisInput,
  ProjectAnalysisInput,
  ProofSummaryInput,
} from "./types";
import { MockGemmaGateway } from "./mock-gateway";
import {
  getAmdConfigFromEnv,
  isAmdConfigured,
  openAIChatCompletion,
} from "./openai-client";
import {
  buildChatContextPayload,
  buildPortfolioContext,
  buildProjectContext,
  buildProofContext,
  buildQuickstartPromptContext,
  buildStakeholderContext,
} from "./context-builders";
import {
  extractJson,
  founderAssistSchema,
  gemmaInsightSchema,
  quickstartDraftSchema,
} from "./schemas";
import {
  contextHash,
  getCached,
  setCache,
} from "./cache";
import type { QuickstartDraft, QuickstartInput } from "@/lib/founder/quickstart";
import { generateQuickstartDraft } from "@/lib/founder/quickstart";
import { nowIso } from "@/lib/db/seed-data";

const SYSTEM_BASE = `You are Gemma, the VibeFunding portfolio copilot for the agentic economy.
Rules:
- Be concise, professional, and investor-friendly.
- Never present regulated financial advice.
- Never execute investments or publish founder content.
- Never claim Proof of Build guarantees code quality or project success.
- Do not invent private data not present in the provided context.
- Prefer concrete, structured observations over marketing language.`;

function toInsight(
  raw: ReturnType<typeof gemmaInsightSchema.parse>,
  meta: { provider: GemmaResponse["provider"]; model?: string }
): GemmaInsight {
  return {
    title: raw.title,
    summary: raw.summary,
    risks: raw.risks,
    strengths: raw.strengths,
    questions: raw.questions,
    portfolioImpact: raw.portfolioImpact,
    sources: raw.sources,
    generatedAt: nowIso(),
    provider: meta.provider,
    importantChanges: raw.importantChanges,
    projectsNeedingAttention: raw.projectsNeedingAttention,
    opportunitySuggestions: raw.opportunitySuggestions,
    executionAssessment: raw.executionAssessment,
    buildRoundAssessment: raw.buildRoundAssessment,
    portfolioRelevance: raw.portfolioRelevance,
    whatWasFunded: raw.whatWasFunded,
    whatWasProduced: raw.whatWasProduced,
    whatEvidenceExists: raw.whatEvidenceExists,
    whatRemainsUnverified: raw.whatRemainsUnverified,
  };
}

export class AmdGemmaGateway implements GemmaGateway {
  private fallback = new MockGemmaGateway();

  /**
   * Always graceful: live AMD when configured, deterministic fallback otherwise.
   * GEMMA_PROVIDER=amd still falls back per-call so the product never crashes.
   */
  constructor() {
    /* gateway reads configuration from environment at call time */
  }

  get configured() {
    return isAmdConfigured();
  }

  get model() {
    return getAmdConfigFromEnv().model;
  }

  private async completeJson(
    system: string,
    user: string,
    opts?: { temperature?: number }
  ) {
    return openAIChatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      {
        temperature: opts?.temperature ?? 0.2,
        jsonMode: true,
      }
    );
  }

  private async completeText(system: string, user: string) {
    return openAIChatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.35 }
    );
  }

  async chat(input: GemmaChatInput): Promise<GemmaResponse> {
    const payload = buildChatContextPayload({
      context: input.context,
      projectId: input.projectId,
      projectSlug: input.projectSlug,
      proofId: input.proofId,
      buildRoundId: input.buildRoundId,
      displayName: undefined,
      role: input.role,
    });
    const key = `chat:${contextHash(input.context, {
      message: input.message,
      payload,
    })}`;
    const cached = getCached<GemmaResponse>(key);
    if (cached) {
      return {
        ...cached.value,
        provider: cached.provider === "AMD_GEMMA" ? "CACHE" : cached.value.provider,
      };
    }

    if (!this.configured) {
      return this.fallback.chat(input);
    }

    try {
      const system = `${SYSTEM_BASE}
Current page context: ${input.context}.
Answer using only the provided JSON context. Keep under 220 words unless asked for detail.`;
      const user = `Context JSON:\n${JSON.stringify(payload)}\n\nUser message:\n${input.message}`;
      const result = await this.completeText(system, user);
      const response: GemmaResponse = {
        content: result.content,
        provider: "AMD_GEMMA",
        latencyMs: result.latencyMs,
        model: result.model,
      };
      setCache(key, {
        value: response,
        provider: "AMD_GEMMA",
        model: result.model,
        latencyMs: result.latencyMs,
        requestId: result.requestId,
        contextType: input.context,
      });
      return response;
    } catch {
      return this.fallback.chat(input);
    }
  }

  async analyzeProject(input: ProjectAnalysisInput): Promise<GemmaInsight> {
    const ctx = buildProjectContext(input);
    if (!ctx) {
      return {
        title: "Project not found",
        summary: "I could not load this project for analysis.",
        generatedAt: nowIso(),
        provider: "DEMO",
      };
    }
    if (!this.configured) return this.fallback.analyzeProject(input);

    const key = `project:${contextHash("PROJECT_DILIGENCE", ctx)}`;
    const cached = getCached<GemmaInsight>(key);
    if (cached) {
      return {
        ...cached.value,
        provider: cached.provider === "AMD_GEMMA" ? "CACHE" : cached.value.provider,
        generatedAt: nowIso(),
      };
    }

    const system = `${SYSTEM_BASE}
Return ONLY JSON with keys:
title, summary, risks (string[]), strengths (string[]), questions (string[]),
executionAssessment (string), buildRoundAssessment (string), portfolioRelevance (string), sources (string[]).`;
    const user = `Perform due diligence on this public project data:\n${JSON.stringify(ctx)}`;
    try {
      let result = await this.completeJson(system, user);
      let parsed = extractJson(result.content);
      let validated = gemmaInsightSchema.safeParse(parsed);
      if (!validated.success) {
        result = await this.completeJson(
          system,
          `${user}\n\nValidation errors: ${validated.error.message}. JSON only.`,
          { temperature: 0 }
        );
        parsed = extractJson(result.content);
        validated = gemmaInsightSchema.safeParse(parsed);
      }
      if (!validated.success) return this.fallback.analyzeProject(input);
      const insight = toInsight(validated.data, {
        provider: "AMD_GEMMA",
        model: result.model,
      });
      setCache(key, {
        value: insight,
        provider: "AMD_GEMMA",
        model: result.model,
        latencyMs: result.latencyMs,
        requestId: result.requestId,
        contextType: "PROJECT_DILIGENCE",
      });
      return insight;
    } catch {
      return this.fallback.analyzeProject(input);
    }
  }

  async analyzePortfolio(input: PortfolioAnalysisInput): Promise<GemmaInsight> {
    const ctx = buildPortfolioContext({ investorId: input.investorId });
    if (!this.configured) return this.fallback.analyzePortfolio(input);

    const key = `portfolio:${contextHash("INVESTOR_PORTFOLIO", ctx)}`;
    const cached = getCached<GemmaInsight>(key);
    if (cached) {
      return {
        ...cached.value,
        provider: cached.provider === "AMD_GEMMA" ? "CACHE" : cached.value.provider,
        generatedAt: nowIso(),
      };
    }

    const system = `${SYSTEM_BASE}
Return ONLY JSON with keys:
title, summary, risks (string[]), strengths (string[]), questions (string[]),
portfolioImpact (string), importantChanges (string[]), projectsNeedingAttention (string[]),
opportunitySuggestions (string[]), sources (string[]).`;
    const user = `Produce a portfolio briefing for this investor context:\n${JSON.stringify(ctx)}`;
    try {
      let result = await this.completeJson(system, user);
      let parsed = extractJson(result.content);
      let validated = gemmaInsightSchema.safeParse(parsed);
      if (!validated.success) {
        result = await this.completeJson(
          system,
          `${user}\n\nValidation errors: ${validated.error.message}. JSON only.`,
          { temperature: 0 }
        );
        parsed = extractJson(result.content);
        validated = gemmaInsightSchema.safeParse(parsed);
      }
      if (!validated.success) return this.fallback.analyzePortfolio(input);
      const insight = toInsight(validated.data, {
        provider: "AMD_GEMMA",
        model: result.model,
      });
      setCache(key, {
        value: insight,
        provider: "AMD_GEMMA",
        model: result.model,
        latencyMs: result.latencyMs,
        requestId: result.requestId,
        contextType: "INVESTOR_PORTFOLIO",
      });
      return insight;
    } catch {
      return this.fallback.analyzePortfolio(input);
    }
  }

  async summarizeProof(input: ProofSummaryInput): Promise<GemmaInsight> {
    const ctx = buildProofContext(input.proofId);
    if (!ctx) {
      return {
        title: "Proof not found",
        summary: "I could not locate this Proof of Build.",
        generatedAt: nowIso(),
        provider: "DEMO",
      };
    }
    if (!this.configured) return this.fallback.summarizeProof(input);

    const key = `proof:${contextHash("PROOF_OF_BUILD", ctx)}`;
    const cached = getCached<GemmaInsight>(key);
    if (cached) {
      return {
        ...cached.value,
        provider: cached.provider === "AMD_GEMMA" ? "CACHE" : cached.value.provider,
        generatedAt: nowIso(),
      };
    }

    const system = `${SYSTEM_BASE}
Explain a Proof of Build for non-technical stakeholders.
Never claim it guarantees code quality.
Return ONLY JSON with keys:
title, summary, risks (string[]), strengths (string[]),
whatWasFunded, whatWasProduced, whatEvidenceExists, whatRemainsUnverified, sources (string[]).`;
    const user = `Explain this public proof:\n${JSON.stringify(ctx)}`;
    try {
      let result = await this.completeJson(system, user);
      let parsed = extractJson(result.content);
      let validated = gemmaInsightSchema.safeParse(parsed);
      if (!validated.success) {
        result = await this.completeJson(
          system,
          `${user}\n\nValidation errors: ${validated.error.message}. JSON only.`,
          { temperature: 0 }
        );
        parsed = extractJson(result.content);
        validated = gemmaInsightSchema.safeParse(parsed);
      }
      if (!validated.success) return this.fallback.summarizeProof(input);
      const insight = toInsight(validated.data, {
        provider: "AMD_GEMMA",
        model: result.model,
      });
      setCache(key, {
        value: insight,
        provider: "AMD_GEMMA",
        model: result.model,
        latencyMs: result.latencyMs,
        requestId: result.requestId,
        contextType: "PROOF_OF_BUILD",
      });
      return insight;
    } catch {
      return this.fallback.summarizeProof(input);
    }
  }

  async assistFounder(input: FounderAssistInput): Promise<FounderAssistResponse> {
    const ctx = buildStakeholderContext({
      projectId: input.projectId,
      buildRoundId: input.buildRoundId,
      notes: input.draft,
    });
    if (!ctx) {
      return this.fallback.assistFounder(input);
    }

    const key = `founder:${contextHash(input.mode, ctx)}`;
    const cached = getCached<FounderAssistResponse>(key);
    if (cached) {
      return {
        ...cached.value,
        provider:
          cached.provider === "AMD_GEMMA" ? "CACHE" : cached.value.provider,
      };
    }

    if (!this.configured) {
      return this.fallback.assistFounder(input);
    }

    try {
      const system = `${SYSTEM_BASE}
You assist founders. Never publish automatically. Flag sensitive content.
Return ONLY JSON with keys: content, missingFields (string[]), suggestions (string[]), sensitiveHints (string[]), draftUpdate (string, markdown).`;
      const user = `Mode: ${input.mode}\nContext:\n${JSON.stringify(ctx)}`;
      let result = await this.completeJson(system, user);
      let parsed = extractJson(result.content);
      let validated = founderAssistSchema.safeParse(parsed);
      if (!validated.success) {
        result = await this.completeJson(
          system,
          `${user}\n\nFix JSON to match schema. Errors: ${validated.error.message}`,
          { temperature: 0 }
        );
        parsed = extractJson(result.content);
        validated = founderAssistSchema.safeParse(parsed);
      }
      if (!validated.success) {
        return this.fallback.assistFounder(input);
      }
      const response: FounderAssistResponse = {
        ...validated.data,
        provider: "AMD_GEMMA",
        latencyMs: result.latencyMs,
      };
      setCache(key, {
        value: response,
        provider: "AMD_GEMMA",
        model: result.model,
        latencyMs: result.latencyMs,
        requestId: result.requestId,
        contextType: `FOUNDER_${input.mode}`,
      });
      return response;
    } catch {
      return this.fallback.assistFounder(input);
    }
  }

  async generateQuickstart(
    input: QuickstartInput
  ): Promise<{ draft: QuickstartDraft; provider: GemmaResponse["provider"]; latencyMs: number }> {
    const ctx = buildQuickstartPromptContext(input);
    const key = `quickstart:${contextHash("FOUNDER_QUICKSTART", ctx)}`;
    const cached = getCached<QuickstartDraft>(key);
    if (cached) {
      return {
        draft: cached.value,
        provider: cached.provider === "AMD_GEMMA" ? "CACHE" : "DEMO",
        latencyMs: cached.latencyMs || 0,
      };
    }

    if (!this.configured) {
      const draft = generateQuickstartDraft(input);
      return { draft, provider: "DEMO", latencyMs: 0 };
    }

    try {
      const system = `${SYSTEM_BASE}
Generate an editable founder project draft for VibeFunding.
Return ONLY JSON with keys:
name, pitch, description, problem, solution, audience, stage,
buildRound: { title, objective, deliverables[], sprintDraft[], resources[{type,label,amount,unit}], estimatedBuildUnits, risks[], returns[{type,title,description}] },
token: { symbol, name },
nft: { name, utility[] },
investorSummary, onePaper.
Resource types should use VIBE, AMD_GPU_HOURS, AGENT_HOURS where appropriate.`;
      const user = `Founder answers:\n${JSON.stringify(ctx)}`;
      let result = await this.completeJson(system, user, { temperature: 0.4 });
      let parsed = extractJson(result.content);
      let validated = quickstartDraftSchema.safeParse(parsed);
      if (!validated.success) {
        result = await this.completeJson(
          system,
          `${user}\n\nFix JSON. Errors: ${validated.error.message}`,
          { temperature: 0 }
        );
        parsed = extractJson(result.content);
        validated = quickstartDraftSchema.safeParse(parsed);
      }
      if (!validated.success) {
        const draft = generateQuickstartDraft(input);
        return { draft, provider: "DEMO", latencyMs: result.latencyMs };
      }

      const data = validated.data;
      const draft: QuickstartDraft = {
        name: data.name,
        slug:
          data.slug ||
          data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 40),
        pitch: data.pitch,
        description: data.description,
        problem: data.problem,
        solution: data.solution,
        audience: data.audience,
        stage: data.stage,
        branding: {
          primary: data.branding?.primary || "#3b6ef5",
          secondary: data.branding?.secondary || "#22d3ee",
          pattern: data.branding?.pattern || "nodes",
        },
        buildRound: {
          title: data.buildRound.title,
          objective: data.buildRound.objective,
          deliverables: data.buildRound.deliverables,
          sprintDraft: data.buildRound.sprintDraft || [],
          resources: data.buildRound.resources || [],
          estimatedBuildUnits: data.buildRound.estimatedBuildUnits || 10000,
          risks: data.buildRound.risks || [],
          returns: data.buildRound.returns || [],
        },
        token: data.token,
        nft: {
          name: data.nft.name,
          utility: data.nft.utility || [],
        },
        investorSummary: data.investorSummary,
        onePaper: data.onePaper,
      };

      setCache(key, {
        value: draft,
        provider: "AMD_GEMMA",
        model: result.model,
        latencyMs: result.latencyMs,
        requestId: result.requestId,
        contextType: "FOUNDER_QUICKSTART",
      });
      return {
        draft,
        provider: "AMD_GEMMA",
        latencyMs: result.latencyMs,
      };
    } catch {
      const draft = generateQuickstartDraft(input);
      return { draft, provider: "DEMO", latencyMs: 0 };
    }
  }
}
