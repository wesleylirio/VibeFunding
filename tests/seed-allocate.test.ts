import fs from "fs";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDb = path.join(process.cwd(), "data", "test-app.db");

describe("seed and allocate", () => {
  let allocateToRound: typeof import("../src/lib/portfolio/allocate").allocateToRound;
  let getPortfolio: typeof import("../src/lib/queries/portfolio").getPortfolio;
  let getProofById: typeof import("../src/lib/queries/proofs").getProofById;
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
    const proofsMod = await import("../src/lib/queries/proofs");
    const ids = await import("../src/lib/db/seed-data");

    seedDatabase = seedMod.seedDatabase;
    resetDemo = seedMod.resetDemo;
    allocateToRound = allocateMod.allocateToRound;
    getPortfolio = portfolioMod.getPortfolio;
    getProofById = proofsMod.getProofById;
    INVESTOR_ID = ids.INVESTOR_ID;

    await seedDatabase({ force: true });
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

  it("seeds investor and projects", async () => {
    const portfolio = await getPortfolio(INVESTOR_ID);
    expect(portfolio.investor?.name).toBeTruthy();
    expect(portfolio.vibeBalance).toBeGreaterThan(0);
    expect(portfolio.tokenHoldings.length).toBeGreaterThan(0);
  });

  it("persists allocation and holdings", async () => {
    const before = await getPortfolio(INVESTOR_ID);
    const result = await allocateToRound({
      investorId: INVESTOR_ID,
      buildRoundId: "round-collabmesh-presence",
      resourceType: "VIBE",
      amount: 500,
    });
    expect(result.rewardTokens).toBeGreaterThan(0);
    expect(result.settlementStatus).toBe("IMMEDIATE");

    const after = await getPortfolio(INVESTOR_ID);
    expect(after.vibeBalance).toBe(before.vibeBalance - 500);
    expect(after.allocations.length).toBeGreaterThan(before.allocations.length);
  });

  it("creates a real first Proof for a project that has none", async () => {
    const result = await allocateToRound({
      investorId: INVESTOR_ID,
      buildRoundId: "round-auditforge-packs",
      resourceType: "VIBE",
      amount: 500,
    });

    expect(result.proofId).toMatch(/^proof-/);
    const proof = await getProofById(result.proofId);
    expect(proof?.project?.slug).toBe("auditforge");
    expect(proof?.run?.status).toBe("COMPLETED");
    expect(proof?.artifacts.length).toBeGreaterThan(0);
  });

  it("reset restores demo state", async () => {
    await resetDemo();
    const portfolio = await getPortfolio(INVESTOR_ID);
    expect(portfolio.vibeBalance).toBe(50000);
  });
});
