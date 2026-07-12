import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getGemmaGateway } from "@/lib/gemma";
import { liveAttribution } from "@/lib/gemma/openai-client";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import { getJurorSession } from "@/lib/demo/juror-session";
import type { GemmaContext } from "@/lib/types";
import { rankProjectMatches } from "@/lib/investor/preferences";
import { listProjects } from "@/lib/queries/projects";
import {
  getInvestedProjectIds,
  getInvestedProjectSlugs,
} from "@/lib/queries/portfolio";
import { getDemoSession } from "@/lib/demo/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  context: z.enum([
    "GLOBAL_DISCOVERY",
    "INVESTOR_PORTFOLIO",
    "PROJECT_DILIGENCE",
    "BUILD_ROUND_ANALYSIS",
    "PROOF_OF_BUILD",
    "FOUNDER_PROJECT",
    "FOUNDER_BUILD_ROUND",
    "FOUNDER_STAKEHOLDER_UPDATE",
  ]),
  projectSlug: z.string().optional(),
  proofId: z.string().optional(),
});

/**
 * Proactive contextual insight for the floating chat.
 * Called when the investor lands on a meaningful screen — not on every render path
 * that would bloat page HTML with Gemma cards.
 */
export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = schema.parse(await request.json());
    const juror = await getJurorSession();
    if (!juror.loggedIn) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const gateway = getGemmaGateway();
    const firstName = juror.displayName.split(" ")[0] || juror.displayName;

    let projectId: string | undefined;
    let projectName: string | undefined;
    if (body.projectSlug) {
      const db = getDb();
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, body.projectSlug))
        .get();
      projectId = project?.id;
      projectName = project?.name;
    }

    const result = await buildProactiveInsight({
      context: body.context,
      projectId,
      projectName,
      projectSlug: body.projectSlug,
      proofId: body.proofId,
      firstName,
      gateway,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "insight failed" },
      { status: 400 }
    );
  }
}

async function buildProactiveInsight(input: {
  context: GemmaContext;
  projectId?: string;
  projectName?: string;
  projectSlug?: string;
  proofId?: string;
  firstName: string;
  gateway: ReturnType<typeof getGemmaGateway>;
}) {
  const { context, projectId, projectName, proofId, firstName, gateway } = input;

  if (context === "INVESTOR_PORTFOLIO") {
    const insight = await gateway.analyzePortfolio({
      investorId: "user-investor-demo",
    });
    return {
      teaser: "I have a portfolio insight for you.",
      title: insight.title,
      content: formatInsight(insight, firstName),
      provider: insight.provider,
      attribution: attributionFor(insight.provider),
    };
  }

  if (
    (context === "PROJECT_DILIGENCE" || context === "BUILD_ROUND_ANALYSIS") &&
    projectId
  ) {
    const insight = await gateway.analyzeProject({ projectId, investorId: "user-investor-demo" });
    return {
      teaser: projectName
        ? `I looked at ${projectName} — risks, strengths, and the Build Round.`
        : "I have a project take ready for you.",
      title: insight.title,
      content: formatInsight(insight, firstName),
      provider: insight.provider,
      attribution: attributionFor(insight.provider),
    };
  }

  if (context === "PROOF_OF_BUILD" && proofId) {
    const insight = await gateway.summarizeProof({ proofId });
    return {
      teaser: "I can explain this Proof of Build in plain language.",
      title: insight.title,
      content: formatInsight(insight, firstName),
      provider: insight.provider,
      attribution: attributionFor(insight.provider),
    };
  }

  if (context === "GLOBAL_DISCOVERY") {
    const juror = await getJurorSession();
    const prefs = juror.investorPreferences;
    const session = await getDemoSession();
    const investedIds = await getInvestedProjectIds(session.investorId);
    const investedSlugs = await getInvestedProjectSlugs(session.investorId);

    if (prefs) {
      const { items } = await listProjects({ sort: "TRENDING", limit: 24 });
      const matches = rankProjectMatches(items, prefs, {
        excludeIds: investedIds,
        excludeSlugs: investedSlugs,
      }).slice(0, 3);

      if (matches.length > 0) {
        const lines = matches
          .map((m, i) => {
            const why = m.matchReason || m.matchFactors.slice(0, 2).join("; ");
            return `${i + 1}. **[${m.name}](/projects/${m.slug})** — ${why}${
              m.mainRisk ? `\n   _Watch-out:_ ${m.mainRisk}` : ""
            }`;
          })
          .join("\n\n");
        const heldNote =
          investedSlugs.size > 0
            ? `\n\nI’m not re-suggesting projects you already invested in.`
            : "";
        return {
          teaser: `I matched ${matches.length} new project${matches.length === 1 ? "" : "s"} for you — open chat.`,
          title: "Your matches",
          content: `${firstName}, based on your profile (**${prefs.interests.slice(0, 2).join(", ")}** · ${prefs.stage} · ${prefs.risk} risk), here is where I would look next:\n\n${lines}\n\nOpen any project above to invest **VIBE** (demo rate: 1,000 VIBE = 1 AMD GPU Hour).${heldNote}`,
          provider: "DEMO" as const,
          attribution: null,
          // Key changes when holdings change so we don't keep an old "seen" match list
          insightKey: `discover-match:${prefs.completedAt}:${[...investedSlugs].sort().join(",")}`,
        };
      }

      if (investedSlugs.size > 0) {
        return {
          teaser: "You’re already in some rounds — ask me what’s next.",
          title: "Portfolio on Discover",
          content: `${firstName}, you’ve already invested in project(s) on this platform. I won’t re-suggest those. Browse other Build Rounds on Discover, or open **Portfolio** to review holdings. Ask me about risk on any new name.`,
          provider: "DEMO" as const,
          attribution: null,
          insightKey: `discover-held:${[...investedSlugs].sort().join(",")}`,
        };
      }
    }
    return {
      teaser: "I can match projects to what you care about.",
      title: "Discovery help",
      content: `${firstName}, tell me what matters — stage, risk, or AMD GPU-backed shipping — and I’ll point you to Build Rounds that fit. You invest with VIBE (demo rate: 1,000 VIBE = 1 AMD GPU Hour).`,
      provider: "DEMO" as const,
      attribution: null,
    };
  }

  if (context === "FOUNDER_PROJECT") {
    return {
      teaser: "I can help with Build Round clarity or stakeholder updates.",
      title: "Founder assist",
      content: `${firstName}, I can review Build Round clarity, draft stakeholder updates, or summarize agent progress. Ask me when you’re ready — I never publish without you.`,
      provider: "DEMO" as const,
      attribution: null,
    };
  }

  return {
    teaser: "Ask me anything about this screen.",
    title: "Gemma",
    content: `${firstName}, I’m here with context for this page. Ask about projects, portfolio, or Proof of Build.`,
    provider: "DEMO" as const,
    attribution: null,
  };
}

function formatInsight(
  insight: {
    title: string;
    summary: string;
    risks?: string[];
    strengths?: string[];
    questions?: string[];
  },
  firstName: string
) {
  let content = `**${insight.title}**\n\n${insight.summary}`;
  if (insight.strengths?.length) {
    content += `\n\n**Strengths**\n${insight.strengths.map((s) => `• ${s}`).join("\n")}`;
  }
  if (insight.risks?.length) {
    content += `\n\n**Risks**\n${insight.risks.map((r) => `• ${r}`).join("\n")}`;
  }
  if (insight.questions?.length) {
    content += `\n\n**Open questions**\n${insight.questions.map((q) => `• ${q}`).join("\n")}`;
  }
  return `${firstName}, ${content}`;
}

function attributionFor(provider: string): string | null {
  if (provider !== "AMD_GEMMA") return null;
  return liveAttribution();
}
