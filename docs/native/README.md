# Native Godot/Vulkan canonical Kanto client

The approved synthetic renderer/client preflight remains as a legacy fixture, and the native client now consumes the approved canonical Pallet-to-Pewter runtime directly. It is not a second gameplay implementation and does not claim that the current browser renderer is wgpu. The browser remains a separate presentation client.

## Authority boundary

Godot owns only rendering, camera, local input collection and renderer telemetry. Generated GDScript bindings come from `contracts/shared/v1/client-contract.schema.json`. The client reads `canonical/runtime/kanto-opening.json` and `canonical/maps/kanto-opening.json` directly, emits the shared movement intent, consumes ordered replay and save fixtures, and resolves stable Assets-as-Code IDs through the selected `distributable` or `private-local` manifest. It does not own world, battle, story, save, inventory, economy, backend or asset-recipe databases.

The rendered marker remains a clearly classified CC0 synthetic stand-in. The private profile exposes only a non-loadable owner-source receipt; no ROM or private presentation bytes are tracked or loaded. Matching ordered events and the final hash proves shared contract parity, not pixel parity or production visual quality.

## Pinned tools and GPU

- Godot: `/home/kvn/.local/bin/godot4`, expected `4.7.2.stable.official.ed1daf0bf`.
- Blender: 5.2.0 LTS Python API for the synthetic GLB.
- Render path: Godot Forward+ / Vulkan on `NVIDIA GeForce RTX 3080 Ti`.
- Official release provenance, archive checksum and live Vulkan enumeration are in `evidence/`.

Godot 4.7.2 advertises the `headless` display driver with only the `dummy` rendering driver. Therefore the smoke script is fail-closed and records both modes:

1. literal `--headless` validates fixture loading, GLB resource loading, intent consumption and replay hashing without rendering;
2. an automated offscreen X11 run performs the real Forward+/Vulkan render and rejects llvmpipe, lavapipe, SwiftShader, generic software-renderer strings, or any adapter other than the RTX 3080 Ti. On Hyprland, the scripts move the window to a silent special workspace and explicitly float/resize it so compositor tiling cannot invalidate the measured client render size. The client requests a borderless window, but the contract does not assume every X11 window manager honors that hint.

This distinction avoids falsely claiming Vulkan rendering from Godot's literal dummy headless mode.

## Reproduce

From the worktree root:

```sh
python contracts/native/generate_bindings.py --check
node tools/shared-client-contract.mjs
bash native/godot/scripts/verify_import.sh
bash native/godot/scripts/headless_smoke.sh
bash native/godot/scripts/capture_performance.sh 600
bash native/godot/scripts/capture_performance.sh 600 quality
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

The scripts accept `GODOT4=/path/to/godot4` when the pinned symlink is unavailable. They also accept `NATIVE_EVIDENCE_DIR=/temporary/or/reviewer/path`; native unittests always use temporary directories, so the canonical unittest command cannot replace frozen 600-frame evidence or write nondeterministic logs into tracked files.

## Blender → GLB → Godot

`assets/source/build_synthetic_beacon.py` clears Blender, creates a low-poly emissive beacon from primitives and exports `assets/generated/synthetic_beacon.glb`. It writes a content hash and CC0 provenance record. `verify_import.sh` rebuilds it, invokes Godot's importer and fails unless exactly one imported PackedScene exists and provenance/hash checks pass.

## Deterministic contract result

The shared movement intent starts at `location:kanto:pallet-town` and the authoritative edge resolves to `location:kanto:route-1` / canonical coordinate `[0, 1]`. Three authoritative damage events produce canonical final state:

`authoritative-client/v1|training_red:7|training_blue:0|winner:training_red|events:3`

SHA-256: `395db323b45f3a5d5379a68702c3f8e96e14e5362aa927f67b232c030d7ac1d6` in both the browser contract consumer and Godot client.

## Durable evidence

- `evidence/environment.txt`: official build/version/checksum and live GPU/Vulkan proof.
- `evidence/direction-hashes.txt`: hash binding to the synced governing prompt and dual-frontend docs.
- `evidence/import-verification.json`: synthetic GLB provenance/import result.
- `evidence/literal-headless-report.json`: non-rendering contract-only headless result.
- `evidence/headless-report.json`: automated offscreen Forward+/Vulkan smoke result.
- `evidence/performance-report.json`: warmed native frame telemetry.
- `evidence/native-preflight.png`: genuine viewport capture.
- `evidence/performance-1440p-report.json`: 600-frame RTX 3080 Ti Forward+ quality-tier p95/p99 telemetry after import and shader prewarm.
- `evidence/native-kanto-1440p.png`: genuine 2560×1440 canonical-projection viewport capture.
- `evidence/cross-client-hash-comparison.json`: ordered-event/final-hash comparison with `pixelParityClaimed: false`.
- `evidence/*-log.txt`: raw Blender, Godot import, headless and Vulkan device output.

The legacy preflight capture remains frozen at an exact 960×540 client viewport/drawing buffer with a truthful 960×620 decorated outer window. The canonical quality-tier capture independently verifies a 2560×1440 client viewport, drawing buffer and PNG, records the truthful outer-window dimensions instead of inferring them, and measures p95/p99 only after import prewarm, three stable resize frames and the configured shader warmup. This is renderer telemetry for the smallest canonical projection and is not a pixel-parity or visual-quality promotion claim.
