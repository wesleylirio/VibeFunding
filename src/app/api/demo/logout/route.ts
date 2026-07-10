import { NextResponse } from "next/server";
import { JUROR_COOKIE } from "@/lib/demo/juror-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(JUROR_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return res;
}
