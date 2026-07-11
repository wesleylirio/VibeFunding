import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  buildRounds,
  gemmaInsights,
  holdings,
  projects,
  proofsOfBuild,
} from "@/lib/db/schema";
import type { GemmaGateway, FounderAssistResponse } from "./types";
import type { GemmaChatInput, GemmaInsight, GemmaResponse } from "@/lib/types";
import { nowIso } from "@/lib/db/seed-data";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import {
  getInvestedProjectIds,
  getInvestedProjectSlugs,
} from "@/lib/queries/portfolio";
import { listProjects } from "@/lib/queries/projects";
import { rankProjectMatches } from "@/lib/investor/preferences";
import { getJurorSession } from "@/lib/demo/juror-session";

function baseInsight(
  partial: Omit<GemmaInsight, "generatedAt" | "provider"> & {
    provider?: GemmaInsight["provider"];
  }
): GemmaInsight {
  return {
    ...partial,
    generatedAt: nowIso(),
    provider: partial.provider ?? "DEMO",
  };
}

export class MockGemmaGateway implements GemmaGateway {
  async chat(input: GemmaChatInput): Promise<GemmaResponse> {
    ensureSeeded();
    const start = Date.now();
    const lower = input.message.toLowerCase();

    let content = "";
    let insight: GemmaInsight | undefined;

    if (input.context === "INVESTOR_PORTFOLIO" || lower.includes("portfolio")) {
      insight = await this.analyzePortfolio({ investorId: "user-investor-demo" });
      content = `${insight.title}\n\n${insight.summary}\n\nI provide informational guidance only — not regulated financial advice. I will not execute investments automatically.`;
    } else if (
      input.context === "PROJECT_DILIGENCE" ||
      lower.includes("risk") ||
      lower.includes("summarize") ||
      lower.includes("diligence")
    ) {
      if (input.projectId || input.projectSlug) {
        const project = resolveProject(input.projectId, input.projectSlug);
        if (project) {
          insight = await this.analyzeProject({ projectId: project.id });
          content = `${insight.title}\n\n${insight.summary}`;
          if (insight.risks?.length) {
            content += `\n\nKey risks:\n${insight.risks.map((r) => `• ${r}`).join("\n")}`;
          }
          if (insight.strengths?.length) {
            content += `\n\nStrengths:\n${insight.strengths.map((s) => `• ${s}`).join("\n")}`;
          }
        }
      }
      if (!content) {
        content =
          "Open a project to run contextual due diligence. I can summarize product maturity, risks, Build Rounds, and Proofs of Build.";
      }
    } else if (
      input.context === "PROOF_OF_BUILD" ||
      lower.includes("proof")
    ) {
      if (input.proofId) {
        insight = await this.summarizeProof({ proofId: input.proofId });
        content = `${insight.title}\n\n${insight.summary}`;
      } else {
        content =
          "Proof of Build records that an agent run happened with measurable evidence (tests, commit, hashes). It does not guarantee code quality.";
      }
    } else if (
      input.context === "BUILD_ROUND_ANALYSIS" ||
      lower.includes("build round") ||
      lower.includes("round")
    ) {
      content = await explainBuildRound(input);
    } else if (
      input.context.startsWith("FOUNDER") ||
      lower.includes("stakeholder") ||
      lower.includes("clarity")
    ) {
      const assist = await this.assistFounder({
        projectId: input.projectId ?? "proj-collabmesh",
        buildRoundId: input.buildRoundId,
        mode: lower.includes("stakeholder") ? "stakeholder-update" : "review",
        draft: input.message,
      });
      content = assist.content;
    } else if (
      input.context === "GLOBAL_DISCOVERY" ||
      lower.includes("recommend") ||
      lower.includes("match") ||
      lower.includes("fit me") ||
      lower.includes("suggest")
    ) {
      content = await discoveryMatchesText();
    } else if (lower.includes("compare")) {
      const held = [...getInvestedProjectSlugs()];
      const skip = held.length
        ? ` You already hold exposure in ${held.join(", ")} — I won't re-pitch those.`
        : "";
      content = `Compared with your current holdings, projects outside your stake set diversify better (e.g. Security or AI Infrastructure if you are concentrated in Developer Tools).${skip} All figures are simulated.`;
    } else if (lower.includes("changed") || lower.includes("recent")) {
      content =
        "Recent activity: new Proofs of Build and open Build Rounds are on Discover. Check Activity for stakeholder notes. I won't re-suggest projects you already funded.";
    } else {
      content = `I'm Gemma, your portfolio copilot on VibeFunding.

Current context: **${input.context.replaceAll("_", " ")}**.

I can help with discovery, due diligence, Build Round analysis, Proof of Build explanations, portfolio concentration, and founder communication drafts.

I never auto-invest, and I won't re-suggest projects you already invested in.

What would you like to examine?`;
    }

    return {
      content,
      insight,
      provider: "DEMO",
      latencyMs: Date.now() - start,
      model: "mock-gemma-demo",
    };
  }

  async analyzeProject(input: { projectId: string }): Promise<GemmaInsight> {
    ensureSeeded();
    const db = getDb();
    const cached = db
      .select()
      .from(gemmaInsights)
      .where(eq(gemmaInsights.projectId, input.projectId))
      .get();
    if (cached) {
      return {
        title: cached.title,
        summary: cached.summary,
        risks: JSON.parse(cached.risks) as string[],
        strengths: JSON.parse(cached.strengths) as string[],
        questions: JSON.parse(cached.questions) as string[],
        portfolioImpact: cached.portfolioImpact ?? undefined,
        sources: JSON.parse(cached.sources) as string[],
        generatedAt: cached.generatedAt,
        provider: cached.provider as GemmaInsight["provider"],
      };
    }

    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .get();
    if (!project) {
      return baseInsight({
        title: "Project not found",
        summary: "I could not load this project for analysis.",
      });
    }

    const risks = JSON.parse(project.risks) as string[];
    const proofs = db
      .select()
      .from(proofsOfBuild)
      .where(eq(proofsOfBuild.projectId, project.id))
      .all();
    const rounds = db
      .select()
      .from(buildRounds)
      .where(eq(buildRounds.projectId, project.id))
      .all();

    return baseInsight({
      title: `${project.name} due diligence`,
      summary: `${project.name} is a ${project.stage} ${project.category} project. ${project.shortDescription} There ${proofs.length === 1 ? "is" : "are"} ${proofs.length} Proof${proofs.length === 1 ? "" : "s"} of Build on record and ${rounds.length} Build Round${rounds.length === 1 ? "" : "s"}.`,
      risks: risks.slice(0, 4),
      strengths: [
        proofs.length > 0 ? "Has recorded Proof of Build evidence" : "Listed with clear category and stage",
        rounds.some((r) => r.status === "COMPLETED")
          ? "Prior completed Build Round"
          : "Active fundraising narrative",
        "Founder-controlled roadmap (Gemma does not control sprints)",
      ],
      questions: [
        "How will resources convert into the next verifiable delivery?",
        "What remains private vs investor-visible?",
      ],
      portfolioImpact: `Adding ${project.name} increases exposure to ${project.category}.`,
      sources: ["project profile", "build rounds", "proofs"],
      provider: "DEMO",
    });
  }

  async analyzePortfolio(input?: { investorId: string }): Promise<GemmaInsight> {
    void input;
    ensureSeeded();
    const db = getDb();
    const cached = db
      .select()
      .from(gemmaInsights)
      .where(eq(gemmaInsights.context, "INVESTOR_PORTFOLIO"))
      .get();
    if (cached) {
      return {
        title: cached.title,
        summary: cached.summary,
        risks: JSON.parse(cached.risks) as string[],
        strengths: JSON.parse(cached.strengths) as string[],
        questions: JSON.parse(cached.questions) as string[],
        portfolioImpact: cached.portfolioImpact ?? undefined,
        sources: JSON.parse(cached.sources) as string[],
        generatedAt: cached.generatedAt,
        provider: cached.provider as GemmaInsight["provider"],
      };
    }

    const rows = db.select().from(holdings).all();
    const tokens = rows.filter((h) => h.assetType === "PROJECT_TOKEN");
    return baseInsight({
      title: "Portfolio briefing",
      summary: `You hold ${tokens.length} project token position(s) plus simulated VIBE. Focus on projects with Proofs of Build when evaluating follow-on allocations. This is informational only — not investment advice.`,
      risks: ["Category concentration possible", "Open rounds still need funding"],
      strengths: ["Evidence-linked holdings", "Multi-asset mix (tokens + NFTs)"],
      questions: ["Diversify by category?", "Prefer compute vs VIBE allocations?"],
      sources: ["holdings"],
      provider: "DEMO",
    });
  }

  async summarizeProof(input: { proofId: string }): Promise<GemmaInsight> {
    ensureSeeded();
    const db = getDb();
    const proof = db
      .select()
      .from(proofsOfBuild)
      .where(eq(proofsOfBuild.id, input.proofId))
      .get();
    if (!proof) {
      return baseInsight({
        title: "Proof not found",
        summary: "I could not locate this Proof of Build.",
      });
    }
    return baseInsight({
      title: "Proof of Build explained",
      summary:
        proof.gemmaSummary ||
        proof.publicSummary ||
        "This proof records an agent execution with hashed artifacts. It evidences that work was performed — not that the result is production-ready.",
      strengths: [
        `Verification: ${proof.verificationStatus}`,
        proof.testsPassed != null
          ? `Tests: ${proof.testsPassed}/${proof.testsTotal}`
          : "Artifacts hashed",
      ],
      risks: [
        "Does not certify code quality",
        "Human review remains important",
      ],
      sources: ["proof manifest", "agent run"],
      provider: "CACHE",
    });
  }

  async assistFounder(input: {
    projectId: string;
    buildRoundId?: string;
    mode: "review" | "stakeholder-update" | "clarity";
    draft?: string;
  }): Promise<FounderAssistResponse> {
    ensureSeeded();
    const start = Date.now();
    const db = getDb();
    const project = db
      .select()
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .get();
    const name = project?.name ?? "your project";

    if (input.mode === "stakeholder-update") {
      const draftUpdate = `## ${name} stakeholder update

**Progress**
We advanced the current Build Round with agent-executed work captured as Proof of Build evidence.

**Evidence**
- Agent run completed with tests recorded
- Manifest hash available for verification
- Compute origin labeled for transparency

**Ask**
Continue allocating VIBE or compute to keep the next milestone funded.

---
*Draft generated by Gemma. Review and approve before publishing.*`;

      return {
        content:
          "I drafted a stakeholder update from recent execution signals. Review every claim, remove anything sensitive, and publish only when you confirm.",
        suggestions: [
          "Mention concrete deliverable names",
          "Link the Proof of Build",
          "Keep economic terms labeled as simulated",
        ],
        sensitiveHints: [
          "Do not include private prompts or environment details",
          "Avoid unreleased pricing strategy",
        ],
        draftUpdate,
        provider: "DEMO",
        latencyMs: Date.now() - start,
      };
    }

    return {
      content: `Clarity review for ${name}: the narrative is understandable for investors. Emphasize current product evidence, the concrete Build Round objective, resource mix (VIBE + compute), and simulated return mechanisms. I will not invent a roadmap or publish without your confirmation.`,
      missingFields: [
        "Explicit human review process after agent commits",
        "Private vs public artifact policy",
      ],
      suggestions: [
        "Lead with Proof of Build links",
        "State risks plainly",
        "Keep token terms marked simulated",
      ],
      sensitiveHints: [
        "Internal latency metrics can stay founder-only",
        "Customer names may need redaction",
      ],
      provider: "DEMO",
      latencyMs: Date.now() - start,
    };
  }
}

function resolveProject(projectId?: string, projectSlug?: string) {
  const db = getDb();
  if (projectId) {
    return db.select().from(projects).where(eq(projects.id, projectId)).get();
  }
  if (projectSlug) {
    return db.select().from(projects).where(eq(projects.slug, projectSlug)).get();
  }
  return null;
}

async function discoveryMatchesText(): Promise<string> {
  const held = getInvestedProjectSlugs();
  const prefs = (await getJurorSession()).investorPreferences;
  if (!prefs) {
    return "Complete the preference questions on Discover and I’ll match open Build Rounds. I never re-suggest projects you already invested in.";
  }
  const { items } = listProjects({ sort: "TRENDING", limit: 24 });
  const matches = rankProjectMatches(items, prefs, {
    excludeSlugs: held,
    excludeIds: getInvestedProjectIds(),
  }).slice(0, 3);

  if (matches.length === 0) {
    return held.size
      ? `You’ve already invested in ${[...held].join(", ")}. I won’t re-suggest those. Browse other open rounds on Discover or open Portfolio for holdings.`
      : "I don’t have a strong new match yet — try revising preferences on Discover.";
  }

  const lines = matches
    .map(
      (m, i) =>
        `${i + 1}. **${m.name}** (/${m.slug}) — ${m.matchReason}`
    )
    .join("\n");
  const heldNote = held.size
    ? `\n\nSkipped (already invested): ${[...held].join(", ")}.`
    : "";
  return `Here are projects I’d look at next (not ones you already funded):\n\n${lines}${heldNote}\n\nInvest with VIBE (50 VIBE = 1 AMD GPU Hour). This is informational only.`;
}

async function explainBuildRound(input: GemmaChatInput) {
  const db = getDb();
  if (input.buildRoundId) {
    const round = db
      .select()
      .from(buildRounds)
      .where(eq(buildRounds.id, input.buildRoundId))
      .get();
    if (round) {
      const progress =
        round.targetValue > 0
          ? Math.round((round.fundedValue / round.targetValue) * 100)
          : 0;
      return `**${round.title}** is ${round.status} at ~${progress}% of its funding target.\n\nObjective: ${round.objective}\n\nGemma does not allocate funds for you — confirmation always stays with the investor.`;
    }
  }
  const project = resolveProject(input.projectId, input.projectSlug);
  if (project) {
    const round = db
      .select()
      .from(buildRounds)
      .where(eq(buildRounds.projectId, project.id))
      .get();
    if (round) {
      return `The active narrative for ${project.name} centers on **${round.title}**: ${round.objective} Status: ${round.status}.`;
    }
  }
  return "Select a Build Round to get a structured explanation of objectives, resources, risks, and simulated returns.";
}
