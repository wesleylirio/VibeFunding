import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    ensureSeeded();
    return NextResponse.json(
      {
        status: "ok",
        demoMode: process.env.DEMO_MODE !== "false",
        time: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
