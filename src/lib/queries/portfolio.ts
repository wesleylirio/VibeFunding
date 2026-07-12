import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  allocations,
  agentRuns,
  holdings,
  projects,
  proofsOfBuild,
  stakeholderUpdates,
  users,
} from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import { INVESTOR_ID } from "@/lib/db/seed-data";

/** Project ids the investor already funded (allocations or project holdings). */
export async function getInvestedProjectIds(investorId = INVESTOR_ID): Promise<Set<string>> {
  const portfolio = await getPortfolio(investorId);
  const ids = new Set<string>();
  for (const a of portfolio.allocations) {
    if (a.projectId) ids.add(a.projectId);
  }
  for (const h of portfolio.holdings) {
    if (
      h.projectId &&
      (h.assetType === "PROJECT_TOKEN" || h.assetType === "NFT")
    ) {
      ids.add(h.projectId);
    }
  }
  return ids;
}

/** Project slugs already funded — for Gemma discover filtering. */
export async function getInvestedProjectSlugs(investorId = INVESTOR_ID): Promise<Set<string>> {
  const portfolio = await getPortfolio(investorId);
  const slugs = new Set<string>();
  for (const a of portfolio.allocations) {
    if (a.project?.slug) slugs.add(a.project.slug);
  }
  for (const h of portfolio.holdings) {
    if (
      h.project?.slug &&
      (h.assetType === "PROJECT_TOKEN" || h.assetType === "NFT")
    ) {
      slugs.add(h.project.slug);
    }
  }
  return slugs;
}

export async function getPortfolio(investorId = INVESTOR_ID) {
  await ensureSeeded();
  const db = getDb();
  const investor = await db.select().from(users).where(eq(users.id, investorId)).get();

  const holdingBase = await db
    .select()
    .from(holdings)
    .where(eq(holdings.investorId, investorId))
    .all();
  const holdingRows = await Promise.all(holdingBase.map(async (h) => {
      const project = h.projectId
        ? await db.select().from(projects).where(eq(projects.id, h.projectId)).get()
        : null;
      return {
        ...h,
        metadata: JSON.parse(h.metadata || "{}") as Record<string, unknown>,
        project,
      };
    }));

  const allocationBase = await db
    .select()
    .from(allocations)
    .where(eq(allocations.investorId, investorId))
    .orderBy(desc(allocations.createdAt))
    .all();
  const allocationRows = await Promise.all(allocationBase.map(async (a) => {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, a.projectId))
        .get();
      return { ...a, project };
    }));

  const investedProjectIds = [
    ...new Set(
      holdingRows
        .filter((h) => h.projectId)
        .map((h) => h.projectId as string)
    ),
  ];

  const recentProofs = investedProjectIds.length
    ? (await db
        .select()
        .from(proofsOfBuild)
        .orderBy(desc(proofsOfBuild.createdAt))
        .all())
        .filter((p) => investedProjectIds.includes(p.projectId))
        .slice(0, 5)
        .map(async (p) => {
          const project = await db
            .select()
            .from(projects)
            .where(eq(projects.id, p.projectId))
            .get();
          return { ...p, project };
        })
    : [];

  const recentRuns = investedProjectIds.length
    ? (await db
        .select()
        .from(agentRuns)
        .orderBy(desc(agentRuns.createdAt))
        .all())
        .filter((r) => investedProjectIds.includes(r.projectId))
        .slice(0, 5)
        .map(async (r) => {
          const project = await db
            .select()
            .from(projects)
            .where(eq(projects.id, r.projectId))
            .get();
          return { ...r, project };
        })
    : [];

  const updates = investedProjectIds.length
    ? (await db
        .select()
        .from(stakeholderUpdates)
        .where(eq(stakeholderUpdates.status, "PUBLISHED"))
        .orderBy(desc(stakeholderUpdates.publishedAt))
        .all())
        .filter((u) => investedProjectIds.includes(u.projectId))
        .slice(0, 8)
        .map(async (u) => {
          const project = await db
            .select()
            .from(projects)
            .where(eq(projects.id, u.projectId))
            .get();
          return { ...u, project };
        })
    : [];

  const vibeHolding = holdingRows.find((h) => h.assetType === "VIBE");
  const tokenHoldings = holdingRows.filter((h) => h.assetType === "PROJECT_TOKEN");
  const nftHoldings = holdingRows.filter((h) => h.assetType === "NFT");

  const simulatedTotal =
    holdingRows.reduce((sum, h) => sum + (h.simulatedValue ?? 0), 0) || 0;

  const byCategory: Record<string, number> = {};
  for (const h of tokenHoldings) {
    const cat = h.project?.category ?? "Other";
    byCategory[cat] = (byCategory[cat] ?? 0) + (h.simulatedValue ?? 0);
  }

  return {
    investor,
    vibeBalance: vibeHolding?.amount ?? investor?.vibeBalance ?? 0,
    simulatedTotal,
    holdings: holdingRows,
    tokenHoldings,
    nftHoldings,
    allocations: allocationRows,
    recentProofs: await Promise.all(recentProofs),
    recentRuns: await Promise.all(recentRuns),
    updates: await Promise.all(updates),
    byCategory,
    investedProjectCount: investedProjectIds.length,
  };
}
