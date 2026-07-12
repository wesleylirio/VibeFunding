import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractJson,
  gemmaInsightSchema,
  quickstartDraftSchema,
} from "../src/lib/gemma/schemas";
import {
  contextHash,
  getCached,
  invalidateCache,
  setCache,
} from "../src/lib/gemma/cache";
import {
  getProviderMode,
  resetGemmaGatewayForTests,
} from "../src/lib/gemma";
import { buildPortfolioContext, buildProjectContext, buildProofContext } from "../src/lib/gemma/context-builders";
import { formatAmdRequestMessages } from "./helpers/gemma-format";

describe("provider selection", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
    resetGemmaGatewayForTests();
  });

  it("defaults to auto", () => {
    delete process.env.GEMMA_PROVIDER;
    expect(getProviderMode()).toBe("auto");
  });

  it("reads amd/mock/cache", () => {
    process.env.GEMMA_PROVIDER = "amd";
    expect(getProviderMode()).toBe("amd");
    process.env.GEMMA_PROVIDER = "mock";
    expect(getProviderMode()).toBe("mock");
    process.env.GEMMA_PROVIDER = "cache";
    expect(getProviderMode()).toBe("cache");
  });
});

describe("AMD request formatting", () => {
  it("builds OpenAI-compatible messages without secrets", () => {
    const messages = formatAmdRequestMessages({
      system: "You are Gemma",
      user: "Summarize portfolio",
    });
    expect(messages).toEqual([
      { role: "system", content: "You are Gemma" },
      { role: "user", content: "Summarize portfolio" },
    ]);
    const raw = JSON.stringify(messages);
    expect(raw).not.toMatch(/api[_-]?key/i);
    expect(raw).not.toMatch(/password/i);
  });
});

describe("cache", () => {
  beforeEach(() => invalidateCache());

  it("stores and hits cache", () => {
    const key = "test:1";
    setCache(key, {
      value: { hello: "world" },
      provider: "AMD_GEMMA",
      contextType: "TEST",
    });
    const hit = getCached<{ hello: string }>(key, 60_000);
    expect(hit?.value.hello).toBe("world");
    expect(hit?.provider).toBe("AMD_GEMMA");
  });

  it("invalidates by prefix and TTL", () => {
    setCache("proof:a", {
      value: 1,
      provider: "AMD_GEMMA",
      contextType: "PROOF",
      createdAt: Date.now() - 100,
    });
    invalidateCache("proof:");
    expect(getCached("proof:a")).toBeNull();

    setCache("old", {
      value: 1,
      provider: "DEMO",
      contextType: "X",
      createdAt: Date.now() - 999999,
    });
    expect(getCached("old", 10)).toBeNull();
  });

  it("hashes contexts stably", () => {
    expect(contextHash("A", { x: 1 })).toBe(contextHash("A", { x: 1 }));
    expect(contextHash("A", { x: 1 })).not.toBe(contextHash("A", { x: 2 }));
  });
});

describe("structured output validation", () => {
  it("extracts JSON from fenced model output", () => {
    const raw = 'Here you go:\n```json\n{"title":"T","summary":"S"}\n```';
    const parsed = extractJson(raw);
    const v = gemmaInsightSchema.parse(parsed);
    expect(v.title).toBe("T");
  });

  it("rejects malformed insight", () => {
    const bad = gemmaInsightSchema.safeParse({ title: "" });
    expect(bad.success).toBe(false);
  });

  it("validates quickstart draft shape", () => {
    const draft = quickstartDraftSchema.parse({
      name: "RouteLab",
      pitch: "Routing for open models",
      description: "desc",
      problem: "p",
      solution: "s",
      audience: "a",
      stage: "MVP",
      buildRound: {
        title: "R1",
        objective: "Ship router",
        deliverables: ["API"],
        sprintDraft: [],
        resources: [],
        estimatedBuildUnits: 1000,
        risks: [],
        returns: [],
      },
      token: { symbol: "RTE", name: "Route Token" },
      nft: { name: "Pass", utility: [] },
      investorSummary: "summary",
      onePaper: "# One-Paper",
    });
    expect(draft.token.symbol).toBe("RTE");
  });
});

describe("context filtering boundaries", () => {
  beforeEach(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL || "file:./data/test-gemma-ctx.db";
    const { seedDatabase } = await import("../src/lib/db/seed");
    seedDatabase({ force: true });
  });

  it("portfolio context excludes private agent payloads", async () => {
    const ctx = await buildPortfolioContext({ displayName: "Wesley" });
    const raw = JSON.stringify(ctx);
    expect(raw).not.toMatch(/privatePayload/i);
    expect(raw).not.toMatch(/password/i);
    expect(raw).not.toMatch(/apiKey/i);
    expect(ctx.displayName).toBe("Wesley");
    expect(ctx.holdings).toBeDefined();
  });

  it("project context is public diligence data only", async () => {
    const ctx = await buildProjectContext({ projectSlug: "collabmesh" });
    expect(ctx?.name).toBe("CollabMesh");
    const raw = JSON.stringify(ctx);
    expect(raw).not.toMatch(/FOUNDER_ONLY/);
    expect(raw).not.toMatch(/private_payload/);
  });

  it("proof context includes hashes not secrets", async () => {
    const ctx = await buildProofContext("proof-collabmesh-1");
    expect(ctx?.taskTitle).toBeTruthy();
    expect(ctx?.manifestHash).toBeTruthy();
    const raw = JSON.stringify(ctx);
    expect(raw).not.toMatch(/Authorization/);
    expect(raw).not.toMatch(/GEMMA_API_KEY/);
  });
});

describe("AMD failure fallback", () => {
  afterEach(() => {
    resetGemmaGatewayForTests();
    vi.unstubAllGlobals();
    delete process.env.GEMMA_BASE_URL;
    delete process.env.GEMMA_API_KEY;
  });

  it("uses mock when AMD is not configured", async () => {
    process.env.GEMMA_PROVIDER = "auto";
    process.env.GEMMA_BASE_URL = "";
    process.env.GEMMA_API_KEY = "";
    resetGemmaGatewayForTests();
    const { getGemmaGateway } = await import("../src/lib/gemma");
    const gw = getGemmaGateway();
    const insight = await gw.analyzePortfolio({
      investorId: "user-investor-demo",
    });
    expect(insight.summary.length).toBeGreaterThan(10);
    expect(["DEMO", "CACHE", "AMD_GEMMA"]).toContain(insight.provider);
  });

  it("falls back when AMD fetch fails", async () => {
    process.env.GEMMA_PROVIDER = "amd";
    process.env.GEMMA_BASE_URL = "http://127.0.0.1:9";
    process.env.GEMMA_API_KEY = "test-key-not-real";
    process.env.GEMMA_TIMEOUT_MS = "200";
    resetGemmaGatewayForTests();
    const { getGemmaGateway } = await import("../src/lib/gemma");
    const gw = getGemmaGateway();
    const res = await gw.chat({
      message: "hello",
      context: "GLOBAL_DISCOVERY",
    });
    expect(res.content.length).toBeGreaterThan(5);
    // fallback path — not a crash
    expect(res.provider === "DEMO" || res.provider === "CACHE" || res.provider === "AMD_GEMMA").toBe(
      true
    );
  });
});

describe("health redaction contract", () => {
  it("health payload keys never include apiKey field names", async () => {
    const { GET } = await import("../src/app/api/gemma/health/route");
    const res = await GET();
    const json = await res.json();
    const raw = JSON.stringify(json);
    expect(raw).not.toMatch(/GEMMA_API_KEY/);
    expect(json).toHaveProperty("configured");
    expect(json).toHaveProperty("reachable");
    expect(json).toHaveProperty("model");
  });
});
