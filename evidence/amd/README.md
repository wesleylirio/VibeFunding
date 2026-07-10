# Evidence pack — AMD Gemma (manual)

Place real artifacts here after you run the AMD stack. **Do not fabricate screenshots or logs.**

Suggested files:

| File | Description |
| --- | --- |
| `gpu-rocm.png` | Screenshot of `rocm-smi` or cloud GPU panel |
| `amd-cloud.png` | AMD Developer Cloud instance view |
| `server-log.txt` | Sanitized inference server startup log |
| `chat-sample.json` | Sanitized successful chat completion (no secrets) |
| `ui-live-attribution.png` | VibeFunding UI showing “Gemma 4 · AMD Instinct” |
| `health.json` | Output of `GET /api/gemma/health` (already redacted) |

Sanitize before adding:

- API keys
- Bearer tokens
- Internal IPs if policy requires
- User personal data
