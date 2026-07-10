import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import {
  agentRuns,
  buildRounds,
  projects,
  proofsOfBuild,
  resourceRequirements,
  returnMechanisms,
  stakeholderUpdates,
} from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import { FOUNDER_ID, nowIso } from "@/lib/db/seed-data";

export function getFounderDashboard(founderId = FOUNDER_ID) {
  ensureSeeded();
  const db = getDb();

  // Demo: CollabMesh is the primary founder project; others listed as catalog
  const founderProjects = db
    .select()
    .from(projects)
    .where(eq(projects.founderId, founderId))
    .orderBy(desc(projects.detailed), desc(projects.trendingScore))
    .all()
    .filter((p) => p.detailed)
    .slice(0, 5);

  const projectIds = founderProjects.map((p) => p.id);

  const rounds = db
    .select()
    .from(buildRounds)
    .orderBy(desc(buildRounds.createdAt))
    .all()
    .filter((r) => projectIds.includes(r.projectId));

  const runs = db
    .select()
    .from(agentRuns)
    .orderBy(desc(agentRuns.createdAt))
    .all()
    .filter((r) => projectIds.includes(r.projectId));

  const proofs = db
    .select()
    .from(proofsOfBuild)
    .orderBy(desc(proofsOfBuild.createdAt))
    .all()
    .filter((p) => projectIds.includes(p.projectId));

  const updates = db
    .select()
    .from(stakeholderUpdates)
    .orderBy(desc(stakeholderUpdates.updatedAt))
    .all()
    .filter((u) => projectIds.includes(u.projectId));

  const fundedTotal = rounds.reduce((s, r) => s + r.fundedValue, 0);
  const targetTotal = rounds.reduce((s, r) => s + r.targetValue, 0);

  return {
    projects: founderProjects,
    rounds,
    runs,
    proofs,
    updates,
    fundedTotal,
    targetTotal,
    pendingUpdates: updates.filter((u) => u.status !== "PUBLISHED"),
  };
}

export function getFounderProject(projectId: string) {
  ensureSeeded();
  const db = getDb();
  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .get();
  if (!project) return null;

  const rounds = db
    .select()
    .from(buildRounds)
    .where(eq(buildRounds.projectId, projectId))
    .orderBy(desc(buildRounds.createdAt))
    .all()
    .map((round) => ({
      ...round,
      expectedDeliverables: JSON.parse(round.expectedDeliverables) as string[],
      risks: JSON.parse(round.risks) as string[],
      resources: db
        .select()
        .from(resourceRequirements)
        .where(eq(resourceRequirements.buildRoundId, round.id))
        .all(),
      returns: db
        .select()
        .from(returnMechanisms)
        .where(eq(returnMechanisms.buildRoundId, round.id))
        .all(),
    }));

  const runs = db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.projectId, projectId))
    .orderBy(desc(agentRuns.createdAt))
    .all();

  const proofs = db
    .select()
    .from(proofsOfBuild)
    .where(eq(proofsOfBuild.projectId, projectId))
    .orderBy(desc(proofsOfBuild.createdAt))
    .all();

  const updates = db
    .select()
    .from(stakeholderUpdates)
    .where(eq(stakeholderUpdates.projectId, projectId))
    .orderBy(desc(stakeholderUpdates.updatedAt))
    .all();

  return {
    ...project,
    techStack: JSON.parse(project.techStack) as string[],
    metrics: JSON.parse(project.metrics) as Record<string, number>,
    risks: JSON.parse(project.risks) as string[],
    rounds,
    runs,
    proofs,
    updates,
  };
}

export function upsertBuildRoundDraft(input: {
  id?: string;
  projectId: string;
  title: string;
  objective: string;
  targetValue: number;
  expectedDeliverables: string[];
  risks: string[];
  publicSummary?: string;
}) {
  ensureSeeded();
  const db = getDb();
  const createdAt = nowIso();

  if (input.id) {
    db.update(buildRounds)
      .set({
        title: input.title,
        objective: input.objective,
        targetValue: input.targetValue,
        expectedDeliverables: JSON.stringify(input.expectedDeliverables),
        risks: JSON.stringify(input.risks),
        publicSummary: input.publicSummary ?? null,
        status: "DRAFT",
      })
      .where(eq(buildRounds.id, input.id))
      .run();
    return db.select().from(buildRounds).where(eq(buildRounds.id, input.id)).get()!;
  }

  const id = `round-${nanoid(10)}`;
  db.insert(buildRounds)
    .values({
      id,
      projectId: input.projectId,
      title: input.title,
      objective: input.objective,
      status: "DRAFT",
      targetValue: input.targetValue,
      fundedValue: 0,
      startsAt: createdAt,
      endsAt: null,
      expectedDeliverables: JSON.stringify(input.expectedDeliverables),
      risks: JSON.stringify(input.risks),
      publicSummary: input.publicSummary ?? null,
      createdAt,
    })
    .run();

  return db.select().from(buildRounds).where(eq(buildRounds.id, id)).get()!;
}

export function saveStakeholderUpdate(input: {
  id?: string;
  projectId: string;
  buildRoundId?: string;
  title: string;
  body: string;
  status: "DRAFT" | "APPROVED" | "PUBLISHED";
  authorId?: string;
}) {
  ensureSeeded();
  const db = getDb();
  const ts = nowIso();

  if (input.id) {
    db.update(stakeholderUpdates)
      .set({
        title: input.title,
        body: input.body,
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? ts : null,
        updatedAt: ts,
        buildRoundId: input.buildRoundId ?? null,
      })
      .where(eq(stakeholderUpdates.id, input.id))
      .run();
    return db
      .select()
      .from(stakeholderUpdates)
      .where(eq(stakeholderUpdates.id, input.id))
      .get()!;
  }

  const id = `update-${nanoid(10)}`;
  db.insert(stakeholderUpdates)
    .values({
      id,
      projectId: input.projectId,
      buildRoundId: input.buildRoundId ?? null,
      title: input.title,
      body: input.body,
      status: input.status,
      authorId: input.authorId ?? FOUNDER_ID,
      publishedAt: input.status === "PUBLISHED" ? ts : null,
      createdAt: ts,
      updatedAt: ts,
    })
    .run();

  return db
    .select()
    .from(stakeholderUpdates)
    .where(eq(stakeholderUpdates.id, id))
    .get()!;
}
