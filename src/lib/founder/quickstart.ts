import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import {
  buildRounds,
  projects,
  resourceRequirements,
  returnMechanisms,
} from "@/lib/db/schema";
import { FOUNDER_ID, nowIso } from "@/lib/db/seed-data";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";

export type QuickstartInput = {
  building: string;
  stage: string;
  nextGoal: string;
  evidence: string;
};

export type QuickstartDraft = {
  name: string;
  slug: string;
  pitch: string;
  description: string;
  problem: string;
  solution: string;
  audience: string;
  stage: string;
  branding: { primary: string; secondary: string; pattern: string };
  buildRound: {
    title: string;
    objective: string;
    deliverables: string[];
    sprintDraft: string[];
    resources: { type: string; label: string; amount: number; unit: string }[];
    estimatedBuildUnits: number;
    risks: string[];
    returns: { type: string; title: string; description: string }[];
  };
  token: { symbol: string; name: string };
  nft: { name: string; utility: string[] };
  investorSummary: string;
  onePaper: string;
};

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || `project-${nanoid(6)}`
  );
}

export function generateQuickstartDraft(input: QuickstartInput): QuickstartDraft {
  const base =
    input.building.trim().split(/[.!?]/)[0]?.trim() || "Agentic product";
  const words = base.split(/\s+/).filter(Boolean);
  const name =
    words.length <= 3
      ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : words
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join("") + " Labs";
  const slug = slugify(name);
  const symbol = name
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 4)
    .toUpperCase() || "BLD";

  const stage = input.stage || "MVP";
  const pitch = `${base.replace(/\.$/, "")} — built with verifiable agentic execution.`;
  const objective =
    input.nextGoal.trim() ||
    "Ship the next verifiable milestone with transparent resource use.";

  const deliverables = [
    `Core delivery for: ${objective.slice(0, 80)}`,
    "Automated tests and agent execution evidence",
    "Proof of Build published for stakeholders",
    "Investor-facing progress summary",
  ];

  const vibeTarget = 8000;
  const gpuHours = 40;
  const agentHours = 60;
  const estimatedBuildUnits = vibeTarget + gpuHours * 50 + agentHours * 100;

  return {
    name,
    slug,
    pitch,
    description: `${base}\n\nCurrent stage: ${stage}. Evidence on hand: ${input.evidence || "Early execution signals"}.\n\nThis Build Round funds the next concrete delivery using capital, agent hours and compute — tracked through Agent Runs and Proof of Build.`,
    problem:
      "Builders with strong execution signals lack a transparent market to raise productive AI capacity without losing control of the roadmap.",
    solution:
      "Open a Build Round that accepts VIBE and productive contributions, execute with coding agents, and publish Proof of Build for holders.",
    audience:
      "Investors, compute providers, and early product users who want exposure tied to verified progress.",
    stage,
    branding: {
      primary: "#3b6ef5",
      secondary: "#22d3ee",
      pattern: "nodes",
    },
    buildRound: {
      title: `${name} Build Sprint`,
      objective,
      deliverables,
      sprintDraft: [
        "Week 1: Scope + agent harness setup",
        "Week 2: Core implementation + tests",
        "Week 3: Proof packaging + stakeholder update",
      ],
      resources: [
        {
          type: "VIBE",
          label: "VIBE capital",
          amount: vibeTarget,
          unit: "VIBE",
        },
        {
          type: "AMD_GPU_HOURS",
          label: "AMD GPU hours",
          amount: gpuHours,
          unit: "hours",
        },
        {
          type: "AGENT_HOURS",
          label: "Agent hours",
          amount: agentHours,
          unit: "hours",
        },
      ],
      estimatedBuildUnits,
      risks: [
        "Execution risk on aggressive timeline",
        "Resource mix may shift as agents discover blockers",
        "Market competition in the category",
      ],
      returns: [
        {
          type: "PROJECT_TOKEN",
          title: `${symbol} Project Tokens`,
          description: `Exposure via ${symbol} issued from Build Units on allocation terms.`,
        },
        {
          type: "NFT",
          title: "Builder Access Pass",
          description: "Access benefits for early liquid contributors.",
        },
      ],
    },
    token: { symbol, name: `${name} Token` },
    nft: {
      name: `${name} Builder Pass`,
      utility: ["Early product access", "Community badge", "Update priority"],
    },
    investorSummary: `${name} is raising productive resources to ${objective}. Contributors receive ${symbol} based on Build Units. Liquid capital settles immediately; productive capacity settles after verification.`,
    onePaper: `# ${name} One-Paper\n\n## Pitch\n${pitch}\n\n## Problem\nBuilders need productive capital with transparent conversion into work.\n\n## Solution\n${base}\n\n## Stage\n${stage}\n\n## Build Round\n${objective}\n\n## Resources\nVIBE, AMD GPU hours, agent hours → Build Units\n\n## Returns\n${symbol} Project Tokens + access NFT\n\n## Evidence\n${input.evidence || "To be expanded"}\n`,
  };
}

export function saveQuickstartDraft(draft: QuickstartDraft) {
  ensureSeeded();
  const db = getDb();
  const existing = db
    .select()
    .from(projects)
    .where(eq(projects.slug, draft.slug))
    .get();

  let slug = draft.slug;
  if (existing) slug = `${draft.slug}-${nanoid(4)}`;

  const projectId = `proj-${nanoid(10)}`;
  const createdAt = nowIso();

  db.insert(projects)
    .values({
      id: projectId,
      slug,
      name: draft.name,
      shortDescription: draft.pitch,
      description: draft.description,
      category: "Developer Tools",
      stage: draft.stage,
      status: "ACTIVE",
      logoEmoji: "◇",
      accentColor: draft.branding.primary,
      secondaryColor: draft.branding.secondary,
      repositoryUrl: null,
      websiteUrl: null,
      socialLinks: JSON.stringify({}),
      brandPattern: draft.branding.pattern,
      founderId: FOUNDER_ID,
      visibility: "PUBLIC",
      techStack: JSON.stringify(["TypeScript", "Open models", "Agents"]),
      metrics: JSON.stringify({
        users: 0,
        mrr: 0,
        commits: 0,
        tests: 0,
        uptime: 0,
      }),
      risks: JSON.stringify(draft.buildRound.risks),
      history: JSON.stringify([
        {
          date: createdAt,
          title: "Draft created with Gemma",
          detail: "Founder Quickstart draft — not published automatically.",
        },
      ]),
      tokenSymbol: draft.token.symbol,
      tokenName: draft.token.name,
      detailed: true,
      trendingScore: 50,
      createdAt,
    })
    .run();

  const roundId = `round-${nanoid(10)}`;
  db.insert(buildRounds)
    .values({
      id: roundId,
      projectId,
      title: draft.buildRound.title,
      objective: draft.buildRound.objective,
      status: "DRAFT",
      targetValue: draft.buildRound.estimatedBuildUnits,
      fundedValue: 0,
      startsAt: createdAt,
      endsAt: null,
      expectedDeliverables: JSON.stringify(draft.buildRound.deliverables),
      risks: JSON.stringify(draft.buildRound.risks),
      publicSummary: draft.investorSummary,
      createdAt,
    })
    .run();

  for (const r of draft.buildRound.resources) {
    db.insert(resourceRequirements)
      .values({
        id: `res-${nanoid(8)}`,
        buildRoundId: roundId,
        type: r.type as "VIBE" | "AMD_GPU_HOURS" | "AGENT_HOURS",
        targetAmount: r.amount,
        fundedAmount: 0,
        unit: r.unit,
        label: r.label,
      })
      .run();
  }

  for (const r of draft.buildRound.returns) {
    db.insert(returnMechanisms)
      .values({
        id: `ret-${nanoid(8)}`,
        buildRoundId: roundId,
        type: r.type as "PROJECT_TOKEN" | "NFT",
        title: r.title,
        description: r.description,
        simulated: true,
        terms: null,
      })
      .run();
  }

  return { projectId, slug, roundId };
}
