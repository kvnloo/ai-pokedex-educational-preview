# Native Frontend Engine Decision

## Decision

Use Godot 4.7.2 Forward+ as the native NVIDIA/Vulkan frontend, with Blender 5.2 LTS as the shared DCC/build tool. Keep the browser frontend independent. Both consume the same canonical data, deterministic intent/replay protocol, backend authority and Assets-as-Code outputs.

Installed and verified:

- Godot `4.7.2.stable.official.ed1daf0bf`
- Official Linux x86_64 release SHA-512 verified before extraction
- Binary: `/mnt/zer0models/tools/godot/4.7.2/Godot_v4.7.2-stable_linux.x86_64`
- Command: `/home/kvn/.local/bin/godot4`
- Blender `5.2.0 LTS`
- NVIDIA RTX 3080 Ti, 12 GB VRAM, driver 610.43.03
- Vulkan 1.4.341 device path verified

## Why Godot is optimal for this second frontend

The optimization target is not maximum theoretical fidelity at any cost. It is native GPU performance with the least duplicated product work.

Godot provides:

- native Linux editor/player with Forward+ Vulkan;
- recommended glTF/GLB import and runtime glTF loading;
- direct Blender-to-glTF integration;
- WebSocket support across platforms;
- a small, scriptable, license-free install with no account activation;
- fast headless import/build/test loops;
- enough renderer control for an RTX 3080 Ti native quality tier;
- clean separation from the existing browser frontend while reusing JSON/GLB/KTX2/animation manifests.

## Alternatives considered

### Unreal Engine

Best candidate for maximum out-of-box cinematic rendering and mature AAA tooling. Linux Vulkan can support Nanite/Lumen paths. Rejected for the initial parallel frontend because it is not installed, has a very large toolchain/build footprint, and would create the most C++/Blueprint/material/import duplication before proving the shared contract.

Reconsider only if the Godot native renderer cannot meet independently measured visual/performance gates after the shared Kanto slice is working.

### Unity HDRP

Strong middle ground: Linux Vulkan, HDRP, DLSS support, glTFast, mature tooling and networking. Unity Hub is installed, but no editor is installed; licensing/account activation and a large editor/module install add friction. It also duplicates gameplay/client code in C# and introduces proprietary-editor lock-in.

Reconsider if Godot cannot meet native presentation needs and Unity licensing is explicitly accepted.

### Bevy / raw wgpu

Best pure technical alignment with a future Rust wgpu/WebGPU frontend and native Vulkan. Rust is installed. However, it has the least mature artist/editor workflow and would require more custom scene, animation, UI, asset-processing and tooling work. It is better considered as the future web/native shared-renderer convergence path, not the least-work second frontend today.

### Blender

Blender is the shared source DCC and offline automation tool, not the shipping game runtime.

## Shared authority contract

Do not port gameplay truth independently into Godot.

Shared, engine-neutral sources of truth:

- canonical world schemas and normalized JSON;
- Ash chronology and story-event IDs;
- deterministic intent/event/replay protocol;
- battle ruleset version and final-state hashes;
- save/migration format;
- authoritative backend/WebSocket contracts;
- Assets-as-Code manifests, recipes and profiles;
- GLB/glTF, KTX2, animation and material manifests;
- input/action names and accessibility semantics.

Frontend responsibilities:

- render world, characters, creatures, VFX, UI and cinematics;
- collect player input and emit intents;
- predict only where contract permits;
- consume authoritative state/events;
- play deterministic replays;
- expose renderer/device telemetry.

The web and Godot clients must pass the same contract fixtures and replay vectors. Cross-client acceptance requires matching ordered events and final hashes, not identical pixels.

## Minimal native vertical slice

Before any broad port:

1. Headless Godot project starts under Vulkan.
2. Loads generated canonical Pallet→Pewter JSON through the shared schema version.
3. Loads one IaC-produced GLB and material/animation manifest.
4. Renders one canonical map cell at fixed camera and seed.
5. Accepts one shared movement intent fixture.
6. Replays one shared deterministic battle log.
7. Produces the same final simulation hash as the browser/backend fixture.
8. Captures native RTX frame-time/render telemetry.
9. Proves no Godot-owned duplicate battle/world database exists.

## Parallelism and dependencies

May proceed immediately in parallel:

- installed-engine verification;
- project scaffold in an isolated worktree;
- generated contract bindings;
- fixture/replay loader;
- synthetic asset/import smoke;
- native performance harness.

Must wait for accepted M0/M1 + Assets-as-Code contracts:

- canonical Kanto content promotion;
- private official-art resolver;
- full Pallet→Pewter traversal;
- cross-client battle/save parity;
- visual promotion.

## Native quality/performance gates

Initial named target: RTX 3080 Ti at 2560×1440, Forward+ Vulkan.

- sustained p95 frame time ≤ 11.1 ms for 90 FPS target; stretch 8.3 ms for 120 FPS;
- p99 ≤ 16.7 ms;
- no software renderer;
- no unbounded shader compilation hitch after prewarm;
- visible triangles, draw calls, shadow maps and texture residency reported per scene;
- no per-frame allocation growth during a five-minute traversal/replay loop;
- native captures use the same scene/content hashes as browser comparisons;
- performance and visual verdicts remain separate.

These are initial slice gates, not universal final budgets.
