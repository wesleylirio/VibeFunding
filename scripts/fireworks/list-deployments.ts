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
  const key = process.env.FIREWORKS_API_KEY || "";
  const base = (
    process.env.FIREWORKS_BASE_URL || "https://api.fireworks.ai/inference/v1"
  ).replace(/\/$/, "");
  console.log("key set:", Boolean(key));
  console.log("FIREWORKS_MODEL:", process.env.FIREWORKS_MODEL);

  const modelsRes = await fetch(`${base}/models`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const modelsJson = (await modelsRes.json()) as {
    data?: { id: string; supports_chat?: boolean }[];
  };
  const all = modelsJson.data || [];
  console.log("\nmodels:", all.length);
  for (const m of all) {
    if (/gemma|deployment/i.test(m.id) || m.supports_chat) {
      console.log(" ·", m.id, m.supports_chat ? "(chat)" : "");
    }
  }

  const accRes = await fetch("https://api.fireworks.ai/v1/accounts", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const accJson = (await accRes.json()) as {
    accounts?: { name?: string; displayName?: string }[];
  };
  console.log("\naccounts status:", accRes.status);
  const accounts = accJson.accounts || [];
  console.log(JSON.stringify(accounts, null, 2).slice(0, 800));

  for (const a of accounts) {
    const name = a.name || "";
    if (!name) continue;
    // name is often "accounts/xxx"
    const urls = [
      `https://api.fireworks.ai/v1/${name}/deployments`,
      `https://api.fireworks.ai/v1/${name}/deployedModels`,
    ];
    for (const url of urls) {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const t = await r.text();
      console.log("\n", url, "→", r.status);
      console.log(t.slice(0, 1200));
    }
  }

  // Probe configured model
  const model =
    process.env.FIREWORKS_MODEL ||
    "accounts/fireworks/models/gemma-4-31b-it";
  console.log("\nProbing chat with:", model);
  const chat = await fetch(`${base}/chat/completions`, {
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
          content: "You are Gemma. Reply in one short sentence.",
        },
        { role: "user", content: "Confirm you are ready for VibeFunding." },
      ],
      max_tokens: 40,
      temperature: 0.2,
    }),
  });
  const chatText = await chat.text();
  console.log("status", chat.status);
  console.log(chatText.slice(0, 500));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
