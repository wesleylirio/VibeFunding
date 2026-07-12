import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getGemmaGateway } from "@/lib/gemma";
import { liveAttribution } from "@/lib/gemma/openai-client";
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
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, body.projectSlug))
        .get();
      projectId = project?.id;
    }

    const juror = await getJurorSession();
    const response = await getGemmaGateway().chat({
      ...body,
      projectId,
      role: body.role || juror.role,
      displayName: juror.displayName,
    });

    return NextResponse.json({
      ...response,
      attribution: response.provider === "AMD_GEMMA" ? liveAttribution() : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "chat failed" },
      { status: 400 }
    );
  }
}
