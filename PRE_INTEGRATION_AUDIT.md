# PRE_INTEGRATION_AUDIT — VibeFunding

Companion to `answer.md` (full section-by-section answers).

## Feature matrix

| # | Area | Status | Primary routes / files |
| --- | --- | --- | --- |
| 1 | Brand identity | IMPLEMENTED AND FUNCTIONAL | `components/brand/logo.tsx`, `globals.css`, `public/favicon.svg` |
| 2 | Themes | IMPLEMENTED AND FUNCTIONAL | `lib/brand/theme.tsx`, `app/layout.tsx` |
| 3 | Landing | IMPLEMENTED AND FUNCTIONAL | `/` `app/page.tsx` |
| 4 | Demo login/session | IMPLEMENTED AND FUNCTIONAL | `/login`, `lib/demo/juror-session.ts`, `api/demo/*` |
| 5 | Investor onboarding | IMPLEMENTED AND FUNCTIONAL | `components/investor/onboarding-card.tsx`, `/portfolio` |
| 6 | Founder Quickstart | IMPLEMENTED AND FUNCTIONAL (deterministic) | `/founder/quickstart`, `lib/founder/quickstart.ts` |
| 7 | Community | IMPLEMENTED AND FUNCTIONAL | `/projects/[slug]/community`, `lib/queries/community.ts` |
| 8 | External presence | IMPLEMENTED AND FUNCTIONAL | `components/projects/social-links.tsx` |
| 9 | Project identity | PARTIALLY IMPLEMENTED | `/projects/[slug]` — media placeholders |
| 10 | Gemma identity | IMPLEMENTED AND FUNCTIONAL (mock) | `floating-gemma.tsx`, `gemma-orb.tsx`, `/gemma` |
| 11 | Wallet | IMPLEMENTED AND FUNCTIONAL | `components/wallet/wallet-bar.tsx` |
| 12 | Allocation semantics | IMPLEMENTED AND FUNCTIONAL | `lib/resources/conversion.ts`, `lib/portfolio/allocate.ts` |
| 13 | Reward UX | IMPLEMENTED AND FUNCTIONAL | `allocation-modal.tsx` |
| 14 | Agent Observability | IMPLEMENTED AND FUNCTIONAL | `agent-replay.tsx`, `/projects/.../agents` |
| 15 | Proof of Build | IMPLEMENTED AND FUNCTIONAL | `/proofs/[id]`, `lib/queries/proofs.ts` |
| 16 | Navigation | IMPLEMENTED AND FUNCTIONAL | shell + project tabs |
| 17 | Responsive | IMPLEMENTED AND FUNCTIONAL | Tailwind breakpoints |
| 18 | Regression path | IMPLEMENTED AND FUNCTIONAL | code + unit tests |
| 19 | Technical | PASS | typecheck/test/lint/build |

## Regressions found

None that break prior vertical-slice functionality.

## Regressions fixed (this audit)

1. Login allowed empty password → now requires non-empty (never stored).
2. Wallet missing settled contributions list → added.
3. Founder Quickstart showed fixed “Founder” name → loads juror session.
4. Double-confirm on allocate → ignored while pending/success.
5. Legacy SIMULATED badge helper cleaned.

## Presentational-only features

- Project media/video placeholders  
- Quickstart step animation  
- Gradient project covers (not uploaded images)  

## Mock / deterministic features

- Gemma responses (`MockGemmaGateway` / `CachedGemmaGateway`)  
- Founder Quickstart draft generation  
- Agent event replay  
- Demo social URLs  

## Persistent features

- SQLite: users, projects, rounds, allocations, holdings, community, proofs, runs  
- Cookie juror identity  
- Theme + wallet visibility in localStorage  

## Remaining P0 bugs

None open.

## Remaining P1 polish

- Allocate server idempotency keys  
- Docker clean-machine smoke before jury  
- Archive unused `gemma-panel.tsx`  
- Replace media placeholders with final assets  
- Light-mode visual QA on dense timelines  

## Tests executed

```
npm run typecheck  → pass
npm run test       → 22/22 pass
npm run lint       → pass
npm run build      → pass (this session)
```

## Docker result

Dockerfile + docker-compose present and configured for `0.0.0.0:3000` + healthcheck. Full compose rebuild **not re-executed** in this audit pass.

## Ready for AMD/Gemma integration?

**Yes.** Keep Demo Mode default; enable live gateway via env; preserve fallbacks.

### Final checklist answers

1. Investor journey: **Yes**  
2. Founder Quickstart: **Yes** (deterministic)  
3. Community: **Yes**, persistent  
4. Resource normalization: **Yes**  
5. Pending productive contributions: **Yes**  
6. Token/NFT settlement: **Yes**  
7. Gemma live-ready structure: **Yes**  
8. No visible Demo Mode in active UI: **Yes**  
9. Themes complete: **Yes**  
10. Recognizable identity: **Yes**  
11. Regressions: **No material regressions**  
12. Docker ready for evaluation: **Structurally yes**  
13. Top risks: live model reliability; native SQLite in Docker; content finalization  
14. Next task: **AMD/Gemma integration**  
