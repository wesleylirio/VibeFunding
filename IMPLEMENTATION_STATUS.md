# Implementation Status — VibeFunding Demo Mode

## Completed functionality

- Next.js 15 App Router + TypeScript + Tailwind design system
- SQLite + Drizzle schema for all core entities
- Idempotent seed (12+ projects, 3 detailed, investor/founder, rounds, holdings, NFTs, runs, events, proofs, updates)
- Demo role switch (Investor / Founder) without auth
- Investor journey: Portfolio → Discover → Project → Allocate → Agents replay → Proof of Build → Portfolio
- Founder journey: Dashboard → Project → Edit Build Round draft → Gemma review → Agent workspace → Proof → Stakeholder update publish
- Gemma gateway interfaces: Mock, Cached, AMD (with fallback); Demo Mode default without credentials
- Agent replay: play/pause/speed/skip, visibility levels, recorded/demo labels
- Proof of Build: manifest, SHA-256 hashes, artifacts, verification status, Gemma summary
- Persistent allocations/holdings (server-side)
- `/api/health`, `/api/demo/reset`, `/api/demo/switch-role`
- Docker + docker-compose
- Tests for proof hashing and allocate/reset

## Current functional flow

```text
Investor: /portfolio → Gemma briefing → /discover → /projects/collabmesh
  → Allocate VIBE → /projects/collabmesh/agents (replay) → /proofs/[id] → /portfolio

Founder: switch role → /founder → /founder/projects/[id]
  → edit Build Round → Gemma review → /runs → /stakeholder-update → publish
  → switch Investor → see update on portfolio
```

## Important technical decisions

- SQLite file at `data/app.db` (or `DATABASE_URL`) with schema auto-created on boot
- Auto-seed when empty so Docker/jurors need no manual steps
- Gemma always available via demo/cache providers; AMD only when credentials + `DEMO_MODE=false`
- Agent observability is replay-only in Demo Mode (no browser-triggered shell execution)
- All economic values labeled SIMULATED

## Product design refinement (latest)

- Dark Web3-native shell, wallet bar, floating Gemma
- Build Units conversion + dual settlement (immediate vs pending verification)
- Portfolio charts, branded discovery/project identity, One-Paper
- Reward UX and product language (no visible “demo/simulated” UI copy)
- See `DESIGN_REFINEMENT_REPORT.md`

## AMD Gemma integration (Sprint 2)

- Provider modes: `auto` | `amd` | `mock` | `cache`
- Full `AmdGemmaGateway` with OpenAI-compatible client, timeouts, Zod validation, cache
- Context builders for portfolio / project / proof / founder (no secrets)
- Live paths: diligence, portfolio briefing, proof explain, chat, quickstart, stakeholder assist
- `GET /api/gemma/health` (redacted)
- UI attribution only when truly `AMD_GEMMA`
- Infra runbook: `infra/amd/`
- Docs: `AMD_GEMMA_INTEGRATION.md`, `AMD_INTEGRATION_REPORT.md`
- Live AMD endpoint **not exercised** on this workstation (Docker CLI + cloud host absent)
- Deterministic Demo Mode remains default when credentials missing

## Known limitations

- No real AMD/Fireworks calls (internal Demo Mode still powers fallbacks)
- No real wallets, chain, or auth
- Summary catalog projects are thinner than the three deep-dive projects
- Media uses branded placeholders until final assets
- Verification is a controlled product action, not external attestation

## Remaining P0 tasks

- Validate Docker build on clean machine
- Visual polish pass if jury feedback arrives
- Optional: import a real agent run artifact for “Recorded real run” authenticity beyond seed

## Validation results

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run test` | Pass (5 tests) |
| `npm run lint` | Pass (0 errors) |
| `npm run build` | Pass |
| `GET /api/health` | 200 `{"status":"ok","demoMode":true}` |
| `GET /portfolio` etc. | 200 |
| `POST /api/rounds/.../allocate` | 200, persists reward tokens |
| `POST /api/gemma/chat` | 200, Demo/Cached contextual response |
| External API keys required | No |

Server binds `0.0.0.0:3000`. Docker files present (`Dockerfile`, `docker-compose.yml`).
