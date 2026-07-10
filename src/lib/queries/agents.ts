import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { agentEvents, agentRuns, projects, proofsOfBuild } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import type { DemoRole } from "@/lib/types";

export function getRunWithEvents(runId: string, role: DemoRole = "INVESTOR") {
  ensureSeeded();
  const db = getDb();
  const run = db.select().from(agentRuns).where(eq(agentRuns.id, runId)).get();
  if (!run) return null;

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, run.projectId))
    .get();

  const events = db
    .select()
    .from(agentEvents)
    .where(eq(agentEvents.runId, runId))
    .orderBy(asc(agentEvents.sequence))
    .all()
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

  const proof = db
    .select()
    .from(proofsOfBuild)
    .where(eq(proofsOfBuild.agentRunId, runId))
    .get();

  return { run, project, events, proof };
}

export function listProjectRuns(projectId: string) {
  ensureSeeded();
  const db = getDb();
  return db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.projectId, projectId))
    .orderBy(desc(agentRuns.createdAt))
    .all();
}

export function getRunByProjectSlug(slug: string, role: DemoRole = "INVESTOR") {
  ensureSeeded();
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.slug, slug)).get();
  if (!project) return null;
  const run = db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.projectId, project.id))
    .orderBy(desc(agentRuns.createdAt))
    .get();
  if (!run) return { project, run: null, events: [], proof: null };
  return getRunWithEvents(run.id, role);
}
