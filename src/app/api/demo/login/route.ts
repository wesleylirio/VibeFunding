import { NextResponse } from "next/server";
import { z } from "zod";
import {
  JUROR_COOKIE,
  initialsFromName,
  serializeJurorSession,
} from "@/lib/demo/juror-session";
import { switchDemoRole } from "@/lib/demo/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  displayName: z.string().min(1).max(64),
  // Password accepted but never stored
  password: z.string().optional(),
  role: z.enum(["INVESTOR", "FOUNDER"]).default("INVESTOR"),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    // Explicitly discard password — never persist
    void body.password;

    // Product surface is Investor-first; Founder Mode is not open yet.
    const role = "INVESTOR" as const;
    await switchDemoRole(role);

    const enteredName = body.displayName.trim();
    const displayName = /[\p{L}\p{N}]/u.test(enteredName)
      ? enteredName
      : "Investor";
    const session = {
      loggedIn: true,
      displayName,
      initials: initialsFromName(displayName),
      role,
      onboardingSeen: false,
      founderQuickstartSeen: false,
    };

    const res = NextResponse.json({
      ok: true,
      displayName: session.displayName,
      initials: session.initials,
      role: session.role,
    });
    res.cookies.set(JUROR_COOKIE, serializeJurorSession(session), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "login failed" },
      { status: 400 }
    );
  }
}
