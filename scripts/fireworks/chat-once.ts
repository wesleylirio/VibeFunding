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
  const model = process.env.FIREWORKS_MODEL!;
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
        messages: [
          {
            role: "system",
            content:
              "You are Gemma, VibeFunding portfolio copilot. Reply in plain text, 2 sentences max.",
          },
          {
            role: "user",
            content:
              "Summarize one main risk for CollabMesh as an investor opportunity.",
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    }
  );
  const j = await r.json();
  console.log("status", r.status);
  console.log(JSON.stringify(j, null, 2).slice(0, 3000));
}

main().catch(console.error);
