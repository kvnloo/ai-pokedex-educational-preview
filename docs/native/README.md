# Native Godot/Vulkan contract preflight

This is an independent synthetic renderer/client preflight. It is not a Kanto port, a second gameplay implementation, or a claim that the current browser renderer is wgpu. The browser remains a separate client and may progressively adopt measured WebGPU/WASM paths.

## Authority boundary

Godot owns only rendering, camera, local input collection and renderer telemetry. It loads the versioned engine-neutral fixtures under `contracts/native/`, emits movement intents, and consumes ordered battle events. It does not own world, battle, story, save, inventory, economy, backend or asset-recipe databases. `contracts/native/v1/contract.json` explicitly marks the client `intent_only_client: true`; the generated GDScript binding is derived by `contracts/native/generate_bindings.py`.

The committed fixtures are deliberately synthetic and CC0. No ROM, official/private Pokémon asset, Kanto content, copied database or private reference is present. Matching the synthetic replay hash proves only this preflight contract path, not browser/backend or production-content parity.

## Pinned tools and GPU

- Godot: `/home/kvn/.local/bin/godot4`, expected `4.7.2.stable.official.ed1daf0bf`.
- Blender: 5.2.0 LTS Python API for the synthetic GLB.
- Render path: Godot Forward+ / Vulkan on `NVIDIA GeForce RTX 3080 Ti`.
- Official release provenance, archive checksum and live Vulkan enumeration are in `evidence/`.

Godot 4.7.2 advertises the `headless` display driver with only the `dummy` rendering driver. Therefore the smoke script is fail-closed and records both modes:

1. literal `--headless` validates fixture loading, GLB resource loading, intent consumption and replay hashing without rendering;
2. an automated offscreen X11 run at position `10000,10000` performs the real Forward+/Vulkan render and rejects llvmpipe, lavapipe, SwiftShader, generic software-renderer strings, or any adapter other than the RTX 3080 Ti.

This distinction avoids falsely claiming Vulkan rendering from Godot's literal dummy headless mode.

## Reproduce

From the worktree root:

```sh
python contracts/native/generate_bindings.py --check
bash native/godot/scripts/verify_import.sh
bash native/godot/scripts/headless_smoke.sh
bash native/godot/scripts/capture_performance.sh 600
python -m unittest discover -s tests/native -v
```

Interactive windowed launch:

```sh
/home/kvn/.local/bin/godot4 --display-driver x11 --rendering-driver vulkan --rendering-method forward_plus --path native/godot -- --frames=36000
```

Literal non-rendering headless launch:

```sh
/home/kvn/.local/bin/godot4 --headless --path native/godot -- --contract-only --report=native/godot/evidence/literal-headless-report.json
```

The scripts accept `GODOT4=/path/to/godot4` when the pinned symlink is unavailable.

## Blender → GLB → Godot

`assets/source/build_synthetic_beacon.py` clears Blender, creates a low-poly emissive beacon from primitives and exports `assets/generated/synthetic_beacon.glb`. It writes a content hash and CC0 provenance record. `verify_import.sh` rebuilds it, invokes Godot's importer and fails unless exactly one imported PackedScene exists and provenance/hash checks pass.

## Deterministic contract result

The movement intent resolves to synthetic cell `[1, 0]`. Three authoritative damage events produce canonical final state:

`native-preflight/v1|training_red:7|training_blue:0|winner:training_red|events:3`

SHA-256: `64ba98824cdb8f2d4c0aa31c51bcb235438361d23d985b5d642659b36629653e`.

## Durable evidence

- `evidence/environment.txt`: official build/version/checksum and live GPU/Vulkan proof.
- `evidence/direction-hashes.txt`: hash binding to the synced governing prompt and dual-frontend docs.
- `evidence/import-verification.json`: synthetic GLB provenance/import result.
- `evidence/literal-headless-report.json`: non-rendering contract-only headless result.
- `evidence/headless-report.json`: automated offscreen Forward+/Vulkan smoke result.
- `evidence/performance-report.json`: warmed native frame telemetry.
- `evidence/native-preflight.png`: genuine viewport capture.
- `evidence/*-log.txt`: raw Blender, Godot import, headless and Vulkan device output.

The capture is a deterministic synthetic two-cell scene at 960×540. Its performance numbers are preflight telemetry, not evidence for the separate 2560×1440 production gate and not a visual-quality promotion.
