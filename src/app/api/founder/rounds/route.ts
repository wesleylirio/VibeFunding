import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertBuildRoundDraft } from "@/lib/queries/founder";

export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  title: z.string().min(3),
  objective: z.string().min(10),
  targetValue: z.number().positive(),
  expectedDeliverables: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  publicSummary: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const round = upsertBuildRoundDraft(body);
    return NextResponse.json({ ok: true, round });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "save failed" },
      { status: 400 }
    );
  }
}
