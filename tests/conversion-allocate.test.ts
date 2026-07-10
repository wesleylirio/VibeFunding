import fs from "fs";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  estimateProjectTokens,
  previewAllocation,
  toBuildUnits,
} from "../src/lib/resources/conversion";

const testDb = path.join(process.cwd(), "data", "test-alloc-v2.db");

describe("Build Units conversion", () => {
  it("converts VIBE 1:1 to Build Units", () => {
    expect(toBuildUnits("VIBE", 1000)).toBe(1000);
  });

  it("converts agent hours with productive rate", () => {
    expect(toBuildUnits("AGENT_HOURS", 20)).toBe(2000);
  });

  it("estimates MESH from Build Units", () => {
    // 1000 VIBE → 1000 BU → 800 MESH
    expect(estimateProjectTokens("proj-collabmesh", 1000)).toBe(800);
    const preview = previewAllocation({
      projectId: "proj-collabmesh",
      resourceType: "VIBE",
      amount: 1000,
    });
    expect(preview.buildUnits).toBe(1000);
    expect(preview.estimatedTokens).toBe(800);
    expect(preview.requiresVerification).toBe(false);
  });

  it("marks productive resources as pending verification", () => {
    const preview = previewAllocation({
      projectId: "proj-collabmesh",
      resourceType: "AGENT_HOURS",
      amount: 20,
    });
    expect(preview.buildUnits).toBe(2000);
    expect(preview.estimatedTokens).toBe(1600);
    expect(preview.requiresVerification).toBe(true);
    expect(preview.settlement).toBe("PENDING_VERIFICATION");
  });
});

describe("allocation settlement", () => {
  let allocateToRound: typeof import("../src/lib/portfolio/allocate").allocateToRound;
  let verifyContribution: typeof import("../src/lib/portfolio/allocate").verifyContribution;
  let getPortfolio: typeof import("../src/lib/queries/portfolio").getPortfolio;
  let seedDatabase: typeof import("../src/lib/db/seed").seedDatabase;
  let resetDemo: typeof import("../src/lib/db/seed").resetDemo;
  let INVESTOR_ID: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = `file:${testDb}`;
    process.env.DEMO_MODE = "true";
    fs.mkdirSync(path.dirname(testDb), { recursive: true });
    for (const f of [testDb, `${testDb}-shm`, `${testDb}-wal`]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }

    const seedMod = await import("../src/lib/db/seed");
    const allocateMod = await import("../src/lib/portfolio/allocate");
    const portfolioMod = await import("../src/lib/queries/portfolio");
    const ids = await import("../src/lib/db/seed-data");

    seedDatabase = seedMod.seedDatabase;
    resetDemo = seedMod.resetDemo;
    allocateToRound = allocateMod.allocateToRound;
    verifyContribution = allocateMod.verifyContribution;
    getPortfolio = portfolioMod.getPortfolio;
    INVESTOR_ID = ids.INVESTOR_ID;

    seedDatabase({ force: true });
  });

  afterAll(async () => {
    try {
      const { getSqlite } = await import("../src/lib/db");
      getSqlite().close();
    } catch {
      /* ignore */
    }
    for (const f of [testDb, `${testDb}-shm`, `${testDb}-wal`]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  });

  it("settles VIBE immediately with tokens", () => {
    const before = getPortfolio(INVESTOR_ID);
    const result = allocateToRound({
      investorId: INVESTOR_ID,
      buildRoundId: "round-collabmesh-presence",
      resourceType: "VIBE",
      amount: 500,
    });
    expect(result.settlementStatus).toBe("IMMEDIATE");
    expect(result.tokensReleased).toBe(400); // 500 BU * 0.8
    expect(result.requiresVerification).toBe(false);
    const after = getPortfolio(INVESTOR_ID);
    expect(after.vibeBalance).toBe(before.vibeBalance - 500);
  });

  it("rejects excessive VIBE amount", () => {
    expect(() =>
      allocateToRound({
        investorId: INVESTOR_ID,
        buildRoundId: "round-collabmesh-presence",
        resourceType: "VIBE",
        amount: 999_999_999,
      })
    ).toThrow(/Insufficient/);
  });

  it("rejects invalid amounts", () => {
    expect(() =>
      allocateToRound({
        investorId: INVESTOR_ID,
        buildRoundId: "round-collabmesh-presence",
        resourceType: "VIBE",
        amount: 0,
      })
    ).toThrow(/positive/);
  });

  it("keeps productive allocation pending until verified", () => {
    const before = getPortfolio(INVESTOR_ID);
    const meshBefore =
      before.tokenHoldings.find((h) => h.assetSymbol === "MESH")?.amount ?? 0;

    const result = allocateToRound({
      investorId: INVESTOR_ID,
      buildRoundId: "round-collabmesh-presence",
      resourceType: "AGENT_HOURS",
      amount: 10,
    });
    expect(result.settlementStatus).toBe("PENDING_VERIFICATION");
    expect(result.tokensReleased).toBe(0);
    expect(result.rewardTokens).toBe(800); // 10*100*0.8

    const mid = getPortfolio(INVESTOR_ID);
    const meshMid =
      mid.tokenHoldings.find((h) => h.assetSymbol === "MESH")?.amount ?? 0;
    expect(meshMid).toBe(meshBefore);

    const verified = verifyContribution(result.allocationId);
    expect(verified.settlementStatus).toBe("REWARD_RELEASED");
    expect(verified.tokensReleased).toBe(800);

    const after = getPortfolio(INVESTOR_ID);
    const meshAfter =
      after.tokenHoldings.find((h) => h.assetSymbol === "MESH")?.amount ?? 0;
    expect(meshAfter).toBe(meshBefore + 800);
  });

  it("grants NFT at liquid threshold", () => {
    resetDemo();
    const result = allocateToRound({
      investorId: INVESTOR_ID,
      buildRoundId: "round-collabmesh-presence",
      resourceType: "VIBE",
      amount: 2000,
    });
    expect(result.nft?.released).toBe(true);
    expect(result.nft?.name).toBeTruthy();
    const portfolio = getPortfolio(INVESTOR_ID);
    expect(portfolio.nftHoldings.length).toBeGreaterThan(0);
  });

  it("reset restores balances", () => {
    resetDemo();
    const portfolio = getPortfolio(INVESTOR_ID);
    expect(portfolio.vibeBalance).toBe(50000);
  });
});
