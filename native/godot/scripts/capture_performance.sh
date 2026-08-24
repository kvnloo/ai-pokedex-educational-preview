#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT="$ROOT/native/godot"
GODOT="${GODOT4:-/home/kvn/.local/bin/godot4}"
EVIDENCE="$PROJECT/evidence"
FRAMES="${1:-600}"
[[ "$FRAMES" =~ ^[1-9][0-9]*$ ]] || { echo "frames must be a positive integer" >&2; exit 2; }
mkdir -p "$EVIDENCE"

"$GODOT" --display-driver x11 --audio-driver Dummy --path "$PROJECT" --rendering-method forward_plus --rendering-driver vulkan --windowed --position 10000,10000 -- \
  --report="$EVIDENCE/performance-report.json" \
  --capture="$EVIDENCE/native-preflight.png" \
  --warmup=60 \
  --frames="$FRAMES" 2>&1 | tee "$EVIDENCE/performance-log.txt"

grep -F "Vulkan" "$EVIDENCE/performance-log.txt" >/dev/null
grep -F "NVIDIA GeForce RTX 3080 Ti" "$EVIDENCE/performance-log.txt" >/dev/null
grep -Eiq "llvmpipe|lavapipe|swiftshader|software raster" "$EVIDENCE/performance-log.txt" && {
  echo "software renderer detected" >&2
  exit 1
}
test -s "$EVIDENCE/native-preflight.png"
test -s "$EVIDENCE/performance-report.json"
