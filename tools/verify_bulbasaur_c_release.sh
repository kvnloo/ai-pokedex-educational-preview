#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
ART="$ROOT/artifacts/bulbasaur-C-production"
SOURCE="/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/production/manual-v1/hypothesis-C/bulbasaur_manual_v1_C.blend"
BUILD="$ROOT/tools/build_bulbasaur_c_production.py"
VERIFY="$ROOT/tools/verify_bulbasaur_c_production.py"

# Keep the build/reopen transcript outside the artifact tree while commands are
# still writing it.  Hashing an in-progress `tee` target made the previous
# manifest stale as soon as the final verification lines were appended.
if [[ "${BULBASAUR_C_RELEASE_INNER:-0}" != "1" ]]; then
  TRANSCRIPT="$(mktemp /tmp/bulbasaur-C-verification.XXXXXX.log)"
  trap 'rm -f "$TRANSCRIPT"' EXIT
  BULBASAUR_C_RELEASE_INNER=1 bash "$0" 2>&1 | tee "$TRANSCRIPT"
  cp "$TRANSCRIPT" "$ART/verification.log"

  printf '%s\n' '--- Finalize builder-excluded review packet ---'
  python tools/finalize_bulbasaur_c_packet.py --root "$ART"

  printf '%s\n' '--- Exact artifact hash gate ---'
  (
    cd "$ART"
    sha256sum -c HASHES.sha256
  )
  printf '%s\n' 'FINAL_VERIFICATION_PASS'
  exit 0
fi

printf 'VERIFY_ROOT=%s\n' "$ROOT"
printf 'VERIFY_ARTIFACT_ROOT=%s\n' "$ART"
printf '%s\n' '--- Blender version ---'
blender --version

printf '%s\n' '--- Python syntax ---'
python -m py_compile \
  tools/bulbasaur_c_contract.py \
  tools/build_bulbasaur_c_production.py \
  tools/verify_bulbasaur_c_production.py \
  tools/hash_frozen_bulbasaur_evidence.py \
  tools/finalize_bulbasaur_c_packet.py

printf '%s\n' '--- Immutable source hashes before build ---'
sha256sum \
  "$SOURCE" \
  /mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/production/manual-v1/blind-packet-v1/BALLOT.json \
  /mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/production/manual-v1/blind-packet-v1/X01-12role.png \
  /mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/production/manual-v1/blind-packet-v1/X02-12role.png \
  /mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/production/manual-v1/blind-packet-v1/X03-12role.png
python tools/hash_frozen_bulbasaur_evidence.py

printf '%s\n' '--- Fresh Blender 5.2 factory-startup build ---'
BULBASAUR_C_OUTPUT="$ART" blender \
  --background \
  --factory-startup "$SOURCE" \
  --python-exit-code 1 \
  --python "$BUILD"

printf '%s\n' '--- Fresh reopen verification ---'
BULBASAUR_C_QA_OUT="$ART/qa-final.json" blender \
  --background \
  --python-exit-code 1 \
  "$ART/bulbasaur_C_production.blend" \
  --python "$VERIFY"

printf '%s\n' '--- Relocated-copy reopen verification ---'
RELOCATED="$(mktemp -d /tmp/bulbasaur-C-relocated.XXXXXX)"
cp -a "$ART/." "$RELOCATED/"
BULBASAUR_C_QA_OUT="$RELOCATED/qa-relocated.json" blender \
  --background \
  --python-exit-code 1 \
  "$RELOCATED/bulbasaur_C_production.blend" \
  --python "$VERIFY"
cp "$RELOCATED/qa-relocated.json" "$ART/qa-relocated.json"
printf '%s\n' "$RELOCATED" > "$ART/relocated-path.txt"
printf 'RELOCATED_ROOT=%s\n' "$RELOCATED"

printf '%s\n' '--- Immutable evidence hash after Blender runs ---'
python tools/hash_frozen_bulbasaur_evidence.py --output "$ART/frozen-inputs-after.json"

printf '%s\n' '--- Product gates ---'
npm run typecheck
npm run build

git diff --check

test ! -e "$ART/bulbasaur_C_production.blend1"
