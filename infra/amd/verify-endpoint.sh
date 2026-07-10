#!/usr/bin/env bash
# Probe an OpenAI-compatible Gemma endpoint without echoing secrets.
set -euo pipefail

BASE_URL="${GEMMA_BASE_URL:-http://127.0.0.1:8000/v1}"
API_KEY="${GEMMA_API_KEY:-${INFERENCE_API_KEY:-}}"
MODEL="${GEMMA_MODEL:-google/gemma-4-12B-it}"

if [[ -z "$API_KEY" ]]; then
  echo "Set GEMMA_API_KEY or INFERENCE_API_KEY"
  exit 1
fi

BASE_URL="${BASE_URL%/}"
echo "Checking models at ${BASE_URL}/models (key redacted)"
curl -sS -H "Authorization: Bearer ${API_KEY}" "${BASE_URL}/models" | head -c 500
echo
echo
echo "Chat probe..."
curl -sS "${BASE_URL}/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d "{\"model\":\"${MODEL}\",\"messages\":[{\"role\":\"user\",\"content\":\"Reply with ok\"}],\"max_tokens\":8,\"temperature\":0}" \
  | head -c 800
echo
