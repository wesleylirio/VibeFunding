import { NextResponse } from "next/server";
import { getPortfolio } from "@/lib/queries/portfolio";
import { INVESTOR_ID } from "@/lib/db/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const portfolio = await getPortfolio(INVESTOR_ID);
  const pending = portfolio.allocations
    .filter((a) => a.settlementStatus === "PENDING_VERIFICATION")
    .map((a) => ({
      id: a.id,
      projectName: a.project?.name,
      resourceType: a.resourceType,
      amount: a.amount,
      rewardTokens: a.rewardTokens,
      buildUnits: a.buildUnits,
    }));
  const verified = portfolio.allocations
    .filter((a) =>
      ["REWARD_RELEASED", "VERIFIED", "IMMEDIATE"].includes(
        a.settlementStatus || "IMMEDIATE"
      )
    )
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      projectName: a.project?.name,
      settlementStatus: a.settlementStatus,
      rewardTokens: a.rewardTokens,
    }));

  return NextResponse.json({
    vibeBalance: portfolio.vibeBalance,
    simulatedTotal: portfolio.simulatedTotal,
    tokenHoldings: portfolio.tokenHoldings.map((h) => ({
      id: h.id,
      symbol: h.assetSymbol,
      name: h.assetName,
      amount: h.amount,
      projectName: h.project?.name,
      projectSlug: h.project?.slug,
    })),
    nftHoldings: portfolio.nftHoldings.map((h) => ({
      id: h.id,
      name: h.assetName,
      amount: h.amount,
      projectName: h.project?.name,
      metadata: h.metadata,
    })),
    pendingContributions: pending,
    verifiedContributions: verified,
  });
}
