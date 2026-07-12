import { NextResponse } from "next/server";
import { z } from "zod";
import {
  JUROR_COOKIE,
  getJurorSession,
  serializeJurorSession,
  type InvestorPreferences,
} from "@/lib/demo/juror-session";
import { switchDemoRole } from "@/lib/demo/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getJurorSession();
  return NextResponse.json(session);
}

const prefsSchema = z.object({
  interests: z.array(z.string()).min(1).max(8),
  stage: z.string().min(1).max(40),
  risk: z.string().min(1).max(40),
  resources: z.array(z.string()).max(8),
  priorities: z.array(z.string()).max(8),
});

const patchSchema = z.object({
  role: z.enum(["INVESTOR", "FOUNDER"]).optional(),
  onboardingSeen: z.boolean().optional(),
  founderQuickstartSeen: z.boolean().optional(),
  investorPreferences: prefsSchema.nullable().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    const current = await getJurorSession();
    if (!current.loggedIn) {
      return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
    }

    if (body.role) {
      await switchDemoRole(body.role);
      current.role = body.role;
    }
    if (typeof body.onboardingSeen === "boolean") {
      current.onboardingSeen = body.onboardingSeen;
    }
    if (typeof body.founderQuickstartSeen === "boolean") {
      current.founderQuickstartSeen = body.founderQuickstartSeen;
    }
    if (body.investorPreferences === null) {
      current.investorPreferences = null;
    } else if (body.investorPreferences) {
      const prefs: InvestorPreferences = {
        ...body.investorPreferences,
        completedAt: new Date().toISOString(),
      };
      current.investorPreferences = prefs;
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
