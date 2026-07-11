import { NextResponse } from "next/server";
import { z } from "zod";
import { allocateToRound } from "@/lib/portfolio/allocate";
import { getDemoSession } from "@/lib/demo/session";
import { INVESTOR_ID } from "@/lib/db/seed-data";

export const dynamic = "force-dynamic";

const schema = z.object({
  // Investors contribute VIBE (converted to AMD GPU Cloud Credits).
  resourceType: z.enum(["VIBE"]).default("VIBE"),
  amount: z.number().positive(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    const session = getDemoSession();
    const result = allocateToRound({
      investorId: INVESTOR_ID,
      buildRoundId: id,
      resourceType: "VIBE",
      amount: body.amount,
    });
    return NextResponse.json({
      ok: true,
      ...result,
      allocatedBy: session.user.name,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "allocate failed",
      },
      { status: 400 }
    );
  }
}
