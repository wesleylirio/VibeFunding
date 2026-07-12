import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  agentRuns,
  buildRounds,
  projects,
  proofsOfBuild,
} from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import {
  getInvestedProjectSlugs,
  getPortfolio,
} from "@/lib/queries/portfolio";
import { getProofById } from "@/lib/queries/proofs";
import { getProjectBySlug } from "@/lib/queries/projects";
import { INVESTOR_ID } from "@/lib/db/seed-data";

/** Minimal portfolio context for live Gemma — no secrets, no private agent payloads. */
export async function buildPortfolioContext(input: {
  investorId?: string;
  displayName?: string;
}) {
  ensureSeeded();
  const investorId = input.investorId || INVESTOR_ID;
  const portfolio = await getPortfolio(investorId);
  const pending = portfolio.allocations.filter(
    (a) => a.settlementStatus === "PENDING_VERIFICATION"
  );

  return {
    displayName: input.displayName || portfolio.investor?.name || "Investor",
    vibeBalance: portfolio.vibeBalance,
    portfolioUnits: portfolio.simulatedTotal,
    categoryExposure: portfolio.byCategory,
    holdings: portfolio.tokenHoldings.map((h) => ({
      symbol: h.assetSymbol,
      amount: h.amount,
      project: h.project?.name,
      category: h.project?.category,
      stage: h.project?.stage,
    })),
    nfts: portfolio.nftHoldings.map((h) => ({
      name: h.assetName,
      project: h.project?.name,
    })),
    recentAllocations: portfolio.allocations.slice(0, 8).map((a) => ({
      project: a.project?.name,
      resourceType: a.resourceType,
      amount: a.amount,
      settlementStatus: a.settlementStatus,
      rewardTokens: a.rewardTokens,
    })),
    pendingContributions: pending.map((a) => ({
      project: a.project?.name,
      resourceType: a.resourceType,
      amount: a.amount,
      estimatedTokens: a.rewardTokens,
    })),
    recentProofs: portfolio.recentProofs.map((p) => ({
      task: p.taskTitle,
      project: p.project?.name,
      verification: p.verificationStatus,
      tests: `${p.testsPassed}/${p.testsTotal}`,
    })),
    recentUpdates: portfolio.updates.slice(0, 5).map((u) => ({
      title: u.title,
      project: u.project?.name,
      publishedAt: u.publishedAt,
    })),
  };
}

export async function buildProjectContext(input: {
  projectId?: string;
  projectSlug?: string;
}) {
  await ensureSeeded();
  const db = getDb();
  let project =
    input.projectSlug != null
      ? await getProjectBySlug(input.projectSlug)
      : null;
  if (!project && input.projectId) {
    const row = await db
      .select()
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .get();
    if (row) project = await getProjectBySlug(row.slug);
  }
  if (!project) return null;

  const founder = project.founder
    ? {
        name: project.founder.name,
        bio: project.founder.bio,
      }
    : null;

  return {
    name: project.name,
    slug: project.slug,
    pitch: project.shortDescription,
    description: project.description.slice(0, 2500),
    category: project.category,
    stage: project.stage,
    status: project.status,
    techStack: project.techStack,
    metrics: project.metrics,
    risks: project.risks,
    tokenSymbol: project.tokenSymbol,
    founder,
    rounds: project.rounds.slice(0, 4).map((r) => ({
      title: r.title,
      objective: r.objective,
      status: r.status,
      progress: r.progress,
      targetValue: r.targetValue,
      fundedValue: r.fundedValue,
      deliverables: r.expectedDeliverables,
      risks: r.risks,
      resources: r.resources.map((res) => ({
        label: res.label,
        type: res.type,
        funded: res.fundedAmount,
        target: res.targetAmount,
        unit: res.unit,
      })),
      returns: r.returns.map((ret) => ({
        type: ret.type,
        title: ret.title,
        description: ret.description,
      })),
    })),
    proofs: project.proofs.slice(0, 3).map((p) => ({
      task: p.taskTitle,
      verification: p.verificationStatus,
      tests: `${p.testsPassed}/${p.testsTotal}`,
      filesChanged: p.filesChanged,
      publicSummary: p.publicSummary,
    })),
    agentActivity: project.runs.slice(0, 3).map((r) => ({
      task: r.taskTitle,
      status: r.status,
      model: r.model,
      harness: r.harness,
      publicSummary: r.publicSummary,
    })),
  };
}

export async function buildProofContext(proofId: string) {
  await ensureSeeded();
  const proof = await getProofById(proofId);
  if (!proof) return null;
  return {
    taskTitle: proof.taskTitle,
    taskDescription: proof.taskDescription,
    publicSummary: proof.publicSummary,
    gemmaSummary: proof.gemmaSummary,
    verificationStatus: proof.verificationStatus,
    agentName: proof.agentName,
    harness: proof.harness,
    model: proof.model,
    provider: proof.provider,
    computeSource: proof.computeSource,
    inputTokens: proof.inputTokens,
    outputTokens: proof.outputTokens,
    computeTimeSeconds: proof.computeTimeSeconds,
    filesChanged: proof.filesChanged,
    linesAdded: proof.linesAdded,
    linesRemoved: proof.linesRemoved,
    testsTotal: proof.testsTotal,
    testsPassed: proof.testsPassed,
    testsFailed: proof.testsFailed,
    commitHash: proof.commitHash,
    manifestHash: proof.manifestHash,
    artifactRootHash: proof.artifactRootHash,
    hashMatches: proof.hashCheck.matches,
    project: proof.project
      ? { name: proof.project.name, slug: proof.project.slug }
      : null,
    buildRound: proof.round
      ? { title: proof.round.title, status: proof.round.status }
      : null,
    artifacts: proof.artifacts.map((a) => ({
      name: a.name,
      type: a.type,
      hash: a.hash,
    })),
  };
}

export async function buildStakeholderContext(input: {
  projectId: string;
  buildRoundId?: string;
  notes?: string;
}) {
  await ensureSeeded();
  const db = getDb();
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .get();
  if (!project) return null;

  const rounds = await db
    .select()
    .from(buildRounds)
    .where(eq(buildRounds.projectId, input.projectId))
    .orderBy(desc(buildRounds.createdAt))
    .all();
  const round = input.buildRoundId
    ? rounds.find((r) => r.id === input.buildRoundId)
    : rounds[0];

  const runs = (await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.projectId, input.projectId))
    .orderBy(desc(agentRuns.createdAt))
    .all())
    .slice(0, 3);

  const proofs = (await db
    .select()
    .from(proofsOfBuild)
    .where(eq(proofsOfBuild.projectId, input.projectId))
    .orderBy(desc(proofsOfBuild.createdAt))
    .all())
    .slice(0, 3);

  return {
    project: {
      name: project.name,
      stage: project.stage,
      shortDescription: project.shortDescription,
    },
    buildRound: round
      ? {
          title: round.title,
          objective: round.objective,
          status: round.status,
          fundedValue: round.fundedValue,
          targetValue: round.targetValue,
          deliverables: JSON.parse(round.expectedDeliverables) as string[],
        }
      : null,
    agentRuns: runs.map((r) => ({
      task: r.taskTitle,
      status: r.status,
      publicSummary: r.publicSummary,
      tests: `${r.testsPassed}/${r.testsTotal}`,
    })),
    proofs: proofs.map((p) => ({
      task: p.taskTitle,
      verification: p.verificationStatus,
      publicSummary: p.publicSummary,
    })),
    founderNotes: input.notes?.slice(0, 1500) || "",
  };
}

export function buildQuickstartPromptContext(input: {
  building: string;
  stage: string;
  nextGoal: string;
  evidence: string;
}) {
  return {
    building: input.building.slice(0, 2000),
    stage: input.stage.slice(0, 80),
    nextGoal: input.nextGoal.slice(0, 1000),
    evidence: (input.evidence || "").slice(0, 1500),
    platformNotes: {
      resources: ["VIBE → AMD GPU Cloud Credits"],
      conversion: "50 VIBE = 1 AMD GPU Hour",
      settlement:
        "VIBE settles as AMD GPU Cloud Credits; Project Tokens from Build Units",
      founderControl: "Draft only — founder edits and publishes",
    },
  };
}

export async function buildChatContextPayload(input: {
  context: string;
  projectId?: string;
  projectSlug?: string;
  proofId?: string;
  buildRoundId?: string;
  displayName?: string;
  role?: string;
}) {
  const base: Record<string, unknown> = {
    pageContext: input.context,
    role: input.role || "INVESTOR",
    user: input.displayName ? { displayName: input.displayName } : undefined,
  };

  if (
    input.context === "INVESTOR_PORTFOLIO" ||
    input.context === "GLOBAL_DISCOVERY" ||
    input.context === "PROJECT_DILIGENCE" ||
    input.context === "BUILD_ROUND_ANALYSIS"
  ) {
    base.portfolio = await buildPortfolioContext({
      displayName: input.displayName,
    });
    // Gemma must not re-suggest these for new investment
    base.alreadyInvestedSlugs = [...await getInvestedProjectSlugs(INVESTOR_ID)];
  }
  if (
    input.projectId ||
    input.projectSlug ||
    input.context.includes("PROJECT") ||
    input.context.includes("BUILD_ROUND") ||
    input.context.includes("FOUNDER")
  ) {
    base.project = await buildProjectContext({
      projectId: input.projectId,
      projectSlug: input.projectSlug,
    });
  }
  if (input.proofId || input.context === "PROOF_OF_BUILD") {
    if (input.proofId) {
      base.proof = await buildProofContext(input.proofId);
    }
  }
  return base;
}
