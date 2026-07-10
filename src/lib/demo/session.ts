import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { demoState, users } from "@/lib/db/schema";
import { FOUNDER_ID, INVESTOR_ID, nowIso } from "@/lib/db/seed-data";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";

export type DemoRole = "INVESTOR" | "FOUNDER";

export function getDemoSession() {
  ensureSeeded();
  const db = getDb();
  let state = db.select().from(demoState).where(eq(demoState.id, "default")).get();
  if (!state) {
    db.insert(demoState)
      .values({
        id: "default",
        activeRole: "INVESTOR",
        activeUserId: INVESTOR_ID,
        updatedAt: nowIso(),
      })
      .run();
    state = db.select().from(demoState).where(eq(demoState.id, "default")).get()!;
  }

  const activeUserId =
    state.activeRole === "FOUNDER" ? FOUNDER_ID : INVESTOR_ID;
  const user = db.select().from(users).where(eq(users.id, activeUserId)).get();

  return {
    role: state.activeRole as DemoRole,
    userId: activeUserId,
    user: user!,
    investorId: INVESTOR_ID,
    founderId: FOUNDER_ID,
  };
}

export function switchDemoRole(role: DemoRole) {
  ensureSeeded();
  const db = getDb();
  const activeUserId = role === "FOUNDER" ? FOUNDER_ID : INVESTOR_ID;
  db.update(demoState)
    .set({
      activeRole: role,
      activeUserId,
      updatedAt: nowIso(),
    })
    .where(eq(demoState.id, "default"))
    .run();
  return getDemoSession();
}
