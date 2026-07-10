import { NextResponse } from "next/server";
import { z } from "zod";
import { switchDemoRole } from "@/lib/demo/session";
import {
  JUROR_COOKIE,
  getJurorSession,
  serializeJurorSession,
} from "@/lib/demo/juror-session";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  role: z.enum(["INVESTOR", "FOUNDER"]),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);
    const session = switchDemoRole(body.role);
    const juror = await getJurorSession();
    const res = NextResponse.json({
      ok: true,
      role: session.role,
      userId: session.userId,
      userName: juror.displayName || session.user.name,
    });
    if (juror.loggedIn) {
      res.cookies.set(
        JUROR_COOKIE,
        serializeJurorSession({ ...juror, role: body.role }),
        {
          httpOnly: false,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        }
      );
    }
    return res;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "switch failed",
      },
      { status: 400 }
    );
  }
}
