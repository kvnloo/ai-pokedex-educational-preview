#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT="$ROOT/native/godot"
GODOT="${GODOT4:-/home/kvn/.local/bin/godot4}"
EVIDENCE="$PROJECT/evidence"
mkdir -p "$EVIDENCE"

blender --background --python "$PROJECT/assets/source/build_synthetic_beacon.py" 2>&1 | tee "$EVIDENCE/blender-export-log.txt"
"$GODOT" --headless --path "$PROJECT" --editor --import --quit 2>&1 | tee "$EVIDENCE/godot-import-log.txt"
python "$PROJECT/tools/verify_import.py" --project "$PROJECT" --output "$EVIDENCE/import-verification.json"
