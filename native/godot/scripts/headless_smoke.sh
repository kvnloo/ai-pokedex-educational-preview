#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT="$ROOT/native/godot"
GODOT="${GODOT4:-/home/kvn/.local/bin/godot4}"
EVIDENCE="${NATIVE_EVIDENCE_DIR:-$PROJECT/evidence}"
mkdir -p "$EVIDENCE"

"$GODOT" --headless --path "$PROJECT" --editor --import --quit --rendering-method forward_plus --rendering-driver vulkan 2>&1 | tee "$EVIDENCE/headless-import-log.txt"
"$GODOT" --headless --path "$PROJECT" -- --contract-only --report="$EVIDENCE/literal-headless-report.json" 2>&1 | tee "$EVIDENCE/literal-headless-log.txt"
# Godot's literal --headless mode selects the dummy renderer. Run the automated
# non-interactive smoke offscreen on the existing X11 display so Forward+ stays
# on Vulkan; the application exits itself after a bounded frame count.
GODOT_ARGS=(--display-driver x11 --audio-driver Dummy --path "$PROJECT" --rendering-method forward_plus --rendering-driver vulkan --windowed --resolution 960x540 --position 10000,10000 -- --report="$EVIDENCE/headless-report.json" --frames=24)
if [[ -n "${HYPRLAND_INSTANCE_SIGNATURE:-}" ]] && command -v hyprctl >/dev/null; then
  "$GODOT" "${GODOT_ARGS[@]}" >"$EVIDENCE/offscreen-vulkan-log.txt" 2>&1 &
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
    echo "failed to locate Godot window for exact-size Hyprland smoke" >&2
    exit 1
  fi
  status=0
  wait "$godot_pid" || status=$?
  cat "$EVIDENCE/offscreen-vulkan-log.txt"
  (( status == 0 )) || exit "$status"
else
  "$GODOT" "${GODOT_ARGS[@]}" 2>&1 | tee "$EVIDENCE/offscreen-vulkan-log.txt"
fi

grep -F "NVIDIA GeForce RTX 3080 Ti" "$EVIDENCE/offscreen-vulkan-log.txt" >/dev/null
grep -Eiq "llvmpipe|lavapipe|swiftshader|software raster" "$EVIDENCE/offscreen-vulkan-log.txt" && {
  echo "software renderer detected" >&2
  exit 1
}
python "$ROOT/contracts/native/generate_bindings.py" --check >/dev/null
