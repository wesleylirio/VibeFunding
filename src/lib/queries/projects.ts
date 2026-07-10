import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  agentRuns,
  buildRounds,
  nfts,
  projects,
  proofsOfBuild,
  resourceRequirements,
  returnMechanisms,
  stakeholderUpdates,
  users,
} from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";

export type ProjectQuery = {
  search?: string;
  category?: string;
  stage?: string;
  verifiedOnly?: boolean;
  sort?: "RELEVANCE" | "TRENDING" | "RECENT" | "PROGRESS";
  page?: number;
  limit?: number;
};

export function listProjects(query: ProjectQuery = {}) {
  ensureSeeded();
  const db = getDb();
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(24, Math.max(1, query.limit ?? 12));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.search) {
    const term = `%${query.search}%`;
    conditions.push(
      or(
        like(projects.name, term),
        like(projects.shortDescription, term),
        like(projects.category, term),
        like(projects.stage, term)
      )!
    );
  }
  if (query.category) conditions.push(eq(projects.category, query.category));
  if (query.stage) conditions.push(eq(projects.stage, query.stage));

  const where = conditions.length ? and(...conditions) : undefined;

  let orderBy = desc(projects.trendingScore);
  if (query.sort === "RECENT") orderBy = desc(projects.createdAt);
  if (query.sort === "TRENDING") orderBy = desc(projects.trendingScore);
  if (query.sort === "PROGRESS") orderBy = desc(projects.trendingScore);

  const rows = db
    .select()
    .from(projects)
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)
    .all();

  const totalRow = db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(where)
    .get();

  const items = rows.map((project) => {
    const activeRound = db
      .select()
      .from(buildRounds)
      .where(
        and(
          eq(buildRounds.projectId, project.id),
          or(
            eq(buildRounds.status, "OPEN"),
            eq(buildRounds.status, "BUILDING"),
            eq(buildRounds.status, "FUNDED")
          )!
        )
      )
      .orderBy(desc(buildRounds.createdAt))
      .get();

    const proofCount = db
      .select({ count: sql<number>`count(*)` })
      .from(proofsOfBuild)
      .where(eq(proofsOfBuild.projectId, project.id))
      .get();

    const returns = activeRound
      ? db
          .select()
          .from(returnMechanisms)
          .where(eq(returnMechanisms.buildRoundId, activeRound.id))
          .all()
      : [];

    return {
      ...project,
      techStack: JSON.parse(project.techStack) as string[],
      metrics: JSON.parse(project.metrics) as Record<string, number>,
      activeRound: activeRound
        ? {
            ...activeRound,
            expectedDeliverables: JSON.parse(
              activeRound.expectedDeliverables
            ) as string[],
            risks: JSON.parse(activeRound.risks) as string[],
            progress:
              activeRound.targetValue > 0
                ? Math.min(
                    100,
                    Math.round(
                      (activeRound.fundedValue / activeRound.targetValue) * 100
                    )
                  )
                : 0,
          }
        : null,
      proofCount: Number(proofCount?.count ?? 0),
      returnTypes: returns.map((r) => r.type),
      returnTitles: returns.map((r) => r.title),
    };
  });

  let filtered = items;
  if (query.verifiedOnly) {
    filtered = items.filter((p) => p.proofCount > 0);
  }

  return {
    items: filtered,
    page,
    limit,
    total: Number(totalRow?.count ?? 0),
    totalPages: Math.max(1, Math.ceil(Number(totalRow?.count ?? 0) / limit)),
  };
}

export function getProjectBySlug(slug: string) {
  ensureSeeded();
  const db = getDb();
  const project = db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .get();
  if (!project) return null;

  const founder = db
    .select()
    .from(users)
    .where(eq(users.id, project.founderId))
    .get();

  const rounds = db
    .select()
    .from(buildRounds)
    .where(eq(buildRounds.projectId, project.id))
    .orderBy(desc(buildRounds.createdAt))
    .all()
    .map((round) => {
      const resources = db
        .select()
        .from(resourceRequirements)
        .where(eq(resourceRequirements.buildRoundId, round.id))
        .all();
      const returns = db
        .select()
        .from(returnMechanisms)
        .where(eq(returnMechanisms.buildRoundId, round.id))
        .all();
      return {
        ...round,
        expectedDeliverables: JSON.parse(round.expectedDeliverables) as string[],
        risks: JSON.parse(round.risks) as string[],
        resources,
        returns,
        progress:
          round.targetValue > 0
            ? Math.min(
                100,
                Math.round((round.fundedValue / round.targetValue) * 100)
              )
            : 0,
      };
    });

  const projectNfts = db
    .select()
    .from(nfts)
    .where(eq(nfts.projectId, project.id))
    .all()
    .map((n) => ({
      ...n,
      utility: JSON.parse(n.utility) as string[],
    }));

  const proofs = db
    .select()
    .from(proofsOfBuild)
    .where(eq(proofsOfBuild.projectId, project.id))
    .orderBy(desc(proofsOfBuild.createdAt))
    .all();

  const runs = db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.projectId, project.id))
    .orderBy(desc(agentRuns.createdAt))
    .all();

  const updates = db
    .select()
    .from(stakeholderUpdates)
    .where(
      and(
        eq(stakeholderUpdates.projectId, project.id),
        eq(stakeholderUpdates.status, "PUBLISHED")
      )
    )
    .orderBy(desc(stakeholderUpdates.publishedAt))
    .all();

  return {
    ...project,
    techStack: JSON.parse(project.techStack) as string[],
    metrics: JSON.parse(project.metrics) as Record<string, number>,
    risks: JSON.parse(project.risks) as string[],
    history: JSON.parse(project.history) as {
      date: string;
      title: string;
      detail: string;
    }[],
    socialLinks: JSON.parse(project.socialLinks || "{}") as Record<
      string,
      string
    >,
    founder,
    rounds,
    nfts: projectNfts,
    proofs,
    runs,
    updates,
  };
}

export function getCategories() {
  ensureSeeded();
  const db = getDb();
  return db
    .selectDistinct({ category: projects.category })
    .from(projects)
    .orderBy(asc(projects.category))
    .all()
    .map((r) => r.category);
}

export function getStages() {
  ensureSeeded();
  const db = getDb();
  return db
    .selectDistinct({ stage: projects.stage })
    .from(projects)
    .orderBy(asc(projects.stage))
    .all()
    .map((r) => r.stage);
}
