import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import {
  allocations,
  buildRounds,
  holdings,
  nfts,
  projects,
  resourceRequirements,
  users,
} from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";
import { nowIso } from "@/lib/db/seed-data";
import type { ResourceType } from "@/lib/types";
import {
  getConversionRate,
  previewAllocation,
  vibeToAmdGpuHours,
} from "@/lib/resources/conversion";
import { ensureFirstProofForBuildRound } from "@/lib/proof-of-build/builder";

export type AllocateInput = {
  investorId: string;
  buildRoundId: string;
  /** Investor contributions use VIBE. */
  resourceType: ResourceType;
  amount: number;
};

async function creditProjectTokens(input: {
  investorId: string;
  projectId: string;
  tokenSymbol: string;
  tokenName: string;
  amount: number;
  createdAt: string;
}) {
  const db = getDb();
  const existing = await db
    .select()
    .from(holdings)
    .where(
      and(
        eq(holdings.investorId, input.investorId),
        eq(holdings.projectId, input.projectId),
        eq(holdings.assetType, "PROJECT_TOKEN"),
        eq(holdings.assetSymbol, input.tokenSymbol)
      )
    )
    .get();

  if (existing) {
    await db.update(holdings)
      .set({
        amount: existing.amount + input.amount,
        simulatedValue:
          (existing.simulatedValue ?? existing.amount) + input.amount * 1.2,
        updatedAt: input.createdAt,
      })
      .where(eq(holdings.id, existing.id))
      .run();
  } else {
    await db.insert(holdings)
      .values({
        id: `hold-${nanoid(10)}`,
        investorId: input.investorId,
        projectId: input.projectId,
        assetType: "PROJECT_TOKEN",
        assetSymbol: input.tokenSymbol,
        assetName: input.tokenName,
        amount: input.amount,
        simulatedValue: input.amount * 1.2,
        metadata: JSON.stringify({ source: "Build Round allocation" }),
        createdAt: input.createdAt,
        updatedAt: input.createdAt,
      })
      .run();
  }
}

async function creditNft(input: {
  investorId: string;
  projectId: string;
  tokenSymbol: string | null | undefined;
  rewardNftId: string;
  createdAt: string;
}) {
  const db = getDb();
  const existingNft = await db
    .select()
    .from(holdings)
    .where(
      and(
        eq(holdings.investorId, input.investorId),
        eq(holdings.projectId, input.projectId),
        eq(holdings.assetType, "NFT")
      )
    )
    .get();
  if (existingNft) return;

  const nft = await db.select().from(nfts).where(eq(nfts.id, input.rewardNftId)).get();
  await db.insert(holdings)
    .values({
      id: `hold-${nanoid(10)}`,
      investorId: input.investorId,
      projectId: input.projectId,
      assetType: "NFT",
      assetSymbol: `${input.tokenSymbol || "PROJ"}-NFT`,
      assetName: nft?.name ?? "Project NFT",
      amount: 1,
      simulatedValue: 500,
      metadata: JSON.stringify({
        nftId: input.rewardNftId,
        rarity: nft?.rarity,
        description: nft?.description,
        utility: nft ? JSON.parse(nft.utility) : [],
      }),
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    })
    .run();
}

export async function allocateToRound(input: AllocateInput) {
  await ensureSeeded();
  const db = getDb();

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  const round = await db
    .select()
    .from(buildRounds)
    .where(eq(buildRounds.id, input.buildRoundId))
    .get();
  if (!round) throw new Error("Build Round not found.");
  if (round.status === "DRAFT" || round.status === "COMPLETED") {
    throw new Error("This Build Round is not open for allocations.");
  }

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, round.projectId))
    .get();
  if (!project) throw new Error("Project not found.");

  const investor = await db
    .select()
    .from(users)
    .where(eq(users.id, input.investorId))
    .get();
  if (!investor) throw new Error("Investor not found.");

  if (input.resourceType !== "VIBE") {
    throw new Error(
      "Contribute with VIBE. VIBE converts to AMD GPU Cloud Credits (demo rate: 1,000 VIBE = 1 AMD GPU Hour)."
    );
  }

  const conversion = getConversionRate("VIBE");
  const preview = previewAllocation({
    projectId: project.id,
    resourceType: "VIBE",
    amount: input.amount,
  });
  const amdGpuHours = vibeToAmdGpuHours(input.amount);

  // Debit VIBE balance
  {
    const vibeHolding = await db
      .select()
      .from(holdings)
      .where(
        and(
          eq(holdings.investorId, input.investorId),
          eq(holdings.assetType, "VIBE")
        )
      )
      .get();
    const balance = vibeHolding?.amount ?? investor.vibeBalance;
    if (balance < input.amount) {
      throw new Error("Insufficient VIBE balance.");
    }
    if (vibeHolding) {
      await db.update(holdings)
        .set({
          amount: vibeHolding.amount - input.amount,
          simulatedValue:
            (vibeHolding.simulatedValue ?? vibeHolding.amount) - input.amount,
          updatedAt: nowIso(),
        })
        .where(eq(holdings.id, vibeHolding.id))
        .run();
    }
    await db.update(users)
      .set({ vibeBalance: Math.max(0, investor.vibeBalance - input.amount) })
      .where(eq(users.id, input.investorId))
      .run();
  }

  let rewardNftId: string | null = null;
  if (preview.nftEligible) {
    const nft = await db
      .select()
      .from(nfts)
      .where(eq(nfts.projectId, project.id))
      .get();
    rewardNftId = nft?.id ?? null;
  }

  const allocationId = `alloc-${nanoid(10)}`;
  const createdAt = nowIso();
  const immediate = !conversion.requiresVerification;
  const settlementStatus = immediate
    ? "IMMEDIATE"
    : "PENDING_VERIFICATION";

  await db.insert(allocations)
    .values({
      id: allocationId,
      investorId: input.investorId,
      buildRoundId: input.buildRoundId,
      projectId: project.id,
      resourceType: input.resourceType,
      amount: input.amount,
      normalizedValue: preview.buildUnits,
      buildUnits: preview.buildUnits,
      rewardTokens: preview.estimatedTokens,
      rewardNftId,
      settlementStatus,
      verifiedAt: immediate ? createdAt : null,
      createdAt,
    })
    .run();

  // Progress Build Round by Build Units
  await db.update(buildRounds)
    .set({
      fundedValue: round.fundedValue + preview.buildUnits,
      status:
        round.fundedValue + preview.buildUnits >= round.targetValue
          ? "FUNDED"
          : round.status === "OPEN"
            ? "BUILDING"
            : round.status,
    })
    .where(eq(buildRounds.id, round.id))
    .run();

  // Credit VIBE requirement and AMD GPU Hours requirement (via conversion)
  const vibeReq = await db
    .select()
    .from(resourceRequirements)
    .where(
      and(
        eq(resourceRequirements.buildRoundId, round.id),
        eq(resourceRequirements.type, "VIBE")
      )
    )
    .get();
  if (vibeReq) {
    await db.update(resourceRequirements)
      .set({ fundedAmount: vibeReq.fundedAmount + input.amount })
      .where(eq(resourceRequirements.id, vibeReq.id))
      .run();
  }
  const gpuReq = await db
    .select()
    .from(resourceRequirements)
    .where(
      and(
        eq(resourceRequirements.buildRoundId, round.id),
        eq(resourceRequirements.type, "AMD_GPU_HOURS")
      )
    )
    .get();
  if (gpuReq && amdGpuHours > 0) {
    await db.update(resourceRequirements)
      .set({ fundedAmount: gpuReq.fundedAmount + amdGpuHours })
      .where(eq(resourceRequirements.id, gpuReq.id))
      .run();
  }

  let tokensReleased = 0;
  let nftReleased = false;

  // Immediate settlement: credit tokens + NFT now
  if (immediate && preview.estimatedTokens > 0 && project.tokenSymbol) {
    await creditProjectTokens({
      investorId: input.investorId,
      projectId: project.id,
      tokenSymbol: project.tokenSymbol,
      tokenName: project.tokenName ?? `${project.name} Token`,
      amount: preview.estimatedTokens,
      createdAt,
    });
    tokensReleased = preview.estimatedTokens;
  }

  if (immediate && rewardNftId) {
    await creditNft({
      investorId: input.investorId,
      projectId: project.id,
      tokenSymbol: project.tokenSymbol,
      rewardNftId,
      createdAt,
    });
    nftReleased = true;
  }

  // Fetch NFT details for reward UX
  let nftDetails = null;
  if (rewardNftId) {
    const nft = await db.select().from(nfts).where(eq(nfts.id, rewardNftId)).get();
    if (nft) {
      nftDetails = {
        id: nft.id,
        name: nft.name,
        description: nft.description,
        imageEmoji: nft.imageEmoji,
        rarity: nft.rarity,
        utility: JSON.parse(nft.utility) as string[],
        released: nftReleased,
      };
    }
  }

  // A startup's first allocation must create a real replayable Proof before
  // the client navigates to it. Existing projects reuse their latest Proof.
  const proof = await ensureFirstProofForBuildRound(round.id);

  const updatedVibeHolding = await db
    .select()
    .from(holdings)
    .where(
      and(
        eq(holdings.investorId, input.investorId),
        eq(holdings.assetType, "VIBE")
      )
    )
    .get();

  return {
    allocationId,
    proofId: proof.id,
    rewardTokens: preview.estimatedTokens,
    tokensReleased,
    rewardNftId,
    nft: nftDetails,
    projectSlug: project.slug,
    projectName: project.name,
    projectId: project.id,
    tokenSymbol: project.tokenSymbol,
    buildUnits: preview.buildUnits,
    amdGpuHours,
    conversionLabel: preview.conversionLabel,
    settlementStatus,
    requiresVerification: false,
    resourceLabel: conversion.label,
    unitLabel: conversion.unitLabel,
    amount: input.amount,
    vibeBalance: updatedVibeHolding?.amount ?? 0,
  };
}

/**
 * Verify a pending productive contribution and release Project Tokens.
 * Controlled action for Demo Mode; models real verification pipeline.
 */
export async function verifyContribution(allocationId: string) {
  await ensureSeeded();
  const db = getDb();
  const allocation = await db
    .select()
    .from(allocations)
    .where(eq(allocations.id, allocationId))
    .get();
  if (!allocation) throw new Error("Allocation not found.");
  if (allocation.settlementStatus !== "PENDING_VERIFICATION") {
    throw new Error("Only pending contributions can be verified.");
  }

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, allocation.projectId))
    .get();
  if (!project) throw new Error("Project not found.");

  const createdAt = nowIso();

  if (allocation.rewardTokens > 0 && project.tokenSymbol) {
    await creditProjectTokens({
      investorId: allocation.investorId,
      projectId: project.id,
      tokenSymbol: project.tokenSymbol,
      tokenName: project.tokenName ?? `${project.name} Token`,
      amount: allocation.rewardTokens,
      createdAt,
    });
  }

  let nftReleased = false;
  if (allocation.rewardNftId) {
    await creditNft({
      investorId: allocation.investorId,
      projectId: project.id,
      tokenSymbol: project.tokenSymbol,
      rewardNftId: allocation.rewardNftId,
      createdAt,
    });
    nftReleased = true;
  }

  await db.update(allocations)
    .set({
      settlementStatus: "REWARD_RELEASED",
      verifiedAt: createdAt,
    })
    .where(eq(allocations.id, allocationId))
    .run();

  return {
    allocationId,
    settlementStatus: "REWARD_RELEASED" as const,
    tokensReleased: allocation.rewardTokens,
    tokenSymbol: project.tokenSymbol,
    nftReleased,
    projectSlug: project.slug,
  };
}

export async function getAllocationById(id: string) {
  await ensureSeeded();
  const db = getDb();
  return await db.select().from(allocations).where(eq(allocations.id, id)).get();
}
