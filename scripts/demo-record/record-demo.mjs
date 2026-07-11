/**
 * Automated product demo for LabLab judges:
 * - Opens real VibeFunding UI
 * - Logs in as Wesley Lirio
 * - Walks Discover → CollabMesh → Invest → Gemma → Agents → Proof → Portfolio
 * - Records browser video + plays TTS narration
 *
 * Usage:
 *   1) npm run dev   (in another terminal)
 *   2) node scripts/demo-record/generate-tts.mjs
 *   3) node scripts/demo-record/record-demo.mjs
 *
 * Env:
 *   DEMO_BASE_URL=http://localhost:3000
 *   DEMO_HEADLESS=0   # show browser (default 0)
 */
import { chromium } from "playwright";
import { spawn } from "child_process";
import {
  mkdirSync,
  existsSync,
  readdirSync,
  copyFileSync,
  writeFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const OUT_DIR = join(ROOT, "demo-recordings");
const AUDIO_DIR = join(__dirname, "audio");
const BASE = process.env.DEMO_BASE_URL || "http://127.0.0.1:3000";
const HEADLESS = process.env.DEMO_HEADLESS === "1";

mkdirSync(OUT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function playMp3(file) {
  return new Promise((resolve) => {
    // Windows: powershell MediaPlayer, or ffplay if present
    const ps = `
      Add-Type -AssemblyName presentationCore;
      $p = New-Object System.Windows.Media.MediaPlayer;
      $p.Open([uri]'${file.replace(/'/g, "''")}');
      $p.Volume = 1;
      Start-Sleep -Milliseconds 400;
      $p.Play();
      while ($p.NaturalDuration.HasTimeSpan -eq $false) { Start-Sleep -Milliseconds 100 }
      $ms = [int]$p.NaturalDuration.TimeSpan.TotalMilliseconds + 350;
      Start-Sleep -Milliseconds $ms;
      $p.Stop();
      $p.Close();
    `;
    const child = spawn(
      "powershell",
      ["-NoProfile", "-Command", ps],
      { stdio: "ignore" }
    );
    child.on("exit", () => resolve());
    child.on("error", () => resolve());
  });
}

async function say(id) {
  const file = join(AUDIO_DIR, `${id}.mp3`);
  if (!existsSync(file)) {
    console.warn("Missing audio", id, "— continuing without TTS for this cue");
    await sleep(2500);
    return;
  }
  console.log("  🔊", id);
  await playMp3(file);
}

async function safeClick(page, selector, opts = {}) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: "visible", timeout: opts.timeout || 15000 });
  await loc.click({ timeout: 10000 });
}

async function clickText(page, text, opts = {}) {
  const loc = page.getByText(text, { exact: opts.exact ?? false }).first();
  await loc.waitFor({ state: "visible", timeout: opts.timeout || 15000 });
  await loc.click();
}

async function main() {
  console.log("Base URL:", BASE);
  console.log("Headless:", HEADLESS);

  // Health check
  try {
    const h = await fetch(`${BASE}/api/health`);
    if (!h.ok) throw new Error("health not ok");
  } catch {
    console.error(
      "App not reachable at",
      BASE,
      "\nStart with: npm run dev"
    );
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ["--window-size=1440,900"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1440, height: 900 },
    },
    // deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    // ── Landing ──
    console.log("1 Landing");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await sleep(800);
    await say("01-intro");

    // ── Login ──
    console.log("2 Login as Wesley Lirio");
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await sleep(1200);
    // Prefer nickname autocomplete; fallback to first text input
    const nameInput = page.locator('input[autocomplete="nickname"]').first();
    await nameInput.click();
    await nameInput.fill("");
    await nameInput.pressSequentially("Wesley Lirio", { delay: 30 });
    const passInput = page.locator('input[type="password"]');
    await passInput.click();
    await passInput.fill("");
    await passInput.pressSequentially("demo-password", { delay: 20 });
    await say("02-login");
    const loginResp = page.waitForResponse(
      (r) => r.url().includes("/api/demo/login") && r.request().method() === "POST",
      { timeout: 20000 }
    );
    await page.getByRole("button", { name: /Continue as Investor/i }).click();
    const resp = await loginResp.catch(() => null);
    console.log("  login API", resp ? resp.status() : "no response");
    try {
      await page.waitForURL(/\/(discover|portfolio)/, { timeout: 15000 });
    } catch {
      console.warn("  login redirect slow — forcing /discover");
      await page.goto(`${BASE}/discover`, { waitUntil: "domcontentloaded" });
    }
    await sleep(1500);

    // ── Discover prefs ──
    console.log("3 Discover / prefs");
    if (!page.url().includes("/discover")) {
      await page.goto(`${BASE}/discover`, { waitUntil: "networkidle" });
    }
    await sleep(800);
    await say("03-prefs");

    // Tap through questionnaire if present
    const prefHint = page.getByText(/tap an answer|Let Gemma understand|What kind of projects/i);
    if (await prefHint.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      const taps = [
        "Developer tools",
        "Growing",
        "Balanced",
        "AMD GPU-backed agent work",
        "Technical innovation",
      ];
      for (const t of taps) {
        const btn = page.getByRole("button", { name: t });
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click();
          await sleep(450);
        } else {
          // fallback: any option chip
          const chip = page.locator("button").filter({ hasText: /.+/ }).nth(2);
          if (await chip.isVisible().catch(() => false)) {
            await chip.click();
            await sleep(450);
          }
        }
      }
      await sleep(2000);
      await page.waitForLoadState("networkidle").catch(() => {});
    }

    await say("04-matches");
    await sleep(600);

    // Open CollabMesh (prefer direct navigation for reliability)
    console.log("4 Project CollabMesh");
    const mesh = page.getByRole("link", { name: /CollabMesh/i }).first();
    if (await mesh.isVisible({ timeout: 4000 }).catch(() => false)) {
      await mesh.click().catch(() => {});
      await sleep(800);
    }
    if (!page.url().includes("collabmesh")) {
      await page.goto(`${BASE}/projects/collabmesh`, {
        waitUntil: "domcontentloaded",
      });
    }
    await sleep(1800);
    await say("05-project");
    await page.mouse.wheel(0, 400);
    await sleep(800);

    // Invest
    console.log("5 Invest flow");
    await say("06-invest");
    const investBtn = page.getByRole("button", { name: /Invest/i }).first();
    if (await investBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await investBtn.click();
      await sleep(800);
      // multi-step modal
      for (let i = 0; i < 4; i++) {
        const cont = page.getByRole("button", { name: /Continue|Confirm investment/i });
        if (await cont.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          const label = await cont.first().innerText().catch(() => "");
          await cont.first().click();
          await sleep(label.toLowerCase().includes("confirm") ? 2500 : 900);
          if (label.toLowerCase().includes("confirm")) break;
        } else break;
      }
      // skip success sequence if present
      const skip = page.getByRole("button", { name: /Skip/i });
      if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
        await skip.click();
        await sleep(600);
      }
      const close = page.getByRole("button", { name: /Close/i });
      if (await close.isVisible({ timeout: 2000 }).catch(() => false)) {
        await close.click();
      }
    }
    await sleep(800);

    // Gemma orb
    console.log("6 Gemma assistant");
    await say("07-gemma");
    const gemma = page.getByRole("button", { name: /Open Gemma|Gemma/i }).first();
    if (await gemma.isVisible({ timeout: 4000 }).catch(() => false)) {
      await gemma.click();
      await sleep(2500);
      // try ask a question
      const ta = page.locator("textarea").first();
      if (await ta.isVisible({ timeout: 3000 }).catch(() => false)) {
        await ta.fill("What are the main risks for this project?");
        await page.getByRole("button").filter({ has: page.locator("svg") }).last().click().catch(async () => {
          await page.keyboard.press("Enter");
        });
        await sleep(8000); // wait for live or fallback reply
      }
      const closeG = page.getByRole("button", { name: /Close Gemma|Close/i }).first();
      if (await closeG.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeG.click();
      }
    }
    await sleep(500);

    // Agents
    console.log("7 Agents");
    await page.goto(`${BASE}/projects/collabmesh/agents`, {
      waitUntil: "networkidle",
    });
    await sleep(1200);
    await say("08-agents");
    await sleep(2000);

    // Proof
    console.log("8 Proof");
    await page.goto(`${BASE}/proofs/proof-collabmesh-1`, {
      waitUntil: "networkidle",
    });
    await sleep(1000);
    await say("09-proof");
    await page.mouse.wheel(0, 300);
    await sleep(1500);

    // Portfolio
    console.log("9 Portfolio");
    await page.goto(`${BASE}/portfolio`, { waitUntil: "networkidle" });
    await sleep(1200);
    await say("10-portfolio");
    await page.mouse.wheel(0, 350);
    await sleep(1500);

    await say("11-close");
    await sleep(1000);
  } catch (e) {
    console.error("Demo error:", e);
  }

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const path = await video.path();
    const dest = join(OUT_DIR, "vibefunding-platform-demo.webm");
    copyFileSync(path, dest);
    console.log("\n✅ Video saved:", dest);
    console.log(
      "Convert to mp4 (if ffmpeg installed):\n  ffmpeg -y -i demo-recordings/vibefunding-platform-demo.webm -c:v libx264 -pix_fmt yuv420p -c:a aac demo-recordings/vibefunding-platform-demo.mp4"
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
