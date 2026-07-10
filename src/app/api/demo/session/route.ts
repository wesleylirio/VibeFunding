import { NextResponse } from "next/server";
import { z } from "zod";
import {
  JUROR_COOKIE,
  getJurorSession,
  serializeJurorSession,
} from "@/lib/demo/juror-session";
import { switchDemoRole } from "@/lib/demo/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getJurorSession();
  return NextResponse.json(session);
}

const patchSchema = z.object({
  role: z.enum(["INVESTOR", "FOUNDER"]).optional(),
  onboardingSeen: z.boolean().optional(),
  founderQuickstartSeen: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    const current = await getJurorSession();
    if (!current.loggedIn) {
      return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
    }

    if (body.role) {
      switchDemoRole(body.role);
      current.role = body.role;
    }
    if (typeof body.onboardingSeen === "boolean") {
      current.onboardingSeen = body.onboardingSeen;
    }
    if (typeof body.founderQuickstartSeen === "boolean") {
      current.founderQuickstartSeen = body.founderQuickstartSeen;
    }

    const res = NextResponse.json({ ok: true, session: current });
    res.cookies.set(JUROR_COOKIE, serializeJurorSession(current), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "failed" },
      { status: 400 }
    );
  }
}
