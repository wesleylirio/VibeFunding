import { getDb, getSqlite } from "./index";
import { count } from "drizzle-orm";

function useRemoteDb() {
  return Boolean(process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN);
}
import {
  allocations,
  agentEvents,
  agentRuns,
  buildRounds,
  communityComments,
  communityPosts,
  demoState,
  gemmaInsights,
  holdings,
  nfts,
  projects,
  proofArtifacts,
  proofsOfBuild,
  resourceRequirements,
  returnMechanisms,
  stakeholderUpdates,
  users,
} from "./schema";
import {
  DETAILED_PROJECTS,
  FOUNDER_ID,
  INVESTOR_ID,
  SUMMARY_PROJECTS,
  buildAgentEvents,
  buildProofManifest,
  daysAgo,
  daysFromNow,
  nowIso,
  sha256,
} from "./seed-data";

export function clearAllTables() {
  const sqlite = getSqlite();
  const tables = [
    "community_reactions",
    "community_comments",
    "community_posts",
    "proof_artifacts",
    "proofs_of_build",
    "agent_events",
    "agent_runs",
    "stakeholder_updates",
    "gemma_messages",
    "gemma_insights",
    "allocations",
    "holdings",
    "nfts",
    "return_mechanisms",
    "resource_requirements",
    "build_rounds",
    "projects",
    "demo_state",
    "users",
  ];
  sqlite.exec("PRAGMA foreign_keys = OFF;");
  for (const table of tables) {
    sqlite.exec(`DELETE FROM ${table};`);
  }
  sqlite.exec("PRAGMA foreign_keys = ON;");
}

export async function seedDatabase(options?: { force?: boolean }) {
  const db = getDb();

  if (useRemoteDb()) {
    const row = await (db as any).select({ c: count() }).from(users).get();
    if (row && row.c > 0 && !options?.force) {
      return { seeded: false, reason: "already-seeded" as const };
    }
  } else {
    const sqlite = getSqlite();
    if (!options?.force) {
      const existing = sqlite.prepare("SELECT COUNT(*) as c FROM users").get() as {
        c: number;
      };
      if (existing.c > 0) {
        return { seeded: false, reason: "already-seeded" as const };
      }
    } else {
      clearAllTables();
    }
  }

  const createdAt = daysAgo(200);

  db.insert(users)
    .values([
      {
        id: INVESTOR_ID,
        name: "Alex Rivera",
        avatarUrl: null,
        activeRole: "INVESTOR",
        vibeBalance: 50000,
        bio: "Demo tubarão investor allocating simulated VIBE across agentic builders.",
        createdAt,
      },
      {
        id: FOUNDER_ID,
        name: "Maya Chen",
        avatarUrl: null,
        activeRole: "FOUNDER",
        vibeBalance: 5000,
        bio: "Founder of CollabMesh and demo operator for stakeholder transparency.",
        createdAt,
      },
    ])
    .run();

  const detailedRows = DETAILED_PROJECTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    description: p.description,
    category: p.category,
    stage: p.stage,
    status: "ACTIVE" as const,
    logoEmoji: p.logoEmoji,
    accentColor: p.accentColor,
    secondaryColor: p.accentColor === "#2563eb" ? "#22d3ee" : "#a78bfa",
    repositoryUrl: p.repositoryUrl,
    websiteUrl: p.websiteUrl,
    socialLinks: JSON.stringify({
      website: p.websiteUrl,
      repository: p.repositoryUrl,
      telegram: `https://t.me/${p.slug}`,
      x: `https://x.com/${p.slug}`,
      discord: `https://discord.gg/${p.slug}`,
      docs: `https://${p.slug}.demo/docs`,
    }),
    brandPattern: "nodes",
    founderId: FOUNDER_ID,
    visibility: "PUBLIC" as const,
    techStack: JSON.stringify(p.techStack),
    metrics: JSON.stringify(p.metrics),
    risks: JSON.stringify(p.risks),
    history: JSON.stringify(p.history),
    tokenSymbol: p.tokenSymbol,
    tokenName: p.tokenName,
    detailed: true,
    trendingScore: p.trendingScore,
    createdAt: daysAgo(160),
  }));

  const summaryRows = SUMMARY_PROJECTS.map((p, i) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    description: `${p.shortDescription} This project is listed in discovery at platform scale. Full diligence deepens as the project grows on VibeFunding.`,
    category: p.category,
    stage: p.stage,
    status: "ACTIVE" as const,
    logoEmoji: p.logoEmoji,
    accentColor: p.accentColor,
    secondaryColor: "#22d3ee",
    repositoryUrl: `https://github.com/demo/${p.slug}`,
    websiteUrl: `https://${p.slug}.demo`,
    socialLinks: JSON.stringify({
      website: `https://${p.slug}.demo`,
      repository: `https://github.com/demo/${p.slug}`,
    }),
    brandPattern: "flow",
    founderId: FOUNDER_ID,
    visibility: "PUBLIC" as const,
    techStack: JSON.stringify(["TypeScript", "Python", "Open models"]),
    metrics: JSON.stringify({
      users: 100 + i * 80,
      mrr: 1000 + i * 900,
      commits: 120 + i * 40,
      tests: 40 + i * 12,
      uptime: 98 + (i % 2) * 0.5,
    }),
    risks: JSON.stringify([
      "Early-stage execution risk",
      "Competitive category dynamics",
      "Resource concentration risk",
    ]),
    history: JSON.stringify([
      {
        date: daysAgo(90 - i),
        title: "Public listing",
        detail: "Project published to VibeFunding discovery.",
      },
    ]),
    tokenSymbol: p.tokenSymbol,
    tokenName: `${p.name} Token`,
    detailed: false,
    trendingScore: p.trendingScore,
    createdAt: daysAgo(120 - i * 3),
  }));

  db.insert(projects).values([...detailedRows, ...summaryRows]).run();

  // Build rounds for detailed projects
  const rounds = [
    {
      id: "round-collabmesh-presence",
      projectId: "proj-collabmesh",
      title: "Multiplayer Presence Engine",
      objective:
        "Ship conflict-aware multiplayer presence so humans and coding agents can co-edit with verifiable contribution trails.",
      status: "BUILDING" as const,
      targetValue: 25000,
      fundedValue: 17200,
      startsAt: daysAgo(21),
      endsAt: daysFromNow(25),
      expectedDeliverables: [
        "Presence protocol v2 with agent identities",
        "CRDT conflict suite with 20+ scenarios",
        "Investor-facing contribution proofs",
        "Stakeholder progress dashboard",
      ],
      risks: [
        "Concurrency edge cases under 50+ agents",
        "Latency regressions on large rooms",
      ],
      publicSummary:
        "Fund parallel agent collaboration without sacrificing auditability.",
      createdAt: daysAgo(21),
    },
    {
      id: "round-collabmesh-prev",
      projectId: "proj-collabmesh",
      title: "Agent Presence API",
      objective: "Expose agents as first-class collaborators in shared rooms.",
      status: "COMPLETED" as const,
      targetValue: 12000,
      fundedValue: 12000,
      startsAt: daysAgo(90),
      endsAt: daysAgo(50),
      expectedDeliverables: [
        "Agent identity schema",
        "Presence heartbeat service",
        "Public SDK methods",
      ],
      risks: ["SDK adoption lag"],
      publicSummary: "Completed previous round establishing agent presence.",
      createdAt: daysAgo(90),
    },
    {
      id: "round-inferlane-batch",
      projectId: "proj-inferlane",
      title: "AMD Batch Routing",
      objective:
        "Add GPU-aware batching and transparent cost attribution for open-weight coding routes.",
      status: "OPEN" as const,
      targetValue: 18000,
      fundedValue: 6400,
      startsAt: daysAgo(10),
      endsAt: daysFromNow(35),
      expectedDeliverables: [
        "ROCm batch worker pool",
        "Cost attribution ledger",
        "Fireworks-compatible adapter",
      ],
      risks: ["Provider API drift", "Eval quality variance"],
      publicSummary: "Reduce inference cost while keeping coding quality SLOs.",
      createdAt: daysAgo(10),
    },
    {
      id: "round-auditforge-packs",
      projectId: "proj-auditforge",
      title: "Policy Pack Expansion",
      objective: "Ship deeper static analysis packs and stakeholder risk digests.",
      status: "OPEN" as const,
      targetValue: 10000,
      fundedValue: 3100,
      startsAt: daysAgo(7),
      endsAt: daysFromNow(40),
      expectedDeliverables: [
        "Three new policy packs",
        "Gemma stakeholder risk summary",
        "False-positive feedback loop",
      ],
      risks: ["Alert fatigue", "Coverage gaps"],
      publicSummary: "Make agent PR security review trustworthy at scale.",
      createdAt: daysAgo(7),
    },
  ];

  // Lightweight rounds for summary projects
  const summaryRounds = SUMMARY_PROJECTS.map((p, i) => ({
    id: `round-${p.slug}-open`,
    projectId: p.id,
    title: `${p.name} Build Sprint`,
    objective: `Advance ${p.name} toward the next verifiable delivery milestone.`,
    status: (i % 3 === 0 ? "BUILDING" : "OPEN") as "OPEN" | "BUILDING",
    targetValue: 5000 + i * 800,
    fundedValue: 1200 + i * 350,
    startsAt: daysAgo(14 - (i % 5)),
    endsAt: daysFromNow(20 + i),
    expectedDeliverables: ["Core milestone delivery", "Tests + Proof of Build"],
    risks: ["Execution risk", "Resource timing"],
    publicSummary: p.shortDescription,
    createdAt: daysAgo(14 - (i % 5)),
  }));

  db.insert(buildRounds)
    .values(
      [...rounds, ...summaryRounds].map((r) => ({
        ...r,
        expectedDeliverables: JSON.stringify(r.expectedDeliverables),
        risks: JSON.stringify(r.risks),
      }))
    )
    .run();

  // MVP: investors fund with VIBE only; AMD GPU Hours track converted compute.
  // Demo rate: 1,000 VIBE = 1 AMD GPU Hour.
  const resources = [
    {
      id: "res-cm-vibe",
      buildRoundId: "round-collabmesh-presence",
      type: "VIBE" as const,
      targetAmount: 15000,
      fundedAmount: 10200,
      unit: "VIBE",
      label: "VIBE (→ AMD GPU credits)",
    },
    {
      id: "res-cm-gpu",
      buildRoundId: "round-collabmesh-presence",
      type: "AMD_GPU_HOURS" as const,
      targetAmount: 15,
      fundedAmount: 10.2,
      unit: "hours",
      label: "AMD GPU Hours (from VIBE)",
    },
    {
      id: "res-il-vibe",
      buildRoundId: "round-inferlane-batch",
      type: "VIBE" as const,
      targetAmount: 10000,
      fundedAmount: 4000,
      unit: "VIBE",
      label: "VIBE (→ AMD GPU credits)",
    },
    {
      id: "res-il-gpu",
      buildRoundId: "round-inferlane-batch",
      type: "AMD_GPU_HOURS" as const,
      targetAmount: 10,
      fundedAmount: 4,
      unit: "hours",
      label: "AMD GPU Hours (from VIBE)",
    },
    {
      id: "res-af-vibe",
      buildRoundId: "round-auditforge-packs",
      type: "VIBE" as const,
      targetAmount: 7000,
      fundedAmount: 2100,
      unit: "VIBE",
      label: "VIBE (→ AMD GPU credits)",
    },
    {
      id: "res-af-gpu",
      buildRoundId: "round-auditforge-packs",
      type: "AMD_GPU_HOURS" as const,
      targetAmount: 7,
      fundedAmount: 2.1,
      unit: "hours",
      label: "AMD GPU Hours (from VIBE)",
    },
  ];

  for (const r of summaryRounds) {
    resources.push({
      id: `res-${r.id}-vibe`,
      buildRoundId: r.id,
      type: "VIBE",
      targetAmount: r.targetValue,
      fundedAmount: r.fundedValue,
      unit: "VIBE",
      label: "VIBE (→ AMD GPU credits)",
    });
    resources.push({
      id: `res-${r.id}-gpu`,
      buildRoundId: r.id,
      type: "AMD_GPU_HOURS" as const,
      targetAmount: Math.round((r.targetValue / 1000) * 100) / 100,
      fundedAmount: Math.round((r.fundedValue / 1000) * 100) / 100,
      unit: "hours",
      label: "AMD GPU Hours (from VIBE)",
    });
  }

  db.insert(resourceRequirements).values(resources).run();

  const returns = [
    {
      id: "ret-cm-token",
      buildRoundId: "round-collabmesh-presence",
      type: "PROJECT_TOKEN" as const,
      title: "MESH Project Tokens",
      description:
        "MESH tokens representing exposure to CollabMesh value creation under this round's terms.",
      simulated: true,
      terms: "1,000 VIBE → 1,000 BU → 800 MESH",
    },
    {
      id: "ret-cm-nft",
      buildRoundId: "round-collabmesh-presence",
      type: "NFT" as const,
      title: "Builder Presence NFT",
      description:
        "NFT granting product-access perks and early feature previews.",
      simulated: true,
      terms: "Unlocked at ≥ 2,000 Build Units (liquid)",
    },
    {
      id: "ret-cm-access",
      buildRoundId: "round-collabmesh-presence",
      type: "PRODUCT_ACCESS" as const,
      title: "Design partner access",
      description: "Priority access to multiplayer beta environments.",
      simulated: true,
      terms: null,
    },
    {
      id: "ret-il-token",
      buildRoundId: "round-inferlane-batch",
      type: "PROJECT_TOKEN" as const,
      title: "LANE Project Tokens",
      description: "LANE exposure for compute providers and capital allocators.",
      simulated: true,
      terms: "1 BU → 1.1 LANE",
    },
    {
      id: "ret-af-token",
      buildRoundId: "round-auditforge-packs",
      type: "PROJECT_TOKEN" as const,
      title: "AFG Project Tokens",
      description: "AFG tokens for security-focused contributors.",
      simulated: true,
      terms: "1 BU → 1.0 AFG",
    },
  ];

  for (const r of summaryRounds) {
    returns.push({
      id: `ret-${r.id}-token`,
      buildRoundId: r.id,
      type: "PROJECT_TOKEN",
      title: "Project Tokens",
      description: "Project token exposure for this build sprint.",
      simulated: true,
      terms: "Conversion via Build Units on allocation",
    });
  }

  db.insert(returnMechanisms).values(returns).run();

  const nftRows = [
    {
      id: "nft-cm-presence",
      projectId: "proj-collabmesh",
      name: "Builder Presence Pass",
      description:
        "NFT for early multiplayer access, stakeholder briefings, and contributor badge.",
      imageEmoji: "◈",
      rarity: "Rare",
      utility: JSON.stringify([
        "Early multiplayer beta access",
        "Monthly founder AMA",
        "Priority allocation window",
      ]),
      simulated: true,
    },
    {
      id: "nft-il-router",
      projectId: "proj-inferlane",
      name: "Route Operator Badge",
      description: "Badge recognizing compute contribution to InferLane routes.",
      imageEmoji: "▣",
      rarity: "Uncommon",
      utility: JSON.stringify(["Dashboard skin", "Operator leaderboard"]),
      simulated: true,
    },
  ];

  db.insert(nfts).values(nftRows).run();

  // Seed holdings for investor
  db.insert(holdings)
    .values([
      {
        id: "hold-vibe-cash",
        investorId: INVESTOR_ID,
        projectId: null,
        assetType: "VIBE",
        assetSymbol: "VIBE",
        assetName: "VIBE Balance",
        amount: 50000,
        simulatedValue: 50000,
        metadata: JSON.stringify({ note: "Wallet balance" }),
        createdAt: daysAgo(100),
        updatedAt: nowIso(),
      },
      {
        id: "hold-mesh-seed",
        investorId: INVESTOR_ID,
        projectId: "proj-collabmesh",
        assetType: "PROJECT_TOKEN",
        assetSymbol: "MESH",
        assetName: "CollabMesh Token",
        amount: 3200,
        simulatedValue: 4160,
        metadata: JSON.stringify({ source: "Prior Build Round" }),
        createdAt: daysAgo(55),
        updatedAt: daysAgo(55),
      },
      {
        id: "hold-nft-cm",
        investorId: INVESTOR_ID,
        projectId: "proj-collabmesh",
        assetType: "NFT",
        assetSymbol: "MESH-NFT",
        assetName: "Builder Presence Pass",
        amount: 1,
        simulatedValue: 500,
        metadata: JSON.stringify({ nftId: "nft-cm-presence" }),
        createdAt: daysAgo(55),
        updatedAt: daysAgo(55),
      },
    ])
    .run();

  db.insert(allocations)
    .values([
      {
        id: "alloc-seed-cm",
        investorId: INVESTOR_ID,
        buildRoundId: "round-collabmesh-prev",
        projectId: "proj-collabmesh",
        resourceType: "VIBE",
        amount: 4000,
        normalizedValue: 4000,
        buildUnits: 4000,
        rewardTokens: 3200,
        rewardNftId: "nft-cm-presence",
        settlementStatus: "IMMEDIATE",
        verifiedAt: daysAgo(55),
        createdAt: daysAgo(55),
      },
    ])
    .run();

  // Agent runs
  const runCm = {
    id: "run-collabmesh-presence-1",
    projectId: "proj-collabmesh",
    buildRoundId: "round-collabmesh-presence",
    taskTitle: "Implement multi-agent presence heartbeats",
    taskDescription:
      "Add resilient presence heartbeats and conflict-safe room membership for concurrent coding agents.",
    agentName: "Forge-1",
    harness: "OpenCode",
    model: "DeepSeek-V3",
    provider: "Fireworks / open-weight",
    status: "COMPLETED" as const,
    startedAt: daysAgo(3),
    completedAt: daysAgo(3),
    publicSummary:
      "Shipped presence heartbeats, conflict suite coverage, and sanitized commit evidence.",
    visibility: "PUBLIC" as const,
    computeSource: "AMD Developer Cloud · Instinct GPU",
    inputTokens: 84200,
    outputTokens: 19600,
    computeTimeSeconds: 742,
    filesChanged: 7,
    linesAdded: 412,
    linesRemoved: 88,
    testsTotal: 24,
    testsPassed: 24,
    testsFailed: 0,
    commitHash: "a3f8c91d2e7b4f0a91cd",
    replayLabel: "Recorded real run",
    createdAt: daysAgo(3),
  };

  const runIl = {
    id: "run-inferlane-batch-1",
    projectId: "proj-inferlane",
    buildRoundId: "round-inferlane-batch",
    taskTitle: "Prototype ROCm batch worker",
    taskDescription: "Scaffold AMD ROCm batch worker with cost attribution hooks.",
    agentName: "LaneBot",
    harness: "Codex CLI",
    model: "GLM-4",
    provider: "Fireworks / open-weight",
    status: "COMPLETED" as const,
    startedAt: daysAgo(5),
    completedAt: daysAgo(5),
    publicSummary: "Batch worker scaffold complete with attribution stubs.",
    visibility: "PUBLIC" as const,
    computeSource: "AMD Developer Cloud",
    inputTokens: 42100,
    outputTokens: 11200,
    computeTimeSeconds: 510,
    filesChanged: 4,
    linesAdded: 260,
    linesRemoved: 31,
    testsTotal: 12,
    testsPassed: 12,
    testsFailed: 0,
    commitHash: "b19e44aa81cd02ff",
    replayLabel: "Demo replay",
    createdAt: daysAgo(5),
  };

  db.insert(agentRuns).values([runCm, runIl]).run();

  const cmEvents = buildAgentEvents(runCm.id, "CollabMesh");
  const ilEvents = buildAgentEvents(runIl.id, "InferLane").map((e, i) => ({
    ...e,
    id: `${runIl.id}-evt-${i + 1}`,
    runId: runIl.id,
  }));
  db.insert(agentEvents).values([...cmEvents, ...ilEvents]).run();

  const cmArtifacts = [
    {
      name: "presence-diff.patch",
      type: "DIFF" as const,
      hash: sha256("presence-diff-content-v1"),
      size: 18420,
      contentPreview:
        "+++ packages/presence/heartbeat.ts\n+ export function startHeartbeat(roomId: string) { ... }",
    },
    {
      name: "test-report.json",
      type: "TEST_REPORT" as const,
      hash: sha256("test-report-24-pass"),
      size: 3200,
      contentPreview: '{"total":24,"passed":24,"failed":0}',
    },
    {
      name: "commit.txt",
      type: "COMMIT" as const,
      hash: sha256(runCm.commitHash),
      size: 220,
      contentPreview: `commit ${runCm.commitHash}\nImplement multi-agent presence heartbeats`,
    },
    {
      name: "build.log",
      type: "LOG" as const,
      hash: sha256("build-log-sanitized"),
      size: 5400,
      contentPreview: "build ok · 742s · secrets redacted",
    },
  ];

  const proofCmMeta = buildProofManifest({
    projectId: runCm.projectId,
    buildRoundId: runCm.buildRoundId!,
    agentRunId: runCm.id,
    taskTitle: runCm.taskTitle,
    agentName: runCm.agentName,
    harness: runCm.harness,
    model: runCm.model,
    provider: runCm.provider,
    computeSource: runCm.computeSource,
    filesChanged: runCm.filesChanged,
    linesAdded: runCm.linesAdded,
    linesRemoved: runCm.linesRemoved,
    testsTotal: runCm.testsTotal,
    testsPassed: runCm.testsPassed,
    testsFailed: runCm.testsFailed,
    commitHash: runCm.commitHash,
    artifacts: cmArtifacts,
  });

  const proofCmId = "proof-collabmesh-1";
  db.insert(proofsOfBuild)
    .values({
      id: proofCmId,
      projectId: runCm.projectId,
      buildRoundId: runCm.buildRoundId,
      agentRunId: runCm.id,
      taskTitle: runCm.taskTitle,
      taskDescription: runCm.taskDescription,
      agentName: runCm.agentName,
      harness: runCm.harness,
      model: runCm.model,
      provider: runCm.provider,
      computeSource: runCm.computeSource,
      inputTokens: runCm.inputTokens,
      outputTokens: runCm.outputTokens,
      computeTimeSeconds: runCm.computeTimeSeconds,
      normalizedCost: 42.5,
      filesChanged: runCm.filesChanged,
      linesAdded: runCm.linesAdded,
      linesRemoved: runCm.linesRemoved,
      testsTotal: runCm.testsTotal,
      testsPassed: runCm.testsPassed,
      testsFailed: runCm.testsFailed,
      commitHash: runCm.commitHash,
      repositoryUrl: "https://github.com/demo/collabmesh",
      artifactRootHash: proofCmMeta.artifactRootHash,
      manifestHash: proofCmMeta.manifestHash,
      manifestJson: proofCmMeta.manifestJson,
      verificationStatus: "HASH_VERIFIED",
      publicSummary:
        "Recorded agent execution delivered presence heartbeats with full test pass and commit evidence. This proves work occurred with the captured resources — it does not guarantee production quality.",
      gemmaSummary:
        "In plain language: the coding agent finished the multiplayer heartbeat feature, all automated tests passed, and a commit was recorded. Investors can verify the artifact hashes. Human review is still recommended before treating this as product-ready.",
      createdAt: daysAgo(3),
    })
    .run();

  db.insert(proofArtifacts)
    .values(
      cmArtifacts.map((a, i) => ({
        id: `art-cm-${i + 1}`,
        proofId: proofCmId,
        type: a.type,
        name: a.name,
        path: `/data/proofs/${proofCmId}/${a.name}`,
        hash: a.hash,
        size: a.size,
        visibility: "PUBLIC" as const,
        contentPreview: a.contentPreview,
      }))
    )
    .run();

  const ilArtifacts = [
    {
      name: "batch-worker.diff",
      type: "DIFF" as const,
      hash: sha256("il-diff-v1"),
      size: 9200,
      contentPreview: "+++ workers/rocm_batch.py",
    },
    {
      name: "tests.json",
      type: "TEST_REPORT" as const,
      hash: sha256("il-tests-12"),
      size: 1800,
      contentPreview: '{"total":12,"passed":12}',
    },
  ];
  const proofIlMeta = buildProofManifest({
    projectId: runIl.projectId,
    buildRoundId: runIl.buildRoundId!,
    agentRunId: runIl.id,
    taskTitle: runIl.taskTitle,
    agentName: runIl.agentName,
    harness: runIl.harness,
    model: runIl.model,
    provider: runIl.provider,
    computeSource: runIl.computeSource,
    filesChanged: runIl.filesChanged,
    linesAdded: runIl.linesAdded,
    linesRemoved: runIl.linesRemoved,
    testsTotal: runIl.testsTotal,
    testsPassed: runIl.testsPassed,
    testsFailed: runIl.testsFailed,
    commitHash: runIl.commitHash,
    artifacts: ilArtifacts,
  });

  const proofIlId = "proof-inferlane-1";
  db.insert(proofsOfBuild)
    .values({
      id: proofIlId,
      projectId: runIl.projectId,
      buildRoundId: runIl.buildRoundId,
      agentRunId: runIl.id,
      taskTitle: runIl.taskTitle,
      taskDescription: runIl.taskDescription,
      agentName: runIl.agentName,
      harness: runIl.harness,
      model: runIl.model,
      provider: runIl.provider,
      computeSource: runIl.computeSource,
      inputTokens: runIl.inputTokens,
      outputTokens: runIl.outputTokens,
      computeTimeSeconds: runIl.computeTimeSeconds,
      normalizedCost: 21.0,
      filesChanged: runIl.filesChanged,
      linesAdded: runIl.linesAdded,
      linesRemoved: runIl.linesRemoved,
      testsTotal: runIl.testsTotal,
      testsPassed: runIl.testsPassed,
      testsFailed: runIl.testsFailed,
      commitHash: runIl.commitHash,
      repositoryUrl: "https://github.com/demo/inferlane",
      artifactRootHash: proofIlMeta.artifactRootHash,
      manifestHash: proofIlMeta.manifestHash,
      manifestJson: proofIlMeta.manifestJson,
      verificationStatus: "HASH_VERIFIED",
      publicSummary:
        "ROCm batch worker scaffold recorded with tests passing. Evidence of execution only — not a quality warranty.",
      gemmaSummary:
        "InferLane's agent scaffolded an AMD batch worker and passed its automated checks. This is progress evidence for the open Build Round.",
      createdAt: daysAgo(5),
    })
    .run();

  db.insert(proofArtifacts)
    .values(
      ilArtifacts.map((a, i) => ({
        id: `art-il-${i + 1}`,
        proofId: proofIlId,
        type: a.type,
        name: a.name,
        path: `/data/proofs/${proofIlId}/${a.name}`,
        hash: a.hash,
        size: a.size,
        visibility: "PUBLIC" as const,
        contentPreview: a.contentPreview,
      }))
    )
    .run();

  db.insert(stakeholderUpdates)
    .values([
      {
        id: "update-cm-1",
        projectId: "proj-collabmesh",
        buildRoundId: "round-collabmesh-presence",
        title: "Presence engine mid-round update",
        body: `We completed the multi-agent presence heartbeat milestone.

**What shipped**
- Heartbeat protocol for concurrent agents
- 24/24 tests passing
- Proof of Build published for investor review

**What's next**
- Conflict suite expansion
- Stakeholder dashboard polish

*Update published for investors.*`,
        status: "PUBLISHED",
        authorId: FOUNDER_ID,
        publishedAt: daysAgo(2),
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        id: "update-cm-draft",
        projectId: "proj-collabmesh",
        buildRoundId: "round-collabmesh-presence",
        title: "Draft: next sprint transparency note",
        body: "Draft prepared for founder review before investor publication.",
        status: "DRAFT",
        authorId: FOUNDER_ID,
        publishedAt: null,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
    ])
    .run();

  db.insert(gemmaInsights)
    .values([
      {
        id: "insight-portfolio-brief",
        context: "INVESTOR_PORTFOLIO",
        projectId: null,
        title: "Portfolio briefing",
        summary:
          "Your portfolio is concentrated in Developer Tools and AI Infrastructure. CollabMesh shows active agent delivery with a verified Proof of Build. InferLane remains early in its open round — additional VIBE or GPU hours would deepen exposure while diversifying compute risk.",
        risks: JSON.stringify([
          "Category concentration in developer tooling",
          "Open rounds still need funding to complete deliverables",
        ]),
        strengths: JSON.stringify([
          "Evidence of execution via Proofs of Build",
          "Mix of Project Tokens and NFT utility",
        ]),
        questions: JSON.stringify([
          "Do you want more GPU-hour exposure vs pure VIBE?",
          "Should we diversify into Security (AuditForge)?",
        ]),
        portfolioImpact:
          "Allocating into AuditForge would reduce single-category concentration.",
        sources: JSON.stringify(["holdings", "proofs", "build rounds"]),
        provider: "DEMO",
        generatedAt: nowIso(),
      },
      {
        id: "insight-cm-dd",
        context: "PROJECT_DILIGENCE",
        projectId: "proj-collabmesh",
        title: "CollabMesh due diligence",
        summary:
          "CollabMesh is past pure prototype stage: design partners, prior completed round, and a live BUILDING round with agent activity. Main risk is concurrency under heavy agent load. Returns via MESH tokens and Presence NFT follow Build Unit conversion.",
        risks: JSON.stringify([
          "CRDT concurrency edge cases",
          "Infra cost growth with multiplayer usage",
        ]),
        strengths: JSON.stringify([
          "Prior completed Build Round",
          "Recent HASH_VERIFIED Proof of Build",
          "Clear deliverables and resource mix",
        ]),
        questions: JSON.stringify([
          "What is the human review process after agent commits?",
          "How are agent contributions attributed for token rewards?",
        ]),
        portfolioImpact:
          "Additional allocation increases Developer Tools concentration.",
        sources: JSON.stringify(["project", "rounds", "proofs", "agent runs"]),
        provider: "CACHE",
        generatedAt: nowIso(),
      },
    ])
    .run();

  db.insert(demoState)
    .values({
      id: "default",
      activeRole: "INVESTOR",
      activeUserId: INVESTOR_ID,
      updatedAt: nowIso(),
    })
    .run();

  // Community feed — every project starts with team + community activity
  const { posts: communityPostRows, comments: communityCommentRows } =
    buildCommunitySeed();
  db.insert(communityPosts).values(communityPostRows).run();
  db.insert(communityComments).values(communityCommentRows).run();

  return { seeded: true as const };
}

type SeedAuthorRole =
  | "FOUNDER"
  | "TEAM"
  | "INVESTOR"
  | "COMPUTE_PROVIDER"
  | "TOKEN_HOLDER";

function buildCommunitySeed() {
  type Post = {
    id: string;
    projectId: string;
    authorName: string;
    authorRole: SeedAuthorRole;
    body: string;
    buildRoundId: string | null;
    proofId: string | null;
    agentRunId: string | null;
    likes: number;
    dislikes: number;
    createdAt: string;
  };
  type Comment = {
    id: string;
    postId: string;
    authorName: string;
    authorRole: SeedAuthorRole;
    body: string;
    createdAt: string;
  };

  const posts: Post[] = [];
  const comments: Comment[] = [];

  const detailedExtras: Record<
    string,
    {
      founder: string;
      team: string;
      roundId: string;
      proofId?: string;
      runId?: string;
      symbol: string;
      teamUpdate: string;
      founderUpdate: string;
    }
  > = {
    "proj-collabmesh": {
      founder: "Maya Chen",
      team: "Priya Nair",
      roundId: "round-collabmesh-presence",
      proofId: "proof-collabmesh-1",
      runId: "run-collabmesh-presence-1",
      symbol: "MESH",
      teamUpdate:
        "Conflict-suite agents finished a green run overnight. Diff review is open for anyone who wants to walk the replay.",
      founderUpdate:
        "Presence heartbeats shipped with full tests. Proof of Build is live for MESH holders — feedback welcome on the multi-agent room UX.",
    },
    "proj-inferlane": {
      founder: "Sam Okonkwo",
      team: "Lina Park",
      roundId: "round-inferlane-batch",
      proofId: "proof-inferlane-1",
      runId: "run-inferlane-batch-1",
      symbol: "LANE",
      teamUpdate:
        "ROCm batch worker scaffold is in. Routing evals improved p95 latency on the open-weight path.",
      founderUpdate:
        "Thanks to supporters funding AMD GPU Cloud Credits with VIBE — batch workers are next on the critical path.",
    },
    "proj-auditforge": {
      founder: "Elena Voss",
      team: "Chris Delgado",
      roundId: "round-auditforge-packs",
      symbol: "AFG",
      teamUpdate:
        "New policy packs for secret scanning are staged. Security reviewers welcome in the thread.",
      founderUpdate:
        "Build Round is open for VIBE contributions. Every contribution funds AMD GPU time for agent PR review.",
    },
  };

  // Hero / detailed projects — richer threads
  for (const p of DETAILED_PROJECTS) {
    const extra = detailedExtras[p.id];
    if (!extra) continue;
    const slug = p.slug;

    const founderPostId = `cpost-${slug}-founder`;
    const teamPostId = `cpost-${slug}-team`;
    const investorPostId = `cpost-${slug}-investor`;
    const holderPostId = `cpost-${slug}-holder`;

    posts.push(
      {
        id: founderPostId,
        projectId: p.id,
        authorName: extra.founder,
        authorRole: "FOUNDER",
        body: extra.founderUpdate,
        buildRoundId: extra.roundId,
        proofId: extra.proofId ?? null,
        agentRunId: extra.runId ?? null,
        likes: 10 + Math.floor(p.trendingScore / 20),
        dislikes: 0,
        createdAt: daysAgo(3),
      },
      {
        id: teamPostId,
        projectId: p.id,
        authorName: extra.team,
        authorRole: "TEAM",
        body: extra.teamUpdate,
        buildRoundId: extra.roundId,
        proofId: null,
        agentRunId: extra.runId ?? null,
        likes: 6,
        dislikes: 0,
        createdAt: daysAgo(2),
      },
      {
        id: investorPostId,
        projectId: p.id,
        authorName: "Alex Rivera",
        authorRole: "INVESTOR",
        body: `Invested VIBE into the current Build Round (demo rate: 1,000 VIBE = 1 AMD GPU Hour). Watching how ${p.name} turns compute into verified work.`,
        buildRoundId: extra.roundId,
        proofId: null,
        agentRunId: null,
        likes: 5,
        dislikes: 0,
        createdAt: daysAgo(1),
      },
      {
        id: holderPostId,
        projectId: p.id,
        authorName: "Jordan Lee",
        authorRole: "TOKEN_HOLDER",
        body: `Holding ${extra.symbol} — the Proof of Build trail makes it easier to stay close to what shipped.`,
        buildRoundId: extra.roundId,
        proofId: extra.proofId ?? null,
        agentRunId: null,
        likes: 4,
        dislikes: 0,
        createdAt: daysAgo(1),
      }
    );

    comments.push(
      {
        id: `ccom-${slug}-1`,
        postId: founderPostId,
        authorName: "Jordan Lee",
        authorRole: "TOKEN_HOLDER",
        body: `Love the transparency — ${extra.symbol} holders get a real signal, not just a newsletter.`,
        createdAt: daysAgo(2),
      },
      {
        id: `ccom-${slug}-2`,
        postId: teamPostId,
        authorName: extra.founder,
        authorRole: "FOUNDER",
        body: "Team is on it — drop questions here and we will answer after the next agent pass.",
        createdAt: daysAgo(2),
      },
      {
        id: `ccom-${slug}-3`,
        postId: investorPostId,
        authorName: extra.team,
        authorRole: "TEAM",
        body: "Appreciate the support. Agent replay is open if you want to see the compute land on tasks.",
        createdAt: daysAgo(1),
      }
    );
  }

  // Catalog / summary projects — still a living community feed
  const teamLeads = [
    "Riley Cho",
    "Amara Singh",
    "Theo Brandt",
    "Noa Klein",
    "Ivy Morales",
    "Kenji Sato",
    "Sofia Alves",
    "Omar Haddad",
    "Nina Volkov",
  ];
  const communityNames = [
    "Casey Brooks",
    "Drew Patel",
    "Morgan Ellis",
    "Samir Khan",
    "Harper Quinn",
  ];

  SUMMARY_PROJECTS.forEach((p, i) => {
    const roundId = `round-${p.slug}-open`;
    const founderName = teamLeads[i % teamLeads.length];
    const teamName = teamLeads[(i + 3) % teamLeads.length];
    const communityName = communityNames[i % communityNames.length];
    const founderPostId = `cpost-${p.slug}-founder`;
    const teamPostId = `cpost-${p.slug}-team`;
    const communityPostId = `cpost-${p.slug}-community`;

    posts.push(
      {
        id: founderPostId,
        projectId: p.id,
        authorName: founderName,
        authorRole: "FOUNDER",
        body: `Welcome to the ${p.name} community. We are shipping ${p.shortDescription.toLowerCase()} — this thread is for Build Round updates, agent progress, and Proof of Build notes.`,
        buildRoundId: roundId,
        proofId: null,
        agentRunId: null,
        likes: 3 + (i % 5),
        dislikes: 0,
        createdAt: daysAgo(5 + (i % 3)),
      },
      {
        id: teamPostId,
        projectId: p.id,
        authorName: teamName,
        authorRole: "TEAM",
        body: `Team update: the active Build Round is open for VIBE. Contributions allocate AMD GPU Cloud Credits so agents can keep moving on ${p.category.toLowerCase()} work.`,
        buildRoundId: roundId,
        proofId: null,
        agentRunId: null,
        likes: 2 + (i % 4),
        dislikes: 0,
        createdAt: daysAgo(3 + (i % 2)),
      },
      {
        id: communityPostId,
        projectId: p.id,
        authorName: communityName,
        authorRole: i % 2 === 0 ? "INVESTOR" : "TOKEN_HOLDER",
        body:
          i % 2 === 0
            ? `Following ${p.name} closely. The VIBE → AMD GPU path makes it obvious how support becomes compute.`
            : `Glad ${p.tokenSymbol} holders get a community space tied to real Build Round progress.`,
        buildRoundId: roundId,
        proofId: null,
        agentRunId: null,
        likes: 1 + (i % 3),
        dislikes: 0,
        createdAt: daysAgo(1 + (i % 2)),
      }
    );

    comments.push(
      {
        id: `ccom-${p.slug}-1`,
        postId: founderPostId,
        authorName: communityName,
        authorRole: "INVESTOR",
        body: "Excited to be here — looking forward to the next verified milestone.",
        createdAt: daysAgo(4),
      },
      {
        id: `ccom-${p.slug}-2`,
        postId: teamPostId,
        authorName: founderName,
        authorRole: "FOUNDER",
        body: "We will post Proof of Build links here as soon as the next agent run seals.",
        createdAt: daysAgo(2),
      }
    );
  });

  return { posts, comments };
}

export async function resetDemo() {
  return seedDatabase({ force: true });
}
