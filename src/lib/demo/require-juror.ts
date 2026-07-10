import { redirect } from "next/navigation";
import { getJurorSession, type JurorSession } from "./juror-session";

export async function requireJuror(nextPath: string): Promise<JurorSession> {
  const session = await getJurorSession();
  if (!session.loggedIn) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}

export async function optionalJuror(): Promise<JurorSession> {
  return getJurorSession();
}
