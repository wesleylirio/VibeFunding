import { createHash } from "crypto";

export const INVESTOR_ID = "user-investor-demo";
export const FOUNDER_ID = "user-founder-demo";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function daysAgo(days: number): string {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const DETAILED_PROJECTS = [
  {
    id: "proj-collabmesh",
    slug: "collabmesh",
    name: "CollabMesh",
    shortDescription:
      "Real-time multiplayer collaboration layer for agentic developer tools.",
    description: `CollabMesh is a production-grade collaboration engine that lets multiple human developers and coding agents work in the same workspace with conflict-aware presence, shared task boards, and verifiable contribution history.

The product already serves design partners shipping multi-user IDE experiences. This Build Round funds the multiplayer presence engine, conflict resolution CRDT layer, and investor-facing contribution proofs so teams can scale parallel agent work without losing auditability.`,
    category: "Developer Tools",
    stage: "Growth",
    logoEmoji: "⬡",
    accentColor: "#2563eb",
    repositoryUrl: "https://github.com/demo/collabmesh",
    websiteUrl: "https://collabmesh.demo",
    techStack: ["TypeScript", "Rust", "CRDTs", "WebRTC", "AMD GPUs"],
    metrics: {
      users: 4200,
      mrr: 38000,
      commits: 1840,
      tests: 612,
      uptime: 99.4,
    },
    risks: [
      "Multiplayer CRDT edge cases under heavy agent concurrency",
      "Dependency on real-time infra cost as usage scales",
      "Competition from larger IDE platforms",
    ],
    history: [
      { date: daysAgo(180), title: "Private beta launched", detail: "12 design partners onboarded" },
      { date: daysAgo(120), title: "CRDT core v1", detail: "Shared document model stabilized" },
      { date: daysAgo(60), title: "Agent presence API", detail: "Agents appear as first-class collaborators" },
      { date: daysAgo(14), title: "Proof of Build pipeline", detail: "Contribution evidence exported for stakeholders" },
    ],
    tokenSymbol: "MESH",
    tokenName: "CollabMesh Token",
    detailed: true,
    trendingScore: 98,
  },
  {
    id: "proj-inferlane",
    slug: "inferlane",
    name: "InferLane",
    shortDescription:
      "Cost-aware routing for open-weight coding models across AMD and hybrid compute.",
    description: `InferLane is an inference control plane that routes coding workloads across open-weight models based on latency, cost, and quality signals. Teams already use it to reduce proprietary API spend while keeping quality SLOs.

This round finances GPU-aware batching, Fireworks-compatible adapters, and transparent cost attribution so investors can see compute convert into shipped features.`,
    category: "AI Infrastructure",
    stage: "Early Revenue",
    logoEmoji: " cons",
    accentColor: "#0d9488",
    repositoryUrl: "https://github.com/demo/inferlane",
    websiteUrl: "https://inferlane.demo",
    techStack: ["Python", "ROCm", "vLLM", "TypeScript", "Postgres"],
    metrics: {
      users: 860,
      mrr: 12500,
      commits: 940,
      tests: 288,
      uptime: 99.1,
    },
    risks: [
      "Model quality variance across open-weight families",
      "Rapid provider pricing changes",
      "Need for deeper evaluation harnesses",
    ],
    history: [
      { date: daysAgo(150), title: "Routing MVP", detail: "Latency + cost weighted router" },
      { date: daysAgo(90), title: "Open-weight adapters", detail: "DeepSeek and GLM routes live" },
      { date: daysAgo(30), title: "AMD batch workers", detail: "ROCm workers for nightly evals" },
    ],
    tokenSymbol: "LANE",
    tokenName: "InferLane Token",
    detailed: true,
    trendingScore: 91,
  },
  {
    id: "proj-auditforge",
    slug: "auditforge",
    name: "AuditForge",
    shortDescription:
      "Continuous security review for agent-generated pull requests.",
    description: `AuditForge reviews agent-authored PRs for secrets, insecure patterns, and policy violations before merge. Security teams use it as a gate in CI for agentic coding pipelines.

This Build Round funds deeper static analysis packs, human-in-the-loop escalation, and stakeholder-friendly risk summaries.`,
    category: "Security",
    stage: "MVP",
    logoEmoji: "▣",
    accentColor: "#b45309",
    repositoryUrl: "https://github.com/demo/auditforge",
    websiteUrl: "https://auditforge.demo",
    techStack: ["Go", "TypeScript", "Semgrep", "OpenSearch"],
    metrics: {
      users: 310,
      mrr: 4200,
      commits: 510,
      tests: 190,
      uptime: 98.7,
    },
    risks: [
      "False positives reducing developer trust",
      "Coverage gaps for novel agent patterns",
      "Need for enterprise SSO before larger deals",
    ],
    history: [
      { date: daysAgo(100), title: "CI gate beta", detail: "Secret + dependency scanners" },
      { date: daysAgo(45), title: "Policy packs", detail: "SOC2-oriented rulesets" },
      { date: daysAgo(10), title: "Gemma risk summaries", detail: "Non-technical stakeholder digests" },
    ],
    tokenSymbol: "AFG",
    tokenName: "AuditForge Token",
    detailed: true,
    trendingScore: 86,
  },
] as const;

export const SUMMARY_PROJECTS = [
  {
    id: "proj-vectoryard",
    slug: "vectoryard",
    name: "VectorYard",
    shortDescription: "Managed embedding warehouse for product teams.",
    category: "Data Platform",
    stage: "Growth",
    logoEmoji: "▦",
    accentColor: "#7c3aed",
    tokenSymbol: "VYRD",
    trendingScore: 72,
  },
  {
    id: "proj-promptledger",
    slug: "promptledger",
    name: "PromptLedger",
    shortDescription: "Versioned prompt and eval registry for agent fleets.",
    category: "Developer Tools",
    stage: "Early Revenue",
    logoEmoji: "▤",
    accentColor: "#db2777",
    tokenSymbol: "PLGR",
    trendingScore: 68,
  },
  {
    id: "proj-gpuharbor",
    slug: "gpuharbor",
    name: "GPU Harbor",
    shortDescription: "Scheduling marketplace for spare AMD GPU capacity.",
    category: "Compute",
    stage: "Prototype",
    logoEmoji: "◈",
    accentColor: "#0891b2",
    tokenSymbol: "HARB",
    trendingScore: 64,
  },
  {
    id: "proj-docpilot",
    slug: "docpilot",
    name: "DocPilot",
    shortDescription: "Agent that keeps product docs synchronized with code.",
    category: "Productivity",
    stage: "MVP",
    logoEmoji: "◉",
    accentColor: "#4f46e5",
    tokenSymbol: "DOCP",
    trendingScore: 61,
  },
  {
    id: "proj-fleetops",
    slug: "fleetops",
    name: "FleetOps",
    shortDescription: "Orchestration console for parallel coding agents.",
    category: "Developer Tools",
    stage: "Early Revenue",
    logoEmoji: "◎",
    accentColor: "#059669",
    tokenSymbol: "FOPS",
    trendingScore: 77,
  },
  {
    id: "proj-synthdata",
    slug: "synthdata",
    name: "SynthData Lab",
    shortDescription: "Privacy-preserving synthetic datasets for model eval.",
    category: "Data Platform",
    stage: "Prototype",
    logoEmoji: "◌",
    accentColor: "#ca8a04",
    tokenSymbol: "SDAT",
    trendingScore: 55,
  },
  {
    id: "proj-edgecraft",
    slug: "edgecraft",
    name: "EdgeCraft",
    shortDescription: "Edge packaging for open models on constrained devices.",
    category: "AI Infrastructure",
    stage: "MVP",
    logoEmoji: "◇",
    accentColor: "#dc2626",
    tokenSymbol: "EDGC",
    trendingScore: 58,
  },
  {
    id: "proj-reliakit",
    slug: "reliakit",
    name: "ReliaKit",
    shortDescription: "Chaos testing harness for agent workflows.",
    category: "Security",
    stage: "Early Revenue",
    logoEmoji: "⬡",
    accentColor: "#9333ea",
    tokenSymbol: "RLIA",
    trendingScore: 70,
  },
  {
    id: "proj-metricloom",
    slug: "metricloom",
    name: "MetricLoom",
    shortDescription: "Product analytics that attributes impact to agent runs.",
    category: "Analytics",
    stage: "Growth",
    logoEmoji: "◍",
    accentColor: "#0284c7",
    tokenSymbol: "LOOM",
    trendingScore: 74,
  },
] as const;

export function buildAgentEvents(runId: string, projectName: string) {
  const base = daysAgo(3);
  const events = [
    {
      type: "RUN_STARTED" as const,
      title: "Agent started",
      publicMessage: `${projectName} coding agent initialized on AMD compute.`,
      visibility: "PUBLIC" as const,
      delayMs: 400,
    },
    {
      type: "PLANNING" as const,
      title: "Analyzing task",
      publicMessage: "Breaking the deliverable into implementation steps.",
      visibility: "PUBLIC" as const,
      delayMs: 700,
    },
    {
      type: "READING_FILE" as const,
      title: "Reading project context",
      publicMessage: "Inspecting existing collaboration modules and tests.",
      visibility: "PUBLIC" as const,
      delayMs: 650,
    },
    {
      type: "TOOL_CALL" as const,
      title: "Inspecting repository graph",
      publicMessage: "Mapped dependency graph for presence and sync packages.",
      visibility: "INVESTORS" as const,
      delayMs: 550,
    },
    {
      type: "FILE_CHANGED" as const,
      title: "Editing files",
      publicMessage: "Updated presence protocol and conflict resolver.",
      visibility: "PUBLIC" as const,
      delayMs: 800,
    },
    {
      type: "FILE_CHANGED" as const,
      title: "Editing files",
      publicMessage: "Added integration tests for multi-agent rooms.",
      visibility: "PUBLIC" as const,
      delayMs: 700,
    },
    {
      type: "TEST_STARTED" as const,
      title: "Running tests",
      publicMessage: "Executing unit and integration suites.",
      visibility: "PUBLIC" as const,
      delayMs: 600,
    },
    {
      type: "TEST_COMPLETED" as const,
      title: "Tests passed",
      publicMessage: "24/24 tests passed. No regressions detected.",
      visibility: "PUBLIC" as const,
      delayMs: 750,
    },
    {
      type: "COMMIT_CREATED" as const,
      title: "Creating commit",
      publicMessage: "Commit recorded with sanitized diff summary.",
      visibility: "PUBLIC" as const,
      delayMs: 500,
    },
    {
      type: "ARTIFACT_CREATED" as const,
      title: "Producing artifacts",
      publicMessage: "Test report, diff summary, and build log packaged.",
      visibility: "PUBLIC" as const,
      delayMs: 550,
    },
    {
      type: "TOOL_CALL" as const,
      title: "Founder diagnostics",
      publicMessage: "Private harness metrics collected for founder review.",
      visibility: "FOUNDER_ONLY" as const,
      delayMs: 400,
      privatePayload: { note: "Internal latency p95 180ms — not shown to investors" },
    },
    {
      type: "RUN_COMPLETED" as const,
      title: "Generating Proof of Build",
      publicMessage: "Run completed. Proof of Build ready for verification.",
      visibility: "PUBLIC" as const,
      delayMs: 450,
    },
  ];

  return events.map((event, index) => ({
    id: `${runId}-evt-${index + 1}`,
    runId,
    sequence: index + 1,
    type: event.type,
    title: event.title,
    publicMessage: event.publicMessage,
    privatePayload: "privatePayload" in event ? JSON.stringify(event.privatePayload) : null,
    visibility: event.visibility,
    delayMs: event.delayMs,
    createdAt: new Date(new Date(base).getTime() + index * 1000).toISOString(),
  }));
}

export function buildProofManifest(input: {
  projectId: string;
  buildRoundId: string;
  agentRunId: string;
  taskTitle: string;
  agentName: string;
  harness: string;
  model: string;
  provider: string;
  computeSource: string;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  commitHash: string;
  artifacts: { name: string; hash: string; type: string }[];
}) {
  const manifest = {
    version: "1.0",
    projectId: input.projectId,
    buildRoundId: input.buildRoundId,
    agentRunId: input.agentRunId,
    task: { title: input.taskTitle },
    agent: {
      name: input.agentName,
      harness: input.harness,
      model: input.model,
      provider: input.provider,
    },
    compute: { source: input.computeSource },
    changes: {
      filesChanged: input.filesChanged,
      linesAdded: input.linesAdded,
      linesRemoved: input.linesRemoved,
    },
    tests: {
      total: input.testsTotal,
      passed: input.testsPassed,
      failed: input.testsFailed,
    },
    commitHash: input.commitHash,
    artifacts: input.artifacts.map((a) => ({
      name: a.name,
      type: a.type,
      hash: a.hash,
    })),
    createdAt: daysAgo(3),
  };

  const manifestJson = JSON.stringify(manifest, Object.keys(manifest).sort());
  return {
    manifest,
    manifestJson: JSON.stringify(manifest, null, 2),
    manifestHash: sha256(manifestJson),
    artifactRootHash: sha256(input.artifacts.map((a) => a.hash).sort().join("|")),
  };
}
