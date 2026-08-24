#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT="$ROOT/native/godot"
GODOT="${GODOT4:-/home/kvn/.local/bin/godot4}"
EVIDENCE="${NATIVE_EVIDENCE_DIR:-$PROJECT/evidence}"
FRAMES="${1:-600}"
[[ "$FRAMES" =~ ^[1-9][0-9]*$ ]] || { echo "frames must be a positive integer" >&2; exit 2; }
mkdir -p "$EVIDENCE"

GODOT_ARGS=(
  --display-driver x11
  --audio-driver Dummy
  --path "$PROJECT"
  --rendering-method forward_plus
  --rendering-driver vulkan
  --windowed
  --resolution 960x540
  --position 10000,10000
  --
  --report="$EVIDENCE/performance-report.json"
  --capture="$EVIDENCE/native-preflight.png"
  --warmup=60
  --frames="$FRAMES"
)

if [[ -n "${HYPRLAND_INSTANCE_SIGNATURE:-}" ]] && command -v hyprctl >/dev/null; then
  "$GODOT" "${GODOT_ARGS[@]}" >"$EVIDENCE/performance-log.txt" 2>&1 &
  godot_pid=$!
  adjusted=false
  for _ in {1..400}; do
    if hyprctl clients -j 2>/dev/null | grep -Fq "\"pid\": $godot_pid"; then
      hyprctl dispatch setfloating "pid:$godot_pid" >/dev/null
      hyprctl dispatch resizewindowpixel "exact 960 540,pid:$godot_pid" >/dev/null
      hyprctl dispatch movetoworkspacesilent "special:native-godot,pid:$godot_pid" >/dev/null
      adjusted=true
      break
    fi
    sleep 0.05
  done
  if [[ "$adjusted" != true ]]; then
    kill "$godot_pid" 2>/dev/null || true
    wait "$godot_pid" 2>/dev/null || true
    echo "failed to locate Godot window for exact-size Hyprland evidence" >&2
    exit 1
  fi
  status=0
  wait "$godot_pid" || status=$?
  cat "$EVIDENCE/performance-log.txt"
  (( status == 0 )) || exit "$status"
else
  "$GODOT" "${GODOT_ARGS[@]}" 2>&1 | tee "$EVIDENCE/performance-log.txt"
fi

grep -F "Vulkan" "$EVIDENCE/performance-log.txt" >/dev/null
grep -F "NVIDIA GeForce RTX 3080 Ti" "$EVIDENCE/performance-log.txt" >/dev/null
grep -Eiq "llvmpipe|lavapipe|swiftshader|software raster" "$EVIDENCE/performance-log.txt" && {
  echo "software renderer detected" >&2
  exit 1
}
test -s "$EVIDENCE/native-preflight.png"
test -s "$EVIDENCE/performance-report.json"
python - "$EVIDENCE/native-preflight.png" "$EVIDENCE/performance-report.json" <<'PY'
import json
import struct
import sys
from pathlib import Path

png_path, report_path = map(Path, sys.argv[1:])
png = png_path.read_bytes()
if png[:8] != b"\x89PNG\r\n\x1a\n":
    raise SystemExit(f"not a PNG: {png_path}")
png_dimensions = list(struct.unpack(">II", png[16:24]))
report = json.loads(report_path.read_text(encoding="utf-8"))
expected = [960, 540]
for field in ("requested_dimensions", "window_dimensions", "viewport_dimensions", "drawing_buffer_dimensions"):
    if report.get(field) != expected:
        raise SystemExit(f"{field} mismatch: expected {expected}, got {report.get(field)}")
if png_dimensions != expected:
    raise SystemExit(f"PNG dimensions mismatch: expected {expected}, got {png_dimensions}")
PY
