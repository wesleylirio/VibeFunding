import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const p = resolve(process.cwd(), ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

async function main() {
  loadEnv();
  const key = process.env.FIREWORKS_API_KEY!;
  const depName =
    process.env.FIREWORKS_MODEL ||
    "accounts/leyverse/deployments/lzl00zfr";
  const url = `https://api.fireworks.ai/v1/${depName}`;

  for (let i = 0; i < 40; i++) {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const j = (await r.json()) as {
      state?: string;
      status?: { code?: string; message?: string };
      replicaCount?: number;
      desiredReplicaCount?: number;
      replicaStats?: Record<string, number>;
      baseModel?: string;
      displayName?: string;
      acceleratorType?: string;
      acceleratorCount?: number;
    };
    const stats = j.replicaStats || {};
    console.log(
      `[${i}] state=${j.state} status=${j.status?.code} replicas=${j.replicaCount}/${j.desiredReplicaCount}`,
      "stats",
      JSON.stringify(stats)
    );

    const ready =
      (j.replicaCount ?? 0) > 0 ||
      (stats.effectiveReplicaCount ?? 0) > 0 ||
      j.state === "READY" ||
      j.status?.code === "OK" && (j.replicaCount ?? 0) > 0;

    // try chat every few polls
    if (i % 2 === 0) {
      const chat = await fetch(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: depName,
            messages: [{ role: "user", content: "Say only: ready" }],
            max_tokens: 8,
            temperature: 0,
          }),
        }
      );
      const text = await chat.text();
      console.log("  chat", chat.status, text.slice(0, 200));
      if (chat.ok) {
        console.log("\nSUCCESS — deployment is serving chat");
        console.log("baseModel:", j.baseModel);
        console.log("accelerators:", j.acceleratorCount, j.acceleratorType);
        process.exit(0);
      }
    }

    if (j.state === "FAILED" || j.status?.code === "FAILED") {
      console.error("Deployment failed:", j.status?.message);
      process.exit(1);
    }

    await new Promise((r) => setTimeout(r, 15000));
  }
  console.error("Timed out waiting for deployment");
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
