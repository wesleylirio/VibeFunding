/**
 * Generate English TTS clips with edge-tts (Microsoft Edge voices).
 * Requires: pip install edge-tts
 */
import { spawn } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "audio");
mkdirSync(outDir, { recursive: true });

const NARRATION = [
  {
    id: "01-intro",
    text: "VibeFunding is a web3 launchpad for agentic startups. Investors contribute VIBE, which converts into AMD GPU Cloud Credits that fund real agent work.",
  },
  {
    id: "02-login",
    text: "I'm signing in as investor Wesley Lirio. Founder Mode is coming soon for selected startups. This demo is the full investor journey.",
  },
  {
    id: "03-prefs",
    text: "On Discover, Gemma learns what I care about. I tap preferences: developer tools, growth stage, and AMD GPU-backed shipping.",
  },
  {
    id: "04-matches",
    text: "Gemma recommends projects with clear match reasons. I'll open CollabMesh, our hero Build Round.",
  },
  {
    id: "05-project",
    text: "CollabMesh is multiplayer infrastructure for agentic developer tools. The current opportunity is a funded Build Round with clear deliverables.",
  },
  {
    id: "06-invest",
    text: "I invest with VIBE only. Fifty VIBE equals one AMD GPU Hour of cloud credits. One thousand VIBE funds twenty GPU hours for agents.",
  },
  {
    id: "07-gemma",
    text: "Gemma runs live via Fireworks on AMD-backed infrastructure. I open the assistant for independent due diligence: risks, strengths, and proof history — not marketing copy.",
  },
  {
    id: "08-agents",
    text: "After investing, I watch a recorded agent execution. Compute is labeled honestly as a demonstration replay with tests and artifacts.",
  },
  {
    id: "09-proof",
    text: "Proof of Build shows what was funded, completed, and verified: files, tests, and hashes, with technical detail available on demand.",
  },
  {
    id: "10-portfolio",
    text: "Portfolio shows holdings first: VIBE, project tokens, and recent outcomes, then Gemma's concentration insight.",
  },
  {
    id: "11-close",
    text: "VibeFunding connects capital to compute, agents to evidence, and Gemma to investor understanding. That's the product.",
  },
];

const VOICE = process.env.DEMO_TTS_VOICE || "en-US-GuyNeural";

function runEdgeTts(textFile, outFile) {
  return new Promise((resolve, reject) => {
    const p = spawn(
      "edge-tts",
      ["--voice", VOICE, "--file", textFile, "--write-media", outFile],
      { stdio: "inherit", shell: false }
    );
    p.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`edge-tts exit ${code}`))
    );
    p.on("error", reject);
  });
}

async function main() {
  console.log("Voice:", VOICE);
  for (const cue of NARRATION) {
    const txt = join(outDir, `${cue.id}.txt`);
    const out = join(outDir, `${cue.id}.mp3`);
    writeFileSync(txt, cue.text, "utf8");
    console.log("TTS", cue.id);
    await runEdgeTts(txt, out);
  }
  writeFileSync(
    join(outDir, "manifest.json"),
    JSON.stringify({ voice: VOICE, cues: NARRATION.map((c) => c.id) }, null, 2)
  );
  console.log("Done →", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
