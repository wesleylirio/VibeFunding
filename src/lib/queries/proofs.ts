import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { getDb } from "@/lib/db";
import {
  agentRuns,
  buildRounds,
  projects,
  proofArtifacts,
  proofsOfBuild,
} from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/demo/ensure-seeded";

export function getProofById(proofId: string) {
  ensureSeeded();
  const db = getDb();
  const proof = db
    .select()
    .from(proofsOfBuild)
    .where(eq(proofsOfBuild.id, proofId))
    .get();
  if (!proof) return null;

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, proof.projectId))
    .get();
  const round = proof.buildRoundId
    ? db
        .select()
        .from(buildRounds)
        .where(eq(buildRounds.id, proof.buildRoundId))
        .get()
    : null;
  const run = db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.id, proof.agentRunId))
    .get();
  const artifacts = db
    .select()
    .from(proofArtifacts)
    .where(eq(proofArtifacts.proofId, proofId))
    .all();

  const recalculated = verifyManifestHash(proof.manifestJson);

  return {
    ...proof,
    project,
    round,
    run,
    artifacts,
    hashCheck: {
      stored: proof.manifestHash,
      recalculated,
      matches: recalculated === proof.manifestHash,
    },
  };
}

export function verifyManifestHash(manifestJson: string): string {
  // Recompute using stable stringify of parsed object keys sorted at top level
  try {
    const obj = JSON.parse(manifestJson) as Record<string, unknown>;
    const stable = JSON.stringify(obj, Object.keys(obj).sort());
    return createHash("sha256").update(stable).digest("hex");
  } catch {
    return createHash("sha256").update(manifestJson).digest("hex");
  }
}
