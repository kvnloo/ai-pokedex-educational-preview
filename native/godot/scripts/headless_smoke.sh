#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT="$ROOT/native/godot"
GODOT="${GODOT4:-/home/kvn/.local/bin/godot4}"
EVIDENCE="$PROJECT/evidence"
mkdir -p "$EVIDENCE"

"$GODOT" --headless --path "$PROJECT" --editor --import --quit --rendering-method forward_plus --rendering-driver vulkan 2>&1 | tee "$EVIDENCE/headless-import-log.txt"
"$GODOT" --headless --path "$PROJECT" -- --contract-only --report="$EVIDENCE/literal-headless-report.json" 2>&1 | tee "$EVIDENCE/literal-headless-log.txt"
# Godot's literal --headless mode selects the dummy renderer. Run the automated
# non-interactive smoke offscreen on the existing X11 display so Forward+ stays
# on Vulkan; the application exits itself after a bounded frame count.
"$GODOT" --display-driver x11 --audio-driver Dummy --path "$PROJECT" --rendering-method forward_plus --rendering-driver vulkan --windowed --position 10000,10000 -- --report="$EVIDENCE/headless-report.json" --frames=24 2>&1 | tee "$EVIDENCE/offscreen-vulkan-log.txt"

grep -F "NVIDIA GeForce RTX 3080 Ti" "$EVIDENCE/offscreen-vulkan-log.txt" >/dev/null
grep -Eiq "llvmpipe|lavapipe|swiftshader|software raster" "$EVIDENCE/offscreen-vulkan-log.txt" && {
  echo "software renderer detected" >&2
  exit 1
}
python "$ROOT/contracts/native/generate_bindings.py" --check >/dev/null
