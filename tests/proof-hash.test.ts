import { describe, expect, it } from "vitest";
import { createHash } from "crypto";
import { buildProofManifest, sha256 } from "../src/lib/db/seed-data";
import { verifyManifestHash } from "../src/lib/queries/proofs";

describe("Proof of Build hashing", () => {
  it("produces stable sha256 for identical artifact lists", () => {
    const artifacts = [
      { name: "a.diff", hash: sha256("a"), type: "DIFF" },
      { name: "b.json", hash: sha256("b"), type: "TEST_REPORT" },
    ];
    const first = buildProofManifest({
      projectId: "p1",
      buildRoundId: "r1",
      agentRunId: "run1",
      taskTitle: "Task",
      agentName: "Forge",
      harness: "OpenCode",
      model: "DeepSeek",
      provider: "demo",
      computeSource: "AMD",
      filesChanged: 2,
      linesAdded: 10,
      linesRemoved: 1,
      testsTotal: 3,
      testsPassed: 3,
      testsFailed: 0,
      commitHash: "abc",
      artifacts,
    });
    const second = buildProofManifest({
      projectId: "p1",
      buildRoundId: "r1",
      agentRunId: "run1",
      taskTitle: "Task",
      agentName: "Forge",
      harness: "OpenCode",
      model: "DeepSeek",
      provider: "demo",
      computeSource: "AMD",
      filesChanged: 2,
      linesAdded: 10,
      linesRemoved: 1,
      testsTotal: 3,
      testsPassed: 3,
      testsFailed: 0,
      commitHash: "abc",
      artifacts,
    });
    expect(first.manifestHash).toBe(second.manifestHash);
    expect(first.artifactRootHash).toBe(second.artifactRootHash);
  });

  it("recalculates manifest hash consistently", () => {
    const obj = { version: "1.0", projectId: "x", z: 1, a: 2 };
    const pretty = JSON.stringify(obj, null, 2);
    const expected = createHash("sha256")
      .update(JSON.stringify(obj, Object.keys(obj).sort()))
      .digest("hex");
    expect(verifyManifestHash(pretty)).toBe(expected);
  });
});
