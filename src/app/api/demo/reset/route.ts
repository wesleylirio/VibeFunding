import { NextResponse } from "next/server";
import { resetDemo } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await resetDemo();
    // Clear seed flag so ensureSeeded re-checks
    const g = globalThis as unknown as { __vfSeeded?: boolean };
    g.__vfSeeded = false;
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "reset failed" },
      { status: 500 }
    );
  }
}
