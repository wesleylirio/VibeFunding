# Optional AMD VM inference

Scripts to run an OpenAI-compatible Gemma server on an AMD GPU host (ROCm / vLLM-style setups).

These are **optional**. The main app talks to Fireworks or OpenRouter via env vars.

| File | Purpose |
| --- | --- |
| `env.example` | Template for the VM + app `GEMMA_*` vars |
| `start-server.sh` | Start serving (edit for your stack) |
| `verify-gpu.sh` | Sanity-check GPU visibility |
| `verify-endpoint.sh` | Probe `/v1/models` and chat without leaking keys |

Do not commit real `HF_TOKEN` or API keys.