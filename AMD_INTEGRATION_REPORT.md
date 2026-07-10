# AMD Integration Report — Sprint 2

## Docker smoke result

| Item | Result |
| --- | --- |
| Docker CLI on this machine | **Not installed / not in PATH** |
| Compose file | Present — `docker-compose.yml` |
| Dockerfile | Multi-stage Node 22 + better-sqlite3 build deps |
| Volume isolation | `vf-data` volume — **does not touch host `./data`** |
| Bind | `0.0.0.0:3000` via compose ports + `HOSTNAME` |

### Exact commands (for the developer machine with Docker)

```bash
# Preserve local DB: do NOT mount ./data; use compose volume only
docker compose build --no-cache
docker compose up -d
curl -s -o - -w "\nHTTP %{http_code}\n" http://127.0.0.1:3000/api/health
curl -s -o /dev/null -w "landing %{http_code}\n" http://127.0.0.1:3000/
# Login + portfolio require cookie flow via browser or scripted POST /api/demo/login
curl -s http://127.0.0.1:3000/api/gemma/health
docker compose restart
curl -s http://127.0.0.1:3000/api/health
docker compose down
```

**This session could not execute the compose smoke** — Docker binary missing. Files are ready.

## Provider implementation

| Component | Path |
| --- | --- |
| Selection | `src/lib/gemma/index.ts` — `auto` / `amd` / `mock` / `cache` |
| OpenAI client | `src/lib/gemma/openai-client.ts` |
| AMD gateway | `src/lib/gemma/amd-gateway.ts` |
| Context builders | `src/lib/gemma/context-builders.ts` |
| Zod schemas | `src/lib/gemma/schemas.ts` |
| Cache | `src/lib/gemma/cache.ts` |
| Health | `GET /api/gemma/health` |
| Chat | `POST /api/gemma/chat` |
| Quickstart | `POST /api/founder/quickstart` |

## Model used

Default: **`google/gemma-4-12B-it`** (env `GEMMA_MODEL`, configurable).

## Endpoint status

| Check | Status |
| --- | --- |
| App can call OpenAI-compatible `/v1/chat/completions` | Implemented |
| Live AMD host configured in this session | **No** |
| Live response observed in this session | **No** (requires developer AMD VM) |
| Fallback without credentials | **Yes** — Demo/mock path intact |

## Product capabilities connected

| Capability | Live when AMD up | Fallback |
| --- | --- | --- |
| Portfolio briefing | Yes | Mock insight |
| Project due diligence | Yes | Mock insight |
| Proof explanation | Yes (proof page + chat) | Seed/mock summary |
| Contextual chat | Yes | Mock chat |
| Founder Quickstart | Yes | Deterministic draft |
| Stakeholder assist | Yes | Mock assist |

## Live requests confirmed

**Not confirmed in this environment.** Manual steps remaining (below).

## Cache behavior

- In-memory map keyed by SHA-256 context hash
- Default TTL 15 minutes (`GEMMA_CACHE_TTL_MS`)
- Successful AMD responses stored with provider/model/latency/requestId
- Cache hits surface as provider `CACHE` (no false “live AMD” badge)

## Fallback behavior

- Missing config → mock
- Timeout / HTTP error → mock
- Invalid JSON → one corrective retry → mock
- UI shows AMD attribution **only** for `provider === "AMD_GEMMA"`

## Tests

```
npm run test  → 37 passed (includes tests/gemma-provider.test.ts)
npm run lint  → pass (warnings only if any)
npm run typecheck → pass
npm run build → pass
```

Coverage includes: provider selection, request shape, timeout/fallback, cache hit/invalidation, Zod validation, context filtering, health redaction.

## Build result

**PASS** (Next.js production build).

## Remaining limitations

1. Docker smoke not executed here (CLI missing).
2. Live AMD not exercised (no cloud endpoint in session).
3. In-process cache only.
4. vLLM Gemma 4 support depends on ROCm stack version on the VM.

## Exact manual steps still required from the developer

1. Install/start Docker Desktop (or engine) and run the compose smoke commands above.
2. Provision AMD Developer Cloud GPU instance (MI300X recommended).
3. On the VM: `bash infra/amd/verify-gpu.sh`.
4. Set `HF_TOKEN`, accept Gemma license, start server via `infra/amd/start-server.sh`.
5. `bash infra/amd/verify-endpoint.sh` against the server.
6. Point VibeFunding:
   ```env
   GEMMA_PROVIDER=auto
   GEMMA_BASE_URL=http://<amd-host>:8000/v1
   GEMMA_API_KEY=<inference-key>
   GEMMA_MODEL=google/gemma-4-12B-it
   ```
7. Confirm:
   - `GET /api/gemma/health` → `reachable: true`
   - Portfolio / project diligence shows **Gemma 4 · AMD Instinct**
   - Founder Quickstart returns `provider: "AMD_GEMMA"`
8. Drop sanitized evidence into `evidence/amd/`.

## Checkpoint note

Git was not initialized in the workspace at start. Recommend:

```bash
git init
git add -A
git status   # ensure .env and data/*.db are ignored
git commit -m "pre-amd-gemma-integration: demo stable + app-side AMD gateway"
git tag pre-amd-gemma-integration
```

`.env` and `/data` remain in `.gitignore`.
