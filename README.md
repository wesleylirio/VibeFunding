# VibeFunding

**Web3 launchpad for agentic startups.**  
Invest **VIBE** → fund **AMD GPU** compute for agent work → verify progress with **Proof of Build** → earn project tokens.  
**Gemma** is the portfolio & diligence copilot.

Built for [AMD Developer Hackathon: ACT II](https://lablab.ai/ai-hackathons/amd-developer-hackathon-act-ii) · **Track 3 Unicorn** · Best Use of Gemma.

---

## Quick start

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run typecheck
npm run build
```

---

## Demo path (judges)

1. **Get started** → investor login  
2. Gemma onboarding preferences  
3. **Discover** → open a project (Gemma suggestion badge)  
4. **Invest with VIBE** → redirected to **Proof of Build**  
5. Watch **agents** (~60s at 1x) → tokens / NFT settle  
6. **Community** → **Portfolio**  
7. Open the **Gemma** orb for diligence chat  

---

## Live Gemma

### Designed path (hackathon / Fireworks + AMD)

The **original and intended** way to run live Gemma is **Fireworks AI** (Gemma 4 IT on AMD-backed dedicated deployment):

```env
GEMMA_PROVIDER=auto
FIREWORKS_API_KEY=fw_...
FIREWORKS_BASE_URL=https://api.fireworks.ai/inference/v1
FIREWORKS_MODEL=accounts/<ACCOUNT>/deployments/<DEPLOYMENT_ID>
GEMMA_MODEL=accounts/<ACCOUNT>/deployments/<DEPLOYMENT_ID>
```

That is the stack claim for **Best Use of Gemma** + Fireworks/AMD: set a running dedicated deployment, use the product, then tear the deployment down (on-demand bills per GPU hour while up).

### Always-on public demo (OpenRouter free — fallback only)

Gemma 4 31B on Fireworks is **on-demand only** (no cheap 24/7 serverless). For the **public URL that stays online for judges**, this repo also accepts **OpenRouter free Gemma** when Fireworks credits/deploy are unavailable:

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=google/gemma-4-31b-it:free
```

**Same app, same Gemma product surface** (chat, diligence, matching). OpenRouter is **not** the designed primary path — it is a **demo continuity fallback** so the hosted site does not go “Gemma offline” after Fireworks credits run out.

| Mode | When | Intent |
| --- | --- | --- |
| **Fireworks** | Key + running deployment | Primary / pitch / video ideal |
| **OpenRouter free** | No Fireworks credits or deploy | Public always-on demo only |
| **Mock** | No keys | Full UI without live model |

Priority in code: **Fireworks → OpenRouter → offline mock**.

Health (no secrets): `GET /api/gemma/health`

---

## Docker

```bash
docker build -t vibefunding .
# Primary (when you have a Fireworks deployment):
docker run -p 3000:3000 \
  -e DEMO_MODE=true \
  -e GEMMA_PROVIDER=auto \
  -e FIREWORKS_API_KEY=your_key \
  -e FIREWORKS_MODEL=accounts/ACCOUNT/deployments/ID \
  vibefunding

# Always-on fallback (free OpenRouter if Fireworks credits are gone):
docker run -p 3000:3000 \
  -e DEMO_MODE=true \
  -e GEMMA_PROVIDER=auto \
  -e OPENROUTER_API_KEY=your_key \
  vibefunding
```

## Deploy

| Platform | Config |
|---|---|
| **SnapDeploy** | Connect GitHub repo — auto-deploy |
| Render | `render.yaml` (legacy) |
| Fly.io | `fly.toml` (legacy) |
| Local Docker | `docker-compose.yml` |

---

## Repository layout

```
src/app/           # Pages + API routes
src/components/    # UI
src/lib/           # Domain (gemma, portfolio, seed, proof)
tests/             # Vitest
scripts/           # seed, demo-record, fireworks helpers
infra/amd/         # Optional AMD VM OpenAI-compatible serve scripts
docs/              # Hackathon notes
```

---

## Environment

Copy `.env.example` → `.env`. **Never commit real keys.**

| Variable | Purpose |
| --- | --- |
| `DEMO_MODE` | Demo seed behaviour |
| `DATABASE_URL` | SQLite, e.g. `file:./data/app.db` |
| `GEMMA_PROVIDER` | `auto` \| `mock` |
| `FIREWORKS_*` | Primary live Gemma |
| `OPENROUTER_*` | Free always-on Gemma |

---

## Product model

| Concept | Meaning |
| --- | --- |
| **VIBE** | Investor contribution unit |
| **50 VIBE = 1 AMD GPU Hour** | Product conversion for agent budgets |
| **Proof of Build** | Verified agent execution (tests, hashes, artifacts) |
| **Gemma** | Matching, diligence, proof explanation |

---

## Hackathon submission

See **[docs/HACKATHON.md](./docs/HACKATHON.md)** for LabLab requirements (video, public repo, Docker, demo URL) and how that differs from in-app **Proof of Build** evidence.

---

## License

MIT · see [LICENSE](./LICENSE).
