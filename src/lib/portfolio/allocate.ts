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
} from "@/lib/resources/conversion";

export type AllocateInput = {
  investorId: string;
  buildRoundId: string;
  resourceType: ResourceType;
  amount: number;
};

function creditProjectTokens(input: {
  investorId: string;
  projectId: string;
  tokenSymbol: string;
  tokenName: string;
  amount: number;
  createdAt: string;
}) {
  const db = getDb();
  const existing = db
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
    db.update(holdings)
      .set({
        amount: existing.amount + input.amount,
        simulatedValue:
          (existing.simulatedValue ?? existing.amount) + input.amount * 1.2,
        updatedAt: input.createdAt,
      })
      .where(eq(holdings.id, existing.id))
      .run();
  } else {
    db.insert(holdings)
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

function creditNft(input: {
  investorId: string;
  projectId: string;
  tokenSymbol: string | null | undefined;
  rewardNftId: string;
  createdAt: string;
}) {
  const db = getDb();
  const existingNft = db
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

  const nft = db.select().from(nfts).where(eq(nfts.id, input.rewardNftId)).get();
  db.insert(holdings)
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

export function allocateToRound(input: AllocateInput) {
  ensureSeeded();
  const db = getDb();

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  const round = db
    .select()
    .from(buildRounds)
    .where(eq(buildRounds.id, input.buildRoundId))
    .get();
  if (!round) throw new Error("Build Round not found.");
  if (round.status === "DRAFT" || round.status === "COMPLETED") {
    throw new Error("This Build Round is not open for allocations.");
  }

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, round.projectId))
    .get();
  if (!project) throw new Error("Project not found.");

  const investor = db
    .select()
    .from(users)
    .where(eq(users.id, input.investorId))
    .get();
  if (!investor) throw new Error("Investor not found.");

  const conversion = getConversionRate(input.resourceType);
  const preview = previewAllocation({
    projectId: project.id,
    resourceType: input.resourceType,
    amount: input.amount,
  });

  // Liquid capital: debit VIBE balance
  if (input.resourceType === "VIBE") {
    const vibeHolding = db
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
      db.update(holdings)
        .set({
          amount: vibeHolding.amount - input.amount,
          simulatedValue:
            (vibeHolding.simulatedValue ?? vibeHolding.amount) - input.amount,
          updatedAt: nowIso(),
        })
        .where(eq(holdings.id, vibeHolding.id))
        .run();
    }
    db.update(users)
      .set({ vibeBalance: Math.max(0, investor.vibeBalance - input.amount) })
      .where(eq(users.id, input.investorId))
      .run();
  }

  let rewardNftId: string | null = null;
  if (preview.nftEligible) {
    const nft = db
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

  db.insert(allocations)
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
  db.update(buildRounds)
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

  const resource = db
    .select()
    .from(resourceRequirements)
    .where(
      and(
        eq(resourceRequirements.buildRoundId, round.id),
        eq(resourceRequirements.type, input.resourceType)
      )
    )
    .get();
  if (resource) {
    db.update(resourceRequirements)
      .set({ fundedAmount: resource.fundedAmount + input.amount })
      .where(eq(resourceRequirements.id, resource.id))
      .run();
  }

  let tokensReleased = 0;
  let nftReleased = false;

  // Immediate settlement: credit tokens + NFT now
  if (immediate && preview.estimatedTokens > 0 && project.tokenSymbol) {
    creditProjectTokens({
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
    creditNft({
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
    const nft = db.select().from(nfts).where(eq(nfts.id, rewardNftId)).get();
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

  return {
    allocationId,
    rewardTokens: preview.estimatedTokens,
    tokensReleased,
    rewardNftId,
    nft: nftDetails,
    projectSlug: project.slug,
    projectName: project.name,
    projectId: project.id,
    tokenSymbol: project.tokenSymbol,
    buildUnits: preview.buildUnits,
    settlementStatus,
    requiresVerification: conversion.requiresVerification,
    resourceLabel: conversion.label,
    unitLabel: conversion.unitLabel,
    amount: input.amount,
    vibeBalance:
      db
        .select()
        .from(holdings)
        .where(
          and(
            eq(holdings.investorId, input.investorId),
            eq(holdings.assetType, "VIBE")
          )
        )
        .get()?.amount ?? 0,
  };
}

/**
 * Verify a pending productive contribution and release Project Tokens.
 * Controlled action for Demo Mode; models real verification pipeline.
 */
export function verifyContribution(allocationId: string) {
  ensureSeeded();
  const db = getDb();
  const allocation = db
    .select()
    .from(allocations)
    .where(eq(allocations.id, allocationId))
    .get();
  if (!allocation) throw new Error("Allocation not found.");
  if (allocation.settlementStatus !== "PENDING_VERIFICATION") {
    throw new Error("Only pending contributions can be verified.");
  }

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, allocation.projectId))
    .get();
  if (!project) throw new Error("Project not found.");

  const createdAt = nowIso();

  if (allocation.rewardTokens > 0 && project.tokenSymbol) {
    creditProjectTokens({
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
    creditNft({
      investorId: allocation.investorId,
      projectId: project.id,
      tokenSymbol: project.tokenSymbol,
      rewardNftId: allocation.rewardNftId,
      createdAt,
    });
    nftReleased = true;
  }

  db.update(allocations)
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

export function getAllocationById(id: string) {
  ensureSeeded();
  const db = getDb();
  return db.select().from(allocations).where(eq(allocations.id, id)).get();
}
