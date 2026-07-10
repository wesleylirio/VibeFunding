#!/usr/bin/env bash
# Start an OpenAI-compatible inference server for Gemma on AMD ROCm.
# Prefer vLLM when the installed build supports Gemma 4.
# This script is a template — adapt versions to the VM image.
set -euo pipefail

MODEL="${HF_MODEL:-google/gemma-4-12B-it}"
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
API_KEY="${INFERENCE_API_KEY:-}"

if [[ -z "${HF_TOKEN:-}" ]]; then
  echo "HF_TOKEN is required to download gated models."
  exit 1
fi

export HUGGING_FACE_HUB_TOKEN="$HF_TOKEN"

echo "Model: $MODEL"
echo "Bind:  ${HOST}:${PORT}"

if python3 -c "import vllm" 2>/dev/null; then
  echo "Starting vLLM OpenAI server..."
  # If this fails with unsupported model architecture, do NOT silently switch to Gemma 2.
  # Upgrade vLLM / serving stack or use the transformers path below.
  EXTRA=()
  if [[ -n "$API_KEY" ]]; then
    EXTRA+=(--api-key "$API_KEY")
  fi
  exec python3 -m vllm.entrypoints.openai.api_server \
    --model "$MODEL" \
    --host "$HOST" \
    --port "$PORT" \
    --dtype auto \
    "${EXTRA[@]}"
else
  echo "vLLM not installed. Falling back to a minimal Transformers/PyTorch OpenAI-style server is required."
  echo "Install a ROCm-compatible vLLM build that supports Gemma 4, or deploy your chosen OpenAI-compatible stack."
  echo "Do not downgrade to Gemma 2 without updating GEMMA_MODEL intentionally."
  exit 2
fi
