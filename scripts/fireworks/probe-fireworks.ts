/**
 * List Fireworks models available to the configured API key
 * and probe the configured Gemma model.
 *
 *   npx tsx scripts/probe-fireworks.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  FIREWORKS_DEFAULT_BASE,
  FIREWORKS_GEMMA_MODEL,
  getAmdConfigFromEnv,
  openAIChatCompletion,
} from "../src/lib/gemma/openai-client";

function loadEnvFile() {
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
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

async function main() {
  loadEnvFile();
  const cfg = getAmdConfigFromEnv();
  console.log("backend:", cfg.backend);
  console.log("baseUrl:", cfg.baseUrl || FIREWORKS_DEFAULT_BASE);
  console.log("model:", cfg.model || FIREWORKS_GEMMA_MODEL);
  console.log("key set:", Boolean(cfg.apiKey));

  if (!cfg.apiKey) {
    console.error("Set FIREWORKS_API_KEY in .env");
    process.exit(1);
  }

  const base = (cfg.baseUrl || FIREWORKS_DEFAULT_BASE).replace(/\/$/, "");
  const modelsRes = await fetch(`${base}/models`, {
    headers: { Authorization: `Bearer ${cfg.apiKey}` },
  });
  console.log("\nGET /models →", modelsRes.status);
  if (modelsRes.ok) {
    const json = (await modelsRes.json()) as {
      data?: { id: string; supports_chat?: boolean }[];
    };
    const all = json.data || [];
    const gemma = all.filter((m) => /gemma/i.test(m.id));
    const chat = all.filter((m) => m.supports_chat);
    console.log("total models:", all.length);
    console.log("gemma models:", gemma.length);
    gemma.forEach((m) => console.log("  ·", m.id));
    console.log("chat models:", chat.length);
    chat.slice(0, 20).forEach((m) => console.log("  ·", m.id));
    if (gemma.length === 0) {
      console.log(
        "\n⚠ No Gemma models in the account model list yet.\n" +
          "  Gemma 4 31B IT is ON-DEMAND ONLY (Serverless = Not supported).\n" +
          "  Create a Dedicated deployment in the UI, then set FIREWORKS_MODEL to:\n" +
          "    accounts/<ACCOUNT_ID>/deployments/<DEPLOYMENT_ID>\n" +
          "  Base library path (not callable alone): accounts/fireworks/models/gemma-4-31b-it"
      );
    }
  }

  console.log("\nProbing chat…");
  try {
    const result = await openAIChatCompletion(
      [
        {
          role: "system",
          content: "You are Gemma, portfolio copilot. Reply in one short sentence.",
        },
        {
          role: "user",
          content: "Confirm you are Gemma ready for VibeFunding investor diligence.",
        },
      ],
      { temperature: 0.2, config: { maxOutputTokens: 64 } }
    );
    console.log("OK latencyMs:", result.latencyMs);
    console.log("model:", result.model);
    console.log("content:", result.content.slice(0, 300));
  } catch (e) {
    console.error("Chat probe failed:", e instanceof Error ? e.message : e);
    process.exitCode = 2;
  }
}

main();
