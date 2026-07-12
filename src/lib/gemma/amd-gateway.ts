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
import { getPortfolio, getInvestedProjectSlugs } from "@/lib/queries/portfolio";

const SYSTEM_BASE = `You are Gemma, the VibeFunding portfolio copilot — an LLM-based assistant serving live investor intelligence for the agentic economy.
Rules:
- Be concise, professional, and investor-friendly. Use natural language, not bullet-spam.
- Never present regulated financial advice.
- Never execute investments or publish founder content.
- Never claim Proof of Build guarantees code quality or project success.
- Do not invent private data not present in the provided context.
- Prefer concrete, structured observations over marketing language.
- Answer the user's exact question first. Never replace it with a generic project or portfolio report.
- If the supplied context does not contain enough evidence, say what is unknown instead of inventing an answer.
- An empty holdings array means the investor has no project positions; never infer or invent holdings.
- When relevant, explain the demo conversion: 1,000 VIBE = 1 AMD GPU Hour. Clarify that this is a simulated product rate, not a market price.
- Make your independent analysis distinct from project marketing claims.
- Never re-suggest projects listed under alreadyInvestedSlugs / holdings for new investment — the user already funded those. Point them to other open Build Rounds instead. If they ask about a project they already hold, analyze it as a holding review, not a new investment pitch.
- If context shows the project's Build Round is already 100% funded, tell the user the round is full and suggest they wait for the next round.
- When the user's portfolio context is available, consider category concentration, existing holdings, and vibeBalance when giving recommendations. If they're already heavy in one category, note it.
- When comparing projects, prefer ones with Proof of Build evidence over ones without. Treat verified proofs as stronger signals than unverified ones.
- If a Build Round has low funding progress (<30%), flag the risk of stalling. If it's well-funded (>70%), note momentum as a positive signal.`;

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
    const payload = await buildChatContextPayload({
      context: input.context,
      projectId: input.projectId,
      projectSlug: input.projectSlug,
      proofId: input.proofId,
      buildRoundId: input.buildRoundId,
      displayName: input.displayName,
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
      console.log("[Gemma] no live credentials → mock chat");
      return this.fallback.chat(input);
    }

    try {
      const cfg = getAmdConfigFromEnv();
      console.log(`[Gemma] live chat → ${cfg.backend} (model: ${cfg.model})`);
      const system = `${SYSTEM_BASE}
Current page context: ${input.context}.
Answer using only the provided JSON context. Keep under 220 words unless asked for detail.`;
      const user = `Context JSON:\n${JSON.stringify(payload)}\n\nUser message:\n${input.message}`;
      const result = await this.completeText(system, user);
      console.log(`[Gemma] live OK — ${result.latencyMs}ms`);
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
    } catch (err) {
      console.warn("[Gemma] live failed, falling back to mock", err);
      return this.fallback.chat(input);
    }
  }

  async analyzeProject(input: ProjectAnalysisInput): Promise<GemmaInsight> {
    const ctx = await buildProjectContext(input);
    if (!ctx) {
      return {
        title: "Project not found",
        summary: "I could not load this project for analysis.",
        generatedAt: nowIso(),
        provider: "DEMO",
      };
    }
    if (!this.configured) return this.fallback.analyzeProject(input);

    const keyBase = contextHash("PROJECT_DILIGENCE", ctx);
    const key = input.investorId
      ? `project:${keyBase}:user-${input.investorId}`
      : `project:${keyBase}`;
    const cached = getCached<GemmaInsight>(key);
    if (cached) {
      return {
        ...cached.value,
        provider: cached.provider === "AMD_GEMMA" ? "CACHE" : cached.value.provider,
        generatedAt: nowIso(),
      };
    }

    // Enrich context with investor portfolio data
    const enrichment: Record<string, unknown> = {};
    if (input.investorId) {
      const portfolio = await getPortfolio(input.investorId);
      const investedSlugs = await getInvestedProjectSlugs(input.investorId);
      enrichment.alreadyInvestedSlugs = [...investedSlugs];
      enrichment.isAlreadyInvested = investedSlugs.has(ctx.slug);
      enrichment.userPortfolio = {
        vibeBalance: portfolio.vibeBalance,
        holdings: portfolio.tokenHoldings.map((h) => ({
          symbol: h.assetSymbol,
          amount: h.amount,
          project: h.project?.name,
          category: h.project?.category,
        })),
        categoryExposure: portfolio.byCategory,
      };
    }

    const system = `${SYSTEM_BASE}
You are performing due diligence on a project for an investor.
Return ONLY JSON with keys:
title, summary, risks (string[]), strengths (string[]), questions (string[]),
executionAssessment (string), buildRoundAssessment (string), portfolioRelevance (string), sources (string[]).

Guidelines:
- summary: 2-3 sentences covering what the project does, its stage, and funding status. If the user already invested, mention it.
- risks: 2-4 specific, data-backed risks. Reference concrete context (e.g. "no Proofs of Build yet", "only 40% funded", "you already hold this category").
- strengths: 2-4 specific strengths. Mention proofs, funding progress, founder background if available.
- questions: 1-3 open questions an investor would ask before committing.
- executionAssessment: 1-2 sentences on whether the team is shipping (based on proofs, agent runs, deliverables).
- buildRoundAssessment: 1 sentence on round health (funding progress, deliverables clarity).
- portfolioRelevance: 1 sentence on how this fits into the user's existing portfolio — category exposure, concentration risk, and whether they already hold it.`;
    const user = `Here is the project data:\n${JSON.stringify(ctx)}\n\nInvestor context:\n${JSON.stringify(enrichment)}`;
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
    const ctx = await buildPortfolioContext({
      investorId: input.investorId,
      displayName: input.displayName,
    });
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
    const ctx = await buildProofContext(input.proofId);
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
    const ctx = await buildStakeholderContext({
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
Investors contribute VIBE. In the demo, VIBE allocates AMD GPU Cloud Credits at 1,000 VIBE = 1 AMD GPU Hour. This is a simulated product rate, not a market price.`;
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
          primary: data.branding?.primary || "#20d9c2",
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
