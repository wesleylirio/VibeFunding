# Design Refinement Report — VibeFunding

## Visual system changes

- Dark premium shell with soft luminous accents (blue/violet), not neon or casino
- Gradient ambient background, glass header, refined card surfaces
- Design tokens for accent, gemma, vibe, success/warning/pending states
- Stronger typography hierarchy and metric chips
- Progressive disclosure (`details`, expandable sections, modal One-Paper)
- Safe Markdown rendering for Gemma and stakeholder content

## Pages redesigned

| Page | Changes |
| --- | --- |
| Shell | Compact sidebar, wallet bar, floating Gemma, dark theme |
| Portfolio | Hero value, charts (category donut + asset bar), pending verification, progressive sections |
| Discover | Filter chips, Gemma matches, trending rounds, branded project cards with covers |
| Project | Branded hero, media placeholders, signals, team, One-Paper, visual Build Rounds |
| Agents | Product labels (execution replay), branding, path narrative |
| Proof | Seal-first executive view, expandable artifacts/manifest |
| Gemma | Intelligence center: Portfolio Intelligence, Opportunity Matches, Reports |
| Activity | Settlement status badges |
| Founder | Same shell polish, demo banners removed |

## Information architecture

- Primary answer first (portfolio value, project pitch, proof seal)
- Secondary detail below or expandable
- Gemma no longer permanently steals content width
- Wallet always visible in header

## Allocation semantic changes

### Immediate settlement
- VIBE (and liquid types)
- Debits balance, advances Build Round by Build Units, credits Project Tokens immediately
- NFT at CollabMesh threshold (≥ 2,000 liquid Build Units)

### Verified contribution settlement
- AMD GPU hours, Agent hours, Agentic credits, Compute units
- Status `PENDING_VERIFICATION` — no tokens credited yet
- `POST /api/allocations/[id]/verify` → `REWARD_RELEASED` and token credit

## Conversion model

Internal unit: **Build Units (BU)**

| Resource | BU per unit | Verification |
| --- | --- | --- |
| VIBE | 1 | Immediate |
| AMD GPU hours | 50 | Required |
| Agent hours | 100 | Required |
| Agentic credits | 0.0002 | Required |
| Compute units | 10 | Required |

Project tokens per BU (examples): MESH 0.8, LANE 1.1, AFG 1.0

Example: 1,000 VIBE → 1,000 BU → 800 MESH immediate  
Example: 20 Agent Hours → 2,000 BU → 1,600 MESH pending verification

## Reward UX

- Success panel with settlement badge
- Token reveal + wallet refresh animation
- NFT card with rarity/utility when unlocked
- Links to portfolio and agent replay
- Verify action for pending productive contributions

## Gemma changes

- Removed fixed right panel
- Floating orb + contextual insight chip
- Drawer conversation with page context
- `/gemma` redesigned as intelligence center (not chatbot-only)
- Provider labels not shown as “Demo Mode” in product UI

## Components created/updated

- `WalletBar`, `FloatingGemma`, `OnePaperModal`
- `CategoryDonut`, `AssetBar`
- Resource `conversion` service
- Allocation dual-settlement + verify API
- Project cards with cover/branding
- Markdown renderer
- Dark design tokens in `globals.css`

## Tests run

- `npm run typecheck`
- `npm run test` (conversion, settlement, seed, proof hash)
- `npm run lint`
- `npm run build`

## Known limitations

- Media gallery uses branded gradient placeholders (modular for final assets)
- Live AMD/Fireworks still deferred
- Verification is a controlled product action (not external attestation network)
- Charts are client-rendered (Recharts); fine for MVP density
- Founder UX polished but less redesigned than Investor path

## Screens still needing refinement

- Founder Create Project full wizard
- Mobile wallet dropdown edge cases on very small widths
- Optional guided tour for first-time jurors
- Richer NFT gallery page
