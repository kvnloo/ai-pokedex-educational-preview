# AAA Kanto starter production standard v1

Status: frozen parent contract for Bulbasaur #001, Charmander #004, and Squirtle #007. This contract defines production and evidence; it does not certify any current mesh. Machine-readable briefs are in `experiments/kanto-starters/*.production-brief.v1.json`.

## 1. Authority and shipping boundary

Canonical species identity is the exact private official-art byte set named in each brief. Generated profile/rear pixels are hypotheses, never observations. Canonical simulation move data remains authoritative for accuracy, damage, status, target, PP and outcomes. Presentation consumes immutable `battleActionId`, `actorId`, `targetIds`, `moveId`, outcome and timing; it may delay its own visuals but may not reroll, damage, heal, change status, select targets or suppress a simulation result.

Two planes are mandatory:

- private: `/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/<species>/`; official pixels, hypotheses, failed candidates, Blender masters, renders, ballots and source ledgers;
- distributable: Git may contain original contracts, scripts, hashes, metrics, manifests and approved derivative output references. No official or generated identity-reference pixels enter Git, `public/`, npm output or Godot export packs.

Every artifact record has canonical ID, form, role (`observed`, `transformed-observation`, `generated-hypothesis`, `derived-mesh`, `authored-derivative`), SHA-256, byte count, producer/model revision, source hashes, prompt/workflow digest, seed, camera contract, license boundary and timestamp. Mixed lineage is allowed only when every derivative points to its real source.

## 2. Reconstruction tournament before rigging

Existing Hunyuan GLBs are baseline entrants, not repair defaults. Each species runs a bounded, matched tournament inspired by the successful character-convergence pattern without copying unrelated Star Wars assets or configuration:

1. `B0`: existing raw Hunyuan GLB and its 8k derivative.
2. `K0..Kn`: canonical observed plate -> local ComfyUI + FLUX.2 Klein exact-item/structural-identity sheets, at least three seeds. Store under `hypotheses/klein/`.
3. `R0..Rn`: refine each accepted Klein output with ChatGPT Image using that exact Klein byte stream as image reference. Store under `hypotheses/refined/`. The ledger must bind `inputSha256` to the Klein output; ChatGPT is not an initial sheet generator. Reject any refinement that redesigns silhouette, landmarks, proportions, palette/component boundaries or camera role, even if material detail improves.
4. Multiview consistency gate, with canonical observed plates retaining authority and every unseen/profile/rear pixel labeled hypothesis.
5. Matched 3D reconstruction tournament: hold Hunyuan/reconstructor revision, seed, steps, guidance, octree and preprocessing constant across accepted Klein and refined recipes; after a source winner, run a separate generator sweep.
6. For every sculpt and texture revision: render the exact fixed cameras back to 2D, compare landmarks/silhouette/material regions with canonical observed plates, diagnose, revise the authoritative sculpt/material source, and create a new immutable candidate. Runtime-only fixes do not close this loop.

Before a run, record peak 12 GB measurements separately for view generation, preprocessing, reconstruction and texture: GPU model, driver, command/workflow digest, baseline VRAM, peak allocated/reserved VRAM, peak system RAM, wall time and offload mode. OOM or unmeasured residency is a failed row, not evidence of fit.

### Frozen camera contract

All sheets and render-backs use meters, Y up, subject forward `+Z`; image front camera looks from `+Z` toward ground-contact center. Perspective 55 mm equivalent, square 768 px, camera elevation at 52% of subject height, aim at 52% height, subject occupancy 82% of image height, neutral pose and level ground. Roles and yaw about Y: front 0°, front-right 45°, right 90°, rear-right 135°, rear 180°, rear-left 225°, left 270°, front-left 315°. No mirrored reuse. Record intrinsics/extrinsics and crop transform. A generated role that contradicts observed landmarks is rejected, never averaged into consensus.

Each entrant receives a 12-view neutral blue-clay turntable plus a 12-view textured lookdev under frozen camera/light/color settings. Anonymous labels are hash-frozen before review. Promotion to retopo requires all hard structural gates and a labels-hidden jury win on canonical recognition, cross-view consistency, anatomy/topology, material fidelity and runtime feasibility. Minimum promotion is mean 4.25/5, no category below 4/5, no blocking dissent, and at least +0.35/5 over B0 with 3 or more non-builder judges. Kevin is the final identity gate.

Reject: contradictory landmarks, wrong limb/digit count, fused appendages, collapsed tail/vine/shell/bulb, substantial slab, dominant relief, blob/cube, view leakage, missing back anatomy, or a candidate that wins only by sharper rendering. Preserve every rejection byte-for-byte.

### Existing baseline probe (2026-08-25)

`tools/component_glb_qa.py` was run on raw and 8k GLBs. Reports and private 12-view renders live under each species `evidence/contract-probe-v1/`. Raw topology: Bulbasaur 458,320 faces, Charmander 318,000, Squirtle 344,404. Dominant components are volumetric and no substantial slab/cube threshold fired; all exceed realtime budgets and remain `visual-review-required`. This is **blockout-only** classification pending neutral turntable identity/anatomy review. The decimated meshes are not retopo, not deformation topology, and not rig-ready.

## 3. Canonical spatial and DCC contract

- Blender 5.2.0 LTS master; Godot target contract 4.7.2. The current host has no `godot` executable, so Godot import/runtime certification is a downstream required gate, not claimed here.
- Author in meters. One Blender unit = 1 m; centimeter display is informational. glTF and Godot import scale must remain 1.0.
- Right-handed, Y up, `+Z` forward in authored gameplay semantics. Export adapters must prove front orientation with a named render, not metadata alone.
- `entity_root` is at projected ground contact between support feet/paws, X/Z centered, Y=0. It alone owns world translation/yaw and root motion. `motion_root` carries extractable authored deltas which are subtracted from pose and applied once by gameplay. `visual_root` owns species scale; animation must not reset it.
- Rest pose is neutral A/quadruped stance, mouth closed, eyes open, appendages clear, all scale 1, unapplied transforms forbidden.

Private DCC layout:

```text
<species>/production/vNNN/
  source-ledger.json  tournament.json  camera-contract.json
  source/  hypotheses/  reconstruction/raw/  evidence/{clay,lookdev,render-back}/
  dcc/<species>_master.blend
  textures/source/{basecolor,normal,orm,emissive}/
  export/browser/{lod0,lod1,lod2}.glb
  export/godot/<species>.glb
  manifests/{rig,animation,presentation,provenance}.json
```

One Blender master produces two validated derivatives: browser glTF 2.0 GLB with Meshopt and KTX2; Godot-compatible GLB without unsupported custom runtime shader assumptions. Base color/emissive are sRGB; normal/ORM are linear; ORM is R=AO, G=roughness, B=metallic. Bake nonportable nodes. Cache key is SHA-256 over canonical ID/form, all source hashes, sculpt/texture/rig/clip hashes, Blender build hash, export-script hash, flags and manifest revision.

## 4. Rig and naming

Species use separate skeletons with shared semantic names. Export deform bones are lowercase snake case under `motion_root`; controls use `ctrl_`, mechanisms `mch_`, deform bones `def_`, sockets `socket_`. Only `def_` bones export. Maximum 4 normalized influences/vertex; no zero-weight vertices; control constraints and drivers bake away.

Common deform hierarchy: `def_pelvis`, `def_spine_01..N`, `def_neck_01..N`, `def_head`, `def_jaw`; paired limbs use `_l/_r` suffix and proximal-to-distal names. Eyes are independently aimable bones or verified blend shapes; lids support blink and squint. Face minimum: blink L/R, eye aim, jaw open, mouth corner/phoneme controls sufficient for growl and hit reaction. IK/FK controls exist in Blender for every contact limb; exported feet/paws/hands expose `footContact`/`pawContact` metadata sampled in XYZ.

Common sockets: `socket_focus`, `socket_camera`, `socket_mouth`, `socket_head`, `socket_chest`, `socket_ground`, `socket_hit_center`, paired `socket_foot_*`/`socket_paw_*` and species sockets. VFX geometry is not baked into anatomy.

Species semantics:

- Bulbasaur: 62 deform bones max; quadruped paws, 4-spine/2-neck chain, jaw/eyes/lids, bulb 5-bone compression chain, two independent 5-bone vines ending `socket_vine_tip_l/r`, leaf sockets. Bulb remains anatomical mass, not a backpack rigid body.
- Charmander: 58 bones max; biped legs/feet/toes, arms/hands/three-digit posing, 4-spine/2-neck, jaw/eyes/lids, 8-bone tail ending `socket_tail_flame`. Flame is runtime VFX and must remain attached through motion blur and LOD.
- Squirtle: 54 bones max; biped legs/feet/toes, arms/hands, 4-spine/2-neck, jaw/eyes/lids, 6-bone tail, shell root plus limited shell-response bone. Shell plates remain rigid-weighted; Withdraw uses authored limb/head retraction and shell-safe corrective shapes, never uniform body scaling.

## 5. Animation and runtime API

Manifest schema fields per clip: `clipId`, `speciesId`, `durationMs`, `loop`, `fadeInMs`, `fadeOutMs`, `rootMotion` (`none|extract-xz-yaw`), `additive`, `baseClipId`, `markers[]`, `cancelWindows[]`, `hitFrames[]`, `cameraEvents[]`, `vfxEvents[]`, `audioEvents[]`, and source/rig hashes. Marker fields are `id`, `kind`, `timeMs`, optional socket/payload, and `dispatch`=`playhead-crossing`.

Runtime command:

```text
presentAction({battleActionId, actorId, targetIds, moveId, outcome, simulationTick})
```

Runtime output is append-only presentation events keyed by `(battleActionId, markerId, loopIndex)`. Dispatch detects all marker times crossed between previous and current playheads, including wrap and skipped frames, exactly once. Seeking/replay restores a serialized cursor. `contact` aligns to the simulation outcome; presentation may not infer an outcome from particles or collision.

Deterministic states: `send_out -> idle <-> start/locomotion/turn/stop`; `idle|locomotion -> move`; any eligible state -> `hit`; `hit -> idle|faint`; `faint` terminal until `recall`; plus `catch`, `celebrate`, `recall`. Priority: faint > recall/catch > hit > move contact-lock > transition > locomotion > idle. Cancel windows are explicit; no cancellation may erase a committed contact event.

Required base clips: idle, breathe additive, look, blink additive, start, walk, run, turn-left, turn-right, stop, hit-light, hit-heavy, faint, send-out, recall, catch, celebrate, plus four species moves. Root motion closure is gameplay-owned and assigned once.

Every move has distinct anticipation -> travel/release -> contact -> recoil/follow-through -> settle. Dense evidence is 60 fps from 250 ms before anticipation through 500 ms after settle, with marker overlay and unmasked view. Generic puffs, HUD-only hits and recycled choreography fail.

## 6. Numeric production gates

Named desktop baseline: RTX 3080 Ti 12 GB, 2560x1440, DPR 1, Chromium, one hero + one opponent, arena and production UI. Mobile baseline: Snapdragon 8 Gen 2 / Adreno 740 class, 1920x1080 logical landscape, DPR capped 1, Performance tier. Claims require exact device rows.

Per species budgets:

| species | LOD0/1/2 triangles | projected-height switches | deform bones | browser transfer | resident textures |
|---|---:|---:|---:|---:|---:|
| Bulbasaur | 70k/34k/14k | 360/150 px, 15% hysteresis | 62 | 9 MiB | 48 MiB |
| Charmander | 62k/30k/12k | 340/140 px, 15% | 58 | 8 MiB | 44 MiB |
| Squirtle | 58k/28k/11k | 330/135 px, 15% | 54 | 8 MiB | 44 MiB |

Textures: LOD0 maximum 2x 2048² material sets plus 1024² eyes/details; LOD1 max 1024²; LOD2 max 512². KTX2 UASTC for normals/high-frequency masks, ETC1S where color quality passes. One creature <=6 draw calls LOD0, <=4 LOD1, <=2 LOD2; two-creature battle <=18 creature/VFX draw calls excluding arena/UI. Shadowed lights <=1 mobile, <=2 desktop; shadow maps 1024 mobile, 2048 desktop.

Runtime: desktop p95 <=6.9 ms and p99 <=9.5 ms total frame time at 1440p Balanced; mobile p95 <=16.6 ms and p99 <=22 ms at baseline Performance. Initial two-creature transfer <=18 MiB compressed and combined resident creature textures <=96 MiB. No per-frame allocations after warm-up. Prewarm exact GLB, shaders, depth variants and first semantic transitions; certify first-use and steady state separately.

Animation: independently sampled support contact drift <=1.0 cm steady and <=1.8 cm start/turn/stop; ground penetration <=0.5 cm; root-motion final translation <=0.5 cm and yaw <=0.25°; loop seam joint positional RMS <=0.5 cm, worst <=1.2 cm, root velocity discontinuity <=5%; marker timestamp error <= one simulation tick and skipped-frame event loss=0; transition visual root pop <=0.7 cm / 0.5°.

Geometry/material: glTF validator errors=0, warnings=0 unless explicitly waived with owner; nonmanifold edges=0 on promoted render surfaces; zero-area triangles=0; UV overlap only in declared mirrored regions; normal/tangent NaNs=0; LOD silhouette IoU >=0.985/0.965 against LOD0 at switch camera. Canonical landmark pass >=90%, silhouette landmark score >=0.92 across observed roles, cross-view contradiction count=0.

## 7. Evidence, commands and rework

Probe commands:

```bash
env PYTHONDONTWRITEBYTECODE=1 /workspace/venv/hunyuan3d/venv/bin/python tools/component_glb_qa.py INPUT.glb --output REPORT.json
blender --background --python tools/render_glb_turntable.py -- --input INPUT.glb --out-dir PRIVATE_DIR --views 12 --size 768
npm run kanto-starters:validate
npm run typecheck
npm run build
```

Required packet: immutable source/tournament ledger; source and output hashes; 12 GB measurements; raw and final component QA; neutral clay and textured 12-view sets; render-back panels after every sculpt/texture revision; topology/UV/weights debug; contact/deformation tests; dense move videos; browser and Godot importer logs; first-use and sustained profiles; anonymous jury grid/hash/ballots; rollback pointer.

Failure loop is fail-closed: `reject -> classify source/camera/reconstruction/sculpt/texture/rig/runtime cause -> revise authoritative stage -> new immutable candidate -> rerun every downstream gate`. Never decimate a bad reconstruction into acceptance, repair only at runtime, loosen a gate, or discard rejected bytes.

Definition of done: tournament winner approved; retopo/material/LODs pass; species rig semantics and all clips pass; browser and Godot derivatives import at scale/orientation 1; four moves each have unique five-beat dense evidence; deterministic marker/contact/root tests pass; numeric desktop/mobile rows pass; labels-hidden jury delta passes; no protected bytes ship; manifests and rollback hashes are complete; Kevin accepts production-UI captures. Builders do not certify their own work.
