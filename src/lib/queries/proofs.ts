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

export async function getProofById(proofId: string) {
  await ensureSeeded();
  const db = getDb();
  const proof = await db
    .select()
    .from(proofsOfBuild)
    .where(eq(proofsOfBuild.id, proofId))
    .get();
  if (!proof) return null;

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, proof.projectId))
    .get();
  const round = proof.buildRoundId
    ? await db
        .select()
        .from(buildRounds)
        .where(eq(buildRounds.id, proof.buildRoundId))
        .get()
    : null;
  const run = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.id, proof.agentRunId))
    .get();
  const artifacts = await db
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
