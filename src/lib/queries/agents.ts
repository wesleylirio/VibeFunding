import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { agentEvents, agentRuns, projects, proofsOfBuild } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import type { DemoRole } from "@/lib/types";

export async function getRunWithEvents(runId: string, role: DemoRole = "INVESTOR") {
  await ensureSeeded();
  const db = getDb();
  const run = await db.select().from(agentRuns).where(eq(agentRuns.id, runId)).get();
  if (!run) return null;

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, run.projectId))
    .get();

  const events = (await db
    .select()
    .from(agentEvents)
    .where(eq(agentEvents.runId, runId))
    .orderBy(asc(agentEvents.sequence))
    .all())
    .filter((e) => {
      if (role === "FOUNDER") return true;
      if (e.visibility === "FOUNDER_ONLY") return false;
      return true;
    })
    .map((e) => ({
      ...e,
      privatePayload:
        role === "FOUNDER" && e.privatePayload
          ? (JSON.parse(e.privatePayload) as Record<string, unknown>)
          : undefined,
    }));

  const proof = await db
    .select()
    .from(proofsOfBuild)
    .where(eq(proofsOfBuild.agentRunId, runId))
    .get();

  return { run, project, events, proof };
}

export async function listProjectRuns(projectId: string) {
  await ensureSeeded();
  const db = getDb();
  return await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.projectId, projectId))
    .orderBy(desc(agentRuns.createdAt))
    .all();
}

export async function getRunByProjectSlug(slug: string, role: DemoRole = "INVESTOR") {
  await ensureSeeded();
  const db = getDb();
  const project = await db.select().from(projects).where(eq(projects.slug, slug)).get();
  if (!project) return null;
  const run = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.projectId, project.id))
    .orderBy(desc(agentRuns.createdAt))
    .get();
  if (!run) return { project, run: null, events: [], proof: null };
  return await getRunWithEvents(run.id, role);
}
