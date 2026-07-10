import { NextResponse } from "next/server";
import { z } from "zod";
import { saveStakeholderUpdate } from "@/lib/queries/founder";
import { getGemmaGateway } from "@/lib/gemma";
import { FOUNDER_ID } from "@/lib/db/seed-data";

export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum(["generate", "save", "publish"]),
  id: z.string().optional(),
  projectId: z.string(),
  buildRoundId: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());

    if (body.action === "generate") {
      const gateway = getGemmaGateway();
      const assist = await gateway.assistFounder({
        projectId: body.projectId,
        buildRoundId: body.buildRoundId,
        mode: "stakeholder-update",
      });
      return NextResponse.json({
        ok: true,
        draft: {
          title: "Stakeholder update draft",
          body: assist.draftUpdate || assist.content,
        },
        provider: assist.provider,
        suggestions: assist.suggestions,
        sensitiveHints: assist.sensitiveHints,
      });
    }

    if (body.action === "publish") {
      if (!body.title || !body.body) {
        return NextResponse.json(
          { ok: false, error: "Title and body required to publish" },
          { status: 400 }
        );
      }
      const update = saveStakeholderUpdate({
        id: body.id,
        projectId: body.projectId,
        buildRoundId: body.buildRoundId,
        title: body.title,
        body: body.body,
        status: "PUBLISHED",
        authorId: FOUNDER_ID,
      });
      return NextResponse.json({ ok: true, update });
    }

    // save draft / approved
    if (!body.title || !body.body) {
      return NextResponse.json(
        { ok: false, error: "Title and body required" },
        { status: 400 }
      );
    }
    const update = saveStakeholderUpdate({
      id: body.id,
      projectId: body.projectId,
      buildRoundId: body.buildRoundId,
      title: body.title,
      body: body.body,
      status: "DRAFT",
      authorId: FOUNDER_ID,
    });
    return NextResponse.json({ ok: true, update });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "failed" },
      { status: 400 }
    );
  }
}
