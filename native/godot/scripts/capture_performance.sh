#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT="$ROOT/native/godot"
GODOT="${GODOT4:-/home/kvn/.local/bin/godot4}"
EVIDENCE="${NATIVE_EVIDENCE_DIR:-$PROJECT/evidence}"
FRAMES="${1:-600}"
TIER="${2:-preflight}"
[[ "$FRAMES" =~ ^[1-9][0-9]*$ ]] || { echo "frames must be a positive integer" >&2; exit 2; }
mkdir -p "$EVIDENCE"

if [[ "$TIER" == "preflight" ]]; then
  WIDTH=960
  HEIGHT=540
  P95_BUDGET=0
  P99_BUDGET=0
  SHADER_PREWARM=60
  REPORT_NAME=performance-report.json
  CAPTURE_NAME=native-preflight.png
  LOG_NAME=performance-log.txt
  PREWARM_ARG=()
else
  CONFIG="$PROJECT/config/rtx-3080ti-forward-plus.json"
  IFS=$'\t' read -r WIDTH HEIGHT P95_BUDGET P99_BUDGET SHADER_PREWARM TARGET_HARDWARE < <(
    python "$PROJECT/tools/performance_tier.py" "$CONFIG" "$TIER"
  )
  REPORT_NAME=performance-1440p-report.json
  CAPTURE_NAME=native-kanto-1440p.png
  LOG_NAME=performance-1440p-log.txt
  "$GODOT" --headless --editor --path "$PROJECT" --quit-after 2 >"$EVIDENCE/import-prewarm-log.txt" 2>&1
  PREWARM_ARG=(--import-prewarmed)
fi

GODOT_ARGS=(
  --display-driver x11
  --audio-driver Dummy
  --path "$PROJECT"
  --rendering-method forward_plus
  --rendering-driver vulkan
  --windowed
  --resolution "${WIDTH}x${HEIGHT}"
  --position 10000,10000
  --
  --report="$EVIDENCE/$REPORT_NAME"
  --capture="$EVIDENCE/$CAPTURE_NAME"
  --resolution="${WIDTH}x${HEIGHT}"
  --performance-tier="$TIER"
  --p95-budget-ms="$P95_BUDGET"
  --p99-budget-ms="$P99_BUDGET"
  --shader-prewarm-frames="$SHADER_PREWARM"
  --warmup="$SHADER_PREWARM"
  --frames="$FRAMES"
  "${PREWARM_ARG[@]}"
)

if [[ -n "${HYPRLAND_INSTANCE_SIGNATURE:-}" ]] && command -v hyprctl >/dev/null; then
  "$GODOT" "${GODOT_ARGS[@]}" >"$EVIDENCE/$LOG_NAME" 2>&1 &
  godot_pid=$!
  adjusted=false
  for _ in {1..400}; do
    if hyprctl clients -j 2>/dev/null | grep -Fq "\"pid\": $godot_pid"; then
      hyprctl dispatch setfloating "pid:$godot_pid" >/dev/null
      hyprctl dispatch resizewindowpixel "exact $WIDTH $HEIGHT,pid:$godot_pid" >/dev/null
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
  cat "$EVIDENCE/$LOG_NAME"
  (( status == 0 )) || exit "$status"
else
  "$GODOT" "${GODOT_ARGS[@]}" 2>&1 | tee "$EVIDENCE/$LOG_NAME"
fi

grep -F "Vulkan" "$EVIDENCE/$LOG_NAME" >/dev/null
grep -F "NVIDIA GeForce RTX 3080 Ti" "$EVIDENCE/$LOG_NAME" >/dev/null
grep -Eiq "llvmpipe|lavapipe|swiftshader|software raster" "$EVIDENCE/$LOG_NAME" && {
  echo "software renderer detected" >&2
  exit 1
}
test -s "$EVIDENCE/$CAPTURE_NAME"
test -s "$EVIDENCE/$REPORT_NAME"
python - "$EVIDENCE/$CAPTURE_NAME" "$EVIDENCE/$REPORT_NAME" "$WIDTH" "$HEIGHT" "$TIER" <<'PY'
import json
import struct
import sys
from pathlib import Path

png_path, report_path = map(Path, sys.argv[1:3])
width, height = map(int, sys.argv[3:5])
tier = sys.argv[5]
png = png_path.read_bytes()
if png[:8] != b"\x89PNG\r\n\x1a\n":
    raise SystemExit(f"not a PNG: {png_path}")
png_dimensions = list(struct.unpack(">II", png[16:24]))
report = json.loads(report_path.read_text(encoding="utf-8"))
expected = [width, height]
for field in ("requested_client_dimensions", "client_viewport_dimensions", "drawing_buffer_dimensions"):
    if report.get(field) != expected:
        raise SystemExit(f"{field} mismatch: expected {expected}, got {report.get(field)}")
outer = report.get("outer_window_dimensions")
if not isinstance(outer, list) or len(outer) != 2 or not all(isinstance(value, int) and value > 0 for value in outer):
    raise SystemExit(f"invalid outer_window_dimensions: {outer}")
if report.get("window_decorations_observed") != (outer != expected):
    raise SystemExit("window_decorations_observed does not match measured outer/client dimensions")
if report.get("resize_stable_frames") != 3 or report.get("resize_wait_frames", 0) < 3:
    raise SystemExit(f"client resize did not converge: {report.get('resize_stable_frames')}")
if png_dimensions != expected:
    raise SystemExit(f"PNG dimensions mismatch: expected {expected}, got {png_dimensions}")
if tier != "preflight" and not report.get("performance_gate_passed"):
    raise SystemExit(f"performance tier failed: p95={report.get('p95_frame_ms')}/{report.get('p95_budget_ms')} p99={report.get('p99_frame_ms')}/{report.get('p99_budget_ms')}")
PY
