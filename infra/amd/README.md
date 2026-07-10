# AMD Developer Cloud — Gemma serving for VibeFunding

This directory documents how to host **Gemma 4** (`google/gemma-4-12B-it` recommended, configurable) on AMD Developer Cloud and connect it to VibeFunding through environment variables.

**Important:** Commands below are the intended runbook. Only mark a step as tested if you executed it on your VM.

## Architecture

```text
VibeFunding (Next.js, server-side)
   GEMMA_BASE_URL + GEMMA_API_KEY
            │
            ▼
OpenAI-compatible /v1/chat/completions
            │
            ▼
AMD Instinct GPU (e.g. MI300X) + ROCm serving stack
```

## 1. Confirm MI300X / GPU visibility

On the AMD VM:

```bash
bash infra/amd/verify-gpu.sh
# or:
rocm-smi
```

Expect a visible AMD Instinct device. If `rocm-smi` fails, fix ROCm drivers before serving.

## 2. Confirm PyTorch can use the GPU

```bash
python3 - <<'PY'
import torch
print(torch.__version__, getattr(torch.version, "hip", None), torch.cuda.is_available())
if torch.cuda.is_available():
    print(torch.cuda.get_device_name(0))
PY
```

## 3. Hugging Face token (secure)

1. Create a token with access to the chosen Gemma model license.
2. Export only in the VM session or a root-owned env file **outside git**:

```bash
export HF_TOKEN=...   # never commit
export HUGGING_FACE_HUB_TOKEN=$HF_TOKEN
```

Accept the model license on Hugging Face for `google/gemma-4-12B-it` (or your configured model).

## 4. Download the model

With HF access configured, the serving stack will pull weights on first start. You may pre-download with `huggingface-cli download google/gemma-4-12B-it`.

## 5. Start OpenAI-compatible server

Prefer **vLLM** on ROCm when the installed build supports Gemma 4:

```bash
export HF_MODEL=google/gemma-4-12B-it
export HOST=0.0.0.0
export PORT=8000
export INFERENCE_API_KEY=choose-a-long-random-string
bash infra/amd/start-server.sh
```

If vLLM rejects Gemma 4:

- **Do not silently downgrade to Gemma 2.**
- Upgrade to a serving stack that supports Gemma 4, or deploy a Transformers/PyTorch OpenAI-compatible server.
- Record the incompatibility in your notes.

## 6. Bind and test

```bash
export GEMMA_BASE_URL=http://127.0.0.1:8000/v1
export GEMMA_API_KEY=$INFERENCE_API_KEY
export GEMMA_MODEL=google/gemma-4-12B-it
bash infra/amd/verify-endpoint.sh
```

Checks:

- `GET /v1/models`
- One `POST /v1/chat/completions`

## 7. Connect VibeFunding

On the app host (local or Docker Compose):

```env
GEMMA_PROVIDER=auto
GEMMA_BASE_URL=http://YOUR_AMD_HOST:8000/v1
GEMMA_API_KEY=your-inference-api-key
GEMMA_MODEL=google/gemma-4-12B-it
GEMMA_TIMEOUT_MS=30000
GEMMA_MAX_OUTPUT_TOKENS=2048
```

App diagnostics (server-side, redacted):

```bash
curl -s http://127.0.0.1:3000/api/gemma/health
```

## 8. Shutdown and destroy cloud resources

1. Stop the inference server process.
2. Stop the VibeFunding app.
3. Unset tokens from the shell history/session.
4. Destroy the AMD Developer Cloud instance from the cloud console when finished to avoid cost.

## Security

- Never put `GEMMA_API_KEY` or `HF_TOKEN` in client bundles.
- Never commit `.env` files with secrets.
- Prefer firewall rules so only the app host can reach the inference port.
