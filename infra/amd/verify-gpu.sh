#!/usr/bin/env bash
# Run on the AMD Developer Cloud VM. Does not print secrets.
set -euo pipefail

echo "== GPU visibility =="
if command -v rocm-smi >/dev/null 2>&1; then
  rocm-smi
elif command -v rocminfo >/dev/null 2>&1; then
  rocminfo | head -n 80
else
  echo "rocm-smi/rocminfo not found in PATH"
fi

echo
echo "== PyTorch ROCm probe =="
python3 - <<'PY'
import sys
try:
    import torch
    print("torch", torch.__version__)
    print("hip", getattr(torch.version, "hip", None))
    print("cuda_available_alias", torch.cuda.is_available())
    if torch.cuda.is_available():
        print("device0", torch.cuda.get_device_name(0))
        x = torch.randn(1024, 1024, device="cuda")
        y = x @ x
        print("matmul_ok", float(y.mean()))
    else:
        print("No GPU visible to torch")
        sys.exit(2)
except Exception as e:
    print("PyTorch probe failed:", type(e).__name__, str(e)[:200])
    sys.exit(1)
PY
