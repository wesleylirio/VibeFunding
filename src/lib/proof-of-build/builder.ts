import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import {
  agentRuns,
  proofArtifacts,
  proofsOfBuild,
  projects,
} from "@/lib/db/schema";
import { nowIso } from "@/lib/db/seed-data";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function buildProofFromRun(runId: string) {
  ensureSeeded();
  const db = getDb();
  const run = db.select().from(agentRuns).where(eq(agentRuns.id, runId)).get();
  if (!run) throw new Error("Agent run not found");
  if (run.status !== "COMPLETED") {
    throw new Error("Only completed runs can produce a Proof of Build");
  }

  const existing = db
    .select()
    .from(proofsOfBuild)
    .where(eq(proofsOfBuild.agentRunId, runId))
    .get();
  if (existing) return existing;

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, run.projectId))
    .get();

  const artifacts = [
    {
      type: "DIFF" as const,
      name: "changes.diff",
      content: `files:${run.filesChanged}+${run.linesAdded}-${run.linesRemoved}`,
    },
    {
      type: "TEST_REPORT" as const,
      name: "tests.json",
      content: JSON.stringify({
        total: run.testsTotal,
        passed: run.testsPassed,
        failed: run.testsFailed,
      }),
    },
    {
      type: "COMMIT" as const,
      name: "commit.txt",
      content: run.commitHash || "no-commit",
    },
    {
      type: "LOG" as const,
      name: "run.log",
      content: `sanitized log for ${run.id}`,
    },
  ].map((a) => ({
    ...a,
    hash: sha256(a.content),
    size: a.content.length,
  }));

  const manifest = {
    version: "1.0",
    projectId: run.projectId,
    buildRoundId: run.buildRoundId,
    agentRunId: run.id,
    task: { title: run.taskTitle, description: run.taskDescription },
    agent: {
      name: run.agentName,
      harness: run.harness,
      model: run.model,
      provider: run.provider,
    },
    compute: { source: run.computeSource },
    changes: {
      filesChanged: run.filesChanged,
      linesAdded: run.linesAdded,
      linesRemoved: run.linesRemoved,
    },
    tests: {
      total: run.testsTotal,
      passed: run.testsPassed,
      failed: run.testsFailed,
    },
    commitHash: run.commitHash,
    artifacts: artifacts.map((a) => ({
      name: a.name,
      type: a.type,
      hash: a.hash,
    })),
    createdAt: nowIso(),
  };

  const manifestJsonPretty = JSON.stringify(manifest, null, 2);
  const manifestHash = sha256(
    JSON.stringify(manifest, Object.keys(manifest).sort())
  );
  const artifactRootHash = sha256(
    artifacts
      .map((a) => a.hash)
      .sort()
      .join("|")
  );

  const proofId = `proof-${nanoid(10)}`;
  const createdAt = nowIso();

  db.insert(proofsOfBuild)
    .values({
      id: proofId,
      projectId: run.projectId,
      buildRoundId: run.buildRoundId,
      agentRunId: run.id,
      taskTitle: run.taskTitle,
      taskDescription: run.taskDescription,
      agentName: run.agentName,
      harness: run.harness,
      model: run.model,
      provider: run.provider,
      computeSource: run.computeSource,
      inputTokens: run.inputTokens,
      outputTokens: run.outputTokens,
      computeTimeSeconds: run.computeTimeSeconds,
      normalizedCost: null,
      filesChanged: run.filesChanged ?? 0,
      linesAdded: run.linesAdded ?? 0,
      linesRemoved: run.linesRemoved ?? 0,
      testsTotal: run.testsTotal,
      testsPassed: run.testsPassed,
      testsFailed: run.testsFailed,
      commitHash: run.commitHash,
      repositoryUrl: project?.repositoryUrl,
      artifactRootHash,
      manifestHash,
      manifestJson: manifestJsonPretty,
      verificationStatus: "HASH_VERIFIED",
      publicSummary: `Recorded execution for "${run.taskTitle}". Evidence includes tests, commit reference, and hashed artifacts. This proves recorded work — not code quality.`,
      gemmaSummary: `The agent finished "${run.taskTitle}" with ${run.testsPassed}/${run.testsTotal} tests passing. Stakeholders can verify artifact hashes. Human review is still recommended.`,
      createdAt,
    })
    .run();

  db.insert(proofArtifacts)
    .values(
      artifacts.map((a, i) => ({
        id: `art-${nanoid(8)}-${i}`,
        proofId,
        type: a.type,
        name: a.name,
        path: `/data/proofs/${proofId}/${a.name}`,
        hash: a.hash,
        size: a.size,
        visibility: "PUBLIC" as const,
        contentPreview: a.content.slice(0, 280),
      }))
    )
    .run();

  return db.select().from(proofsOfBuild).where(eq(proofsOfBuild.id, proofId)).get()!;
}
