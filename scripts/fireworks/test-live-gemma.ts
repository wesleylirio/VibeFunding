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
  const { openAIChatCompletion } = await import(
    "../src/lib/gemma/openai-client"
  );
  const r = await openAIChatCompletion(
    [
      {
        role: "system",
        content:
          "You are Gemma, VibeFunding copilot. Plain text only. Max 2 sentences.",
      },
      {
        role: "user",
        content:
          "Name one investor risk for a multiplayer agent collaboration product like CollabMesh.",
      },
    ],
    { temperature: 0.2 }
  );
  console.log("latencyMs:", r.latencyMs);
  console.log("model:", r.model);
  console.log("content:", r.content);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
