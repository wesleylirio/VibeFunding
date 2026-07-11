/** Segmented narration for the judge demo video (English). */
export type NarrationCue = {
  /** File stem under scripts/demo-record/audio/ */
  id: string;
  /** Spoken text (TTS) */
  text: string;
  /** Pause after this clip before next action (ms) */
  pauseAfterMs?: number;
};

export const NARRATION: NarrationCue[] = [
  {
    id: "01-intro",
    text: "VibeFunding is a web3 launchpad for agentic startups. Investors contribute VIBE, which converts into AMD GPU Cloud Credits that fund real agent work.",
    pauseAfterMs: 400,
  },
  {
    id: "02-login",
    text: "I'm signing in as investor Wesley Lirio. Founder Mode is coming soon for selected startups — this demo is the full investor journey.",
    pauseAfterMs: 400,
  },
  {
    id: "03-prefs",
    text: "On Discover, Gemma learns what I care about. I tap preferences — developer tools, growth stage, and AMD GPU-backed shipping.",
    pauseAfterMs: 300,
  },
  {
    id: "04-matches",
    text: "Gemma recommends projects with clear match reasons. I'll open CollabMesh, our hero Build Round.",
    pauseAfterMs: 400,
  },
  {
    id: "05-project",
    text: "CollabMesh is multiplayer infrastructure for agentic developer tools. The current opportunity is a funded Build Round with clear deliverables.",
    pauseAfterMs: 400,
  },
  {
    id: "06-invest",
    text: "I invest with VIBE only. Fifty VIBE equals one AMD GPU Hour of cloud credits. One thousand VIBE funds twenty GPU hours for agents.",
    pauseAfterMs: 400,
  },
  {
    id: "07-gemma",
    text: "Gemma runs live via Fireworks on AMD-backed infrastructure. I open the assistant for independent due diligence — risks, strengths, and proof history — not marketing copy.",
    pauseAfterMs: 500,
  },
  {
    id: "08-agents",
    text: "After investing, I watch a recorded agent execution. Compute is labeled honestly as a demonstration replay with tests and artifacts.",
    pauseAfterMs: 400,
  },
  {
    id: "09-proof",
    text: "Proof of Build shows what was funded, completed, and verified — files, tests, and hashes — with technical detail available on demand.",
    pauseAfterMs: 400,
  },
  {
    id: "10-portfolio",
    text: "Portfolio shows holdings first — VIBE, project tokens, and recent outcomes — then Gemma's concentration insight.",
    pauseAfterMs: 400,
  },
  {
    id: "11-close",
    text: "VibeFunding connects capital to compute, agents to evidence, and Gemma to investor understanding. That's the product.",
    pauseAfterMs: 600,
  },
];
