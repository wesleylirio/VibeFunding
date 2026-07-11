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
  const headers = { Authorization: `Bearer ${key}` };

  for (const path of [
    "https://api.fireworks.ai/v1/accounts/leyverse/deployments",
    "https://api.fireworks.ai/v1/accounts/leyverse/deployedModels",
    "https://api.fireworks.ai/v1/accounts/leyverse/deployments/lzl00zfr",
  ]) {
    const r = await fetch(path, { headers });
    console.log("\nGET", path, "→", r.status);
    console.log((await r.text()).slice(0, 2000));
  }

  const candidates = [
    "accounts/leyverse/deployments/lzl00zfr",
    "accounts/fireworks/models/gemma-4-31b-it#lzl00zfr",
    "accounts/leyverse/models/lzl00zfr",
    "accounts/leyverse/deployedModels/lzl00zfr",
    "accounts/fireworks/models/gemma-4-31b-it",
  ];

  for (const model of candidates) {
    const r = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Say only: ready" }],
          max_tokens: 8,
          temperature: 0,
        }),
      }
    );
    console.log("\nCHAT", model, "→", r.status);
    console.log((await r.text()).slice(0, 300));
  }
}

main().catch(console.error);
