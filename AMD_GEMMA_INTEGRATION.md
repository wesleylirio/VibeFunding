# AMD Gemma integration — VibeFunding

## Status

**Application-side integration is implemented** with graceful fallbacks.  
**Live AMD inference was not executed in this environment** because Docker CLI and an AMD Developer Cloud endpoint were not available on the build machine. Connect credentials using the steps below to go live.

## Hardware / model targets

| Item | Value |
| --- | --- |
| Recommended GPU | AMD Instinct (e.g. MI300X on AMD Developer Cloud) |
| Recommended model | `google/gemma-4-12B-it` (configurable) |
| Serving contract | OpenAI-compatible `POST /v1/chat/completions` |
| Preferred stack | vLLM on ROCm when Gemma 4 is supported by the installed build |

## Application contexts using Gemma

| Capability | Entry | Live path |
| --- | --- | --- |
| Portfolio briefing | `gateway.analyzePortfolio` via `/portfolio`, chat intents | AMD JSON → Zod validate → cache |
| Project due diligence | `gateway.analyzeProject` via project page + chat | same |
| Proof explanation | `gateway.summarizeProof` via proof chat / page data | same |
| Contextual chat | `gateway.chat` via floating Gemma `/api/gemma/chat` | same |
| Founder Quickstart | `AmdGemmaGateway.generateQuickstart` | live draft or deterministic fallback |
| Stakeholder assist | `gateway.assistFounder` | live JSON or fallback |

## Configuration flow

```env
GEMMA_PROVIDER=auto
GEMMA_BASE_URL=http://YOUR_AMD_HOST:8000/v1
GEMMA_API_KEY=your-inference-api-key
GEMMA_MODEL=google/gemma-4-12B-it
GEMMA_TIMEOUT_MS=30000
GEMMA_MAX_OUTPUT_TOKENS=2048
GEMMA_CACHE_TTL_MS=900000
```

Provider modes:

| Mode | Behavior |
| --- | --- |
| `auto` | Attempt AMD when URL+key set; fallback on failure |
| `amd` | Prefer AMD; still fallback so product never crashes |
| `mock` / `demo` | Deterministic only |
| `cache` | Cached mock wrapper |

## Health check

```bash
curl -s http://127.0.0.1:3000/api/gemma/health
```

Example shape (no secrets):

```json
{
  "configured": true,
  "reachable": true,
  "provider": "amd",
  "mode": "auto",
  "model": "google/gemma-4-12B-it",
  "latencyMs": 824,
  "lastCheckedAt": "...",
  "willAttemptLive": true,
  "endpointConfigured": true
}
```

## Example sanitized request

```json
{
  "model": "google/gemma-4-12B-it",
  "messages": [
    {
      "role": "system",
      "content": "You are Gemma, the VibeFunding portfolio copilot..."
    },
    {
      "role": "user",
      "content": "Context JSON: {\"name\":\"CollabMesh\", ...}\n\nPerform due diligence..."
    }
  ],
  "temperature": 0.2,
  "max_tokens": 2048,
  "response_format": { "type": "json_object" }
}
```

## Example sanitized response (structure)

```json
{
  "id": "chatcmpl-…",
  "model": "google/gemma-4-12B-it",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "{\"title\":\"CollabMesh due diligence\",\"summary\":\"...\",\"risks\":[],\"strengths\":[]}"
      }
    }
  ]
}
```

UI attribution when `provider === "AMD_GEMMA"`:

`Gemma 4 · AMD Instinct`

## Fallback design

```text
AMD live call
  → success + Zod OK → cache + return (AMD attribution)
  → malformed JSON → one corrective retry
  → still invalid / timeout / HTTP error → Mock/deterministic (no false AMD claim)
```

## Security boundaries

- All inference is **server-side only**
- Context builders strip private agent payloads, passwords, env, cookies
- Health endpoint redacts bearer tokens
- `.env` is gitignored
- No endpoint IP or API key in the UI

## Serving runbook

See `infra/amd/README.md` and scripts:

- `verify-gpu.sh`
- `verify-endpoint.sh`
- `start-server.sh`
- `env.example`

## Evidence

Place real screenshots/logs in `evidence/amd/` after you run the AMD VM. Do not fabricate evidence.

## Limitations

- Live AMD not verified on this developer workstation (no Docker CLI / no cloud endpoint in session).
- If installed vLLM lacks Gemma 4 support, upgrade the serving stack — do not silently use Gemma 2.
- Cache is in-process memory (resets on app restart).
