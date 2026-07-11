import fs from "fs";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  VIBE_PER_AMD_GPU_HOUR,
  estimateProjectTokens,
  formatAmdGpuHours,
  previewAllocation,
  toBuildUnits,
  vibeToAmdGpuHours,
} from "../src/lib/resources/conversion";

const testDb = path.join(process.cwd(), "data", "test-alloc-v2.db");

describe("VIBE → AMD GPU conversion (MVP)", () => {
  it("converts VIBE 1:1 to Build Units", () => {
    expect(toBuildUnits("VIBE", 1000)).toBe(1000);
  });

  it("converts VIBE to AMD GPU Hours at fixed rate", () => {
    expect(VIBE_PER_AMD_GPU_HOUR).toBe(50);
    expect(vibeToAmdGpuHours(50)).toBe(1);
    expect(vibeToAmdGpuHours(1000)).toBe(20);
    expect(formatAmdGpuHours(20)).toMatch(/20/);
  });

  it("estimates MESH from Build Units and shows AMD credits", () => {
    // 1000 VIBE → 1000 BU → 800 MESH → 20 AMD GPU Hours
    expect(estimateProjectTokens("proj-collabmesh", 1000)).toBe(800);
    const preview = previewAllocation({
      projectId: "proj-collabmesh",
      resourceType: "VIBE",
      amount: 1000,
    });
    expect(preview.buildUnits).toBe(1000);
    expect(preview.estimatedTokens).toBe(800);
    expect(preview.amdGpuHours).toBe(20);
    expect(preview.requiresVerification).toBe(false);
    expect(preview.conversionLabel).toContain("50 VIBE");
  });
});

describe("allocation settlement", () => {
  let allocateToRound: typeof import("../src/lib/portfolio/allocate").allocateToRound;
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

  it("settles VIBE immediately with tokens and AMD GPU hours", () => {
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
    expect(result.amdGpuHours).toBe(10); // 500 / 50
    const after = getPortfolio(INVESTOR_ID);
    expect(after.vibeBalance).toBe(before.vibeBalance - 500);
  });

  it("rejects non-VIBE contributions", () => {
    expect(() =>
      allocateToRound({
        investorId: INVESTOR_ID,
        buildRoundId: "round-collabmesh-presence",
        resourceType: "AGENT_HOURS",
        amount: 10,
      })
    ).toThrow(/Contribute with VIBE/i);
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
