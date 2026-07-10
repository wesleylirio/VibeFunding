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

export function getPortfolio(investorId = INVESTOR_ID) {
  ensureSeeded();
  const db = getDb();
  const investor = db.select().from(users).where(eq(users.id, investorId)).get();

  const holdingRows = db
    .select()
    .from(holdings)
    .where(eq(holdings.investorId, investorId))
    .all()
    .map((h) => {
      const project = h.projectId
        ? db.select().from(projects).where(eq(projects.id, h.projectId)).get()
        : null;
      return {
        ...h,
        metadata: JSON.parse(h.metadata || "{}") as Record<string, unknown>,
        project,
      };
    });

  const allocationRows = db
    .select()
    .from(allocations)
    .where(eq(allocations.investorId, investorId))
    .orderBy(desc(allocations.createdAt))
    .all()
    .map((a) => {
      const project = db
        .select()
        .from(projects)
        .where(eq(projects.id, a.projectId))
        .get();
      return { ...a, project };
    });

  const investedProjectIds = [
    ...new Set(
      holdingRows
        .filter((h) => h.projectId)
        .map((h) => h.projectId as string)
    ),
  ];

  const recentProofs = investedProjectIds.length
    ? db
        .select()
        .from(proofsOfBuild)
        .orderBy(desc(proofsOfBuild.createdAt))
        .all()
        .filter((p) => investedProjectIds.includes(p.projectId))
        .slice(0, 5)
        .map((p) => {
          const project = db
            .select()
            .from(projects)
            .where(eq(projects.id, p.projectId))
            .get();
          return { ...p, project };
        })
    : [];

  const recentRuns = investedProjectIds.length
    ? db
        .select()
        .from(agentRuns)
        .orderBy(desc(agentRuns.createdAt))
        .all()
        .filter((r) => investedProjectIds.includes(r.projectId))
        .slice(0, 5)
        .map((r) => {
          const project = db
            .select()
            .from(projects)
            .where(eq(projects.id, r.projectId))
            .get();
          return { ...r, project };
        })
    : [];

  const updates = investedProjectIds.length
    ? db
        .select()
        .from(stakeholderUpdates)
        .where(eq(stakeholderUpdates.status, "PUBLISHED"))
        .orderBy(desc(stakeholderUpdates.publishedAt))
        .all()
        .filter((u) => investedProjectIds.includes(u.projectId))
        .slice(0, 8)
        .map((u) => {
          const project = db
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
    recentProofs,
    recentRuns,
    updates,
    byCategory,
    investedProjectCount: investedProjectIds.length,
  };
}
