# VibeFunding — Setup

Hackathon demo application. All assets and returns are **simulated**.

## Quick start (local)

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default view is **Investor Mode**.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on `0.0.0.0:3000` |
| `npm run build` | Production build |
| `npm run start` | Production server on `0.0.0.0:3000` |
| `npm run seed` | Idempotent seed |
| `npm run seed:reset` | Force reset demo data |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## Docker

```bash
docker compose up --build
```

Application: `http://localhost:3000`  
Health: `http://localhost:3000/api/health`

## Environment

Copy `.env.example` to `.env`. Demo Mode works with **no API keys**.

| Variable | Default | Notes |
| --- | --- | --- |
| `DEMO_MODE` | `true` | Uses mock/cached Gemma + agent replay |
| `DATABASE_URL` | `file:./data/app.db` | SQLite path |
| `GEMMA_PROVIDER` | `demo` | `demo` \| `mock` \| `cache` \| `amd` |
| `GEMMA_BASE_URL` | empty | OpenAI-compatible AMD endpoint |
| `GEMMA_API_KEY` | empty | Server-only |
| `GEMMA_MODEL` | `gemma` | Model name |

## Demo paths

**Investor:** Portfolio → Discover → CollabMesh → Allocate → Agents → Proof of Build → Portfolio  

**Founder:** Switch to Founder → CollabMesh workspace → Edit Build Round → Gemma review → Agent workspace → Stakeholder update → switch Investor to verify

**Reset:** Header **Reset** button or `POST /api/demo/reset`

## Modes

- **Demo Mode (default):** Seeded data, Gemma demo/cache, agent replay. No credentials.
- **Live Mode (optional):** Set `DEMO_MODE=false` and Gemma AMD credentials. Failures fall back automatically.

## Disclaimer

This is an experimental hackathon prototype. Nothing constitutes a real investment offering, financial advice, or transferable asset.
