import { NextResponse } from "next/server";
import { verifyContribution } from "@/lib/portfolio/allocate";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await verifyContribution(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "verify failed",
      },
      { status: 400 }
    );
  }
}
