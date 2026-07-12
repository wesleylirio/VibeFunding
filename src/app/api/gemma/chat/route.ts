import { NextResponse } from "next/server";
import { z } from "zod";
import { getGemmaGateway } from "@/lib/gemma";
import { liveAttribution } from "@/lib/gemma/openai-client";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import { getJurorSession } from "@/lib/demo/juror-session";

export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().min(1).max(4000),
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
  projectId: z.string().optional(),
  projectSlug: z.string().optional(),
  proofId: z.string().optional(),
  buildRoundId: z.string().optional(),
  role: z.enum(["INVESTOR", "FOUNDER"]).optional(),
  refresh: z.boolean().optional(),
});

const hits = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || row.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (row.count >= 60) return false;
  row.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const ip = request.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = schema.parse(await request.json());
    let projectId = body.projectId;
    if (!projectId && body.projectSlug) {
      const db = getDb();
      const project = db
        .select()
        .from(projects)
        .where(eq(projects.slug, body.projectSlug))
        .get();
      projectId = project?.id;
    }

    const juror = await getJurorSession();
    const gateway = getGemmaGateway();

    // Route structured intents to structured methods when message matches
    const lower = body.message.toLowerCase();
    if (
      body.context === "INVESTOR_PORTFOLIO" &&
      (lower.includes("brief") ||
        lower.includes("portfolio") ||
        lower.includes("summarize my"))
    ) {
      const insight = await gateway.analyzePortfolio({
        investorId: "user-investor-demo",
      });
      return NextResponse.json({
        content: formatInsightContent(insight, juror.displayName),
        insight,
        provider: insight.provider,
        latencyMs: 0,
        model: undefined,
        attribution: attributionFor(insight.provider),
      });
    }

    if (
      (body.context === "PROJECT_DILIGENCE" ||
        body.context === "BUILD_ROUND_ANALYSIS") &&
      projectId &&
      (lower.includes("summarize") ||
        lower.includes("diligence") ||
        lower.includes("risk") ||
        lower.includes("this project"))
    ) {
      const insight = await gateway.analyzeProject({
        projectId,
        investorId: juror.role === "INVESTOR" ? "user-investor-demo" : undefined,
      });
      return NextResponse.json({
        content: formatInsightContent(insight, juror.displayName),
        insight,
        provider: insight.provider,
        latencyMs: 0,
        attribution: attributionFor(insight.provider),
      });
    }

    if (body.context === "PROOF_OF_BUILD" && body.proofId) {
      const insight = await gateway.summarizeProof({ proofId: body.proofId });
      return NextResponse.json({
        content: formatInsightContent(insight, juror.displayName),
        insight,
        provider: insight.provider,
        latencyMs: 0,
        attribution: attributionFor(insight.provider),
      });
    }

    const response = await gateway.chat({
      ...body,
      projectId,
      role: body.role || juror.role,
    });

    return NextResponse.json({
      ...response,
      attribution: attributionFor(response.provider),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "chat failed" },
      { status: 400 }
    );
  }
}

function formatInsightContent(
  insight: {
    title: string;
    summary: string;
    risks?: string[];
    strengths?: string[];
  },
  displayName?: string
) {
  const name = displayName?.split(" ")[0];
  let content = `${insight.title}\n\n${insight.summary}`;
  if (insight.strengths?.length) {
    content += `\n\nStrengths:\n${insight.strengths.map((s) => `• ${s}`).join("\n")}`;
  }
  if (insight.risks?.length) {
    content += `\n\nRisks:\n${insight.risks.map((r) => `• ${r}`).join("\n")}`;
  }
  if (name) {
    content = content.replace(/^(Portfolio briefing)/, `${name}, $1`);
  }
  return content;
}

/** Product-safe attribution from live gateway provider. */
function attributionFor(provider: string): string | null {
  if (provider !== "AMD_GEMMA") return null;
  return liveAttribution();
}
