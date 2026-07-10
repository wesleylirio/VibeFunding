import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateQuickstartDraft,
  saveQuickstartDraft,
} from "@/lib/founder/quickstart";
import { getAmdGemmaGateway, getProviderMode } from "@/lib/gemma";
import { isAmdConfigured } from "@/lib/gemma/openai-client";

export const dynamic = "force-dynamic";

const generateSchema = z.object({
  action: z.literal("generate"),
  building: z.string().min(3),
  stage: z.string().min(1),
  nextGoal: z.string().min(3),
  evidence: z.string().optional().default(""),
});

const saveSchema = z.object({
  action: z.literal("save"),
  draft: z.any(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    if (json.action === "generate") {
      const body = generateSchema.parse(json);
      const mode = getProviderMode();
      const canLive =
        (mode === "auto" || mode === "amd") && isAmdConfigured();

      if (canLive) {
        const amd = getAmdGemmaGateway();
        const live = await amd.generateQuickstart(body);
        return NextResponse.json({
          ok: true,
          draft: live.draft,
          provider: live.provider,
          latencyMs: live.latencyMs,
        });
      }

      const draft = generateQuickstartDraft(body);
      return NextResponse.json({
        ok: true,
        draft,
        provider: "DEMO",
        latencyMs: 0,
      });
    }
    if (json.action === "save") {
      const body = saveSchema.parse(json);
      const result = saveQuickstartDraft(body.draft);
      return NextResponse.json({ ok: true, ...result });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed" },
      { status: 400 }
    );
  }
}
