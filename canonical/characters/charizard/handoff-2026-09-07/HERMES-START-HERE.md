# Kevin → Hermes / Astra handoff — 2026-09-07

Continue the existing Pokémon project, specifically the Charizard asset lane. Kevin is moving orchestration to Hermes for token efficiency while retaining Astra. This document transfers context; it does not assert that Hermes has started or that the runtime model/effort has been changed.

## Read first / authoritative state

Worktree: `/mnt/zer0models/workspace/zer0/experiments/pokemon/.worktrees/charizard-anatomy`
Branch: `codex/charizard-anatomy`
Last implementation commit at handoff preparation: `f741e71` (R138 local voxel reconstruction).
Repository-relative notes: `canonical/characters/charizard/`.
Private binaries: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/`.
Companion `AUDIT.md` gives the conclusions; `version-evidence-index.md` indexes version decision receipts. Read only the selected operation's detailed receipts to save tokens.

**Latest retained working character = R119**, not the highest numbered file:
`/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r119/charizard-home-r119-eye-reach.blend`
SHA256 `d4d5b3b256d11c8c6ce7877f425192beba6c31cb78ff339f4e807e2f41a89a11`.
Limited eye-aperture improvement over retained R114 anatomy. Whole-character likeness and production acceptance remain unapproved.

`current-asset.json` still names R80 in retainedSource/latestReview and R119 in workingCheckpoint. These express legacy approved regional source versus newer limited working progress, but the registry/lineage is incomplete and easily misread. Do not restore R80 accidentally or call R119 final. EXECUTION-BRIEF.md's foot next-step is stale: R130–138 already attempted that reuse path.

## Critical live-session warning

Last recorded live Blender file is R138 with **UNSAVED R139 native sculpt changes**. This is prior-session context, not a fresh live-state verification. Do not open another file or close Blender until checking/preserving it under a new candidate filename.

R138 candidate:
`/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r138/charizard-home-r138-remesh-candidate.blend`
SHA256 `089d59282d20b11957d5095da52724cf290eb235b722140fba36d904d0057b90`.
Isolated combined leg/foot remeshed natively at voxel .005: 29,522 vertices, 29,520 faces, zero boundary/nonmanifold/zero-area findings in recorded audit. **Not integrated into R119. Not a visual pass.** Oversized ridged ankle collar and upper cut-cap artifacts remain; toes somewhat softened.

R139: mechanical sculpt mask unmasked 11,488 vertices around ankle; four native Shift-smooth strokes. Prior observation: fine ridges softened, overall cuff unchanged. No saved source, formal render audit, retention, commit or Telegram delivery. Other meshes were viewport-hidden with custom property `r139_hide_before`. Preserve visibility state before restoring. Do not present these strokes as accepted progress.

One Blender 5.2 was PID4106097 / XID4194306 on DISPLAY=:1, window rectangle3012,509,1896x979. Revalidate IDs/window focus; never blindly reuse screen coordinates. Last mode SCULPT. User previously had mouse focus on wrong window.

## Method and authority

Kevin's latest efficiency instructions override earlier requests for standing max planner and perpetual xhigh critic. Solo by default. Short, bounded higher-effort review only for a consequential uncertainty. No competing Blender author or other Pokémon mesh lane.

Use native keyboard/mouse CUA for anatomical form edits, with short visual loops. Blender MCP/bpy for mechanical selection/masks, inspection, cameras, file I/O, checkpoints, exports, separating flame and sockets. No giant scripted anatomy generator. No long blind click sequences. Do not infer permission to script anatomy from old authorizations. Read `OPERATING-LAW.md` and relevant Blender skills before resuming.

Requested effort: high for routine execution, xhigh for silhouette/form/retopo/rig decisions; max only a bounded final technical/visual audit. Actual runtime settings need verification; don't claim effort was applied from request alone. Token savings should remove redundant planning/reads and unproductive loops, not required visual gates.

Official HOME / official artwork ground truth. Stylized anatomy: pear abdomen, chunky broad short head, thick continuous S neck, small arms, massive thighs/squat lower legs/three-clawed feet, enormous wings, pelvis-integrated tail. Keep component control; membranes separate from spars during construction. Do not replace this with a realistic humanoid dragon.

Flame is runtime VFX/SFX, never physical mesh. Physical GLB has FlameSocket EMPTY, no flame children, energyBaked=false. No fire retopo/UV.

Kevin visual approval before production rig/textures/animation; textures after topology lock. Preserve every rollback, especially r03+. No merge/push/publication. Git source/scripts/receipts only; binary assets remain private in /mnt/zer0models.

## Retained gains / closed failures

- R107–109: bilateral native fingertip taper retained. Do not repeat amplitudes.
- R114: modest central-jaw relief using unapplied lattice; 208 evaluated vertices changed, fixed seam preserved, no flips. Retained regional gain only.
- R119: body rim and seated eye inserts moved together; clearer forward wedge, exact seating preserved. Eye-length loop closed; angular anterior corner unresolved.
- R115 neck smoothing: fine stripes reduced, broad bands unchanged. Rejected.
- R116 fixed crown / moved shoulders: plateau. R117 shared head-eye deformation: mechanically valid but worse likeness. Rejected.
- R120/121 eye wall/triangulation: harsher dark corner. Rejected. Defer corner.
- R104–106 tail loft/pushes: bulge or dents. Rejected; tail slab still unresolved.
- R123 lobe compression folds surface. R125 spatial bisect cuts true toe. R127 100 smoothing iterations preserve false point and scallop pad. Routes closed.
- R128/129 primitive foot: disc/boot silhouette, unaccepted.
- R130 reuse opposite existing three-terminal foot: better construction direction, jagged ankle, unintegrated.
- R131 cuff extrusion: fluted collar. R132 smoothing: height collapse, rejected.
- R133 closed foot operand; R134 capped body working copy. Technical preparation only.
- R135 whole-body Exact Union: invalid boundaries/nonmanifold/degenerate result; weld didn't fix. Rejected.
- R136 isolated closed operands Exact Union: catastrophic collapse to61vertices. Rejected. Outward normals and closed inputs alone were insufficient.
- R137 overlap audit: leg cap has self-overlap candidates; flattening cap still invalid. Rejected.
- R138 native voxel remesh: valid local construction volume; unresolved cuff. Do not replay Boolean retries.

Immediate next decision: preserve R139, assess whether R138's cuff can be reshaped in one bounded native sculpt pass with toes/sole protected. Stop if silhouette does not improve. Keep candidate isolated; integrate only after regional visual pass and protected-geometry audit. Then address tail slab and whole-character silhouette, not tiny eye polish. One hypothesis → one pass → matched views → retain/reject. Do not commit to endless collar smoothing.

## Tools / practical lessons

`tools/charizard-whole/cua_blender_keys.py`: guarded native keys/click/strokes. Defaults key delay12ms, settle400ms. Confirm owned window/mode before actions. F9 Enter can dismiss popup; use Tab to commit fields before checkbox edits. Select boundary EDGES in edge mode; selecting boundary vertices can include internal faces/edges and produce invalid caps.

`tools/charizard-whole/preview_foot_candidate.py`: mechanical preview helper was hardcoded to body GEO-body-head-joined-r92 and foot GEO-foot-reused-r130. R138 object changed; do not run unchanged. Temporary mask excluded old positive foot only in largest component.
MCP open_mainfile needs a separate call before context-dependent reads. Use operator readback/geometry audit after native edits; stale edit-mode mesh data has previously yielded false zero-change reports.

Skills available locally: `/workspace/kvn-home/.codex/skills/blender-modeling/SKILL.md`, blender-materials, tencent-hunyuan3d, comfyui, ffmpeg. Discover actual MCP/CUA capabilities in Hermes; don't assume Codex tool names exist there. Earlier agents charizard_meta_orchestrator and charizard_xhigh_critic were stopped; foot_connector_decision completed its bounded R132 review. Do not revive standing reviews.

## Other project work — preserve, do not distract current mesh lane

Field OS restoration/PWA has recorded browser-green evidence: `canonical/devices/field-os/acceptance-r03.json` and delivery-r03.json. Implementation revision fa975753269125aebcf471a04515664b90d7fc7c; release f85e3ae295feec02. Last recorded preview https://0.taila30dc.ts.net:8469/pokedex.html (not rechecked in this audit). Six browser scenarios,146 PWA checks,13 unit tests. Kevin's S25 installed-app acceptance remains pending. Do not confuse this with completed playable Charizard.
Preserve six species Bulbasaur/Charmander/Squirtle/Caterpie/Pidgey/Geodude, entries, scan→identify→register, Research/Map/Party/Tools/audio/Home/physical controls. Opening→BootUp→Ready must enter live OS, never replace it with dead screen or separate viewer. No preview update without replacement regression pass.

Physical Pokédex backlog: board01=v2 and board02=v3; never hybridize. Preserve rejected v001 and stopped worker's v002 artifacts/worktree. Paths: /mnt/zer0models/pokemon-iac/devices/pokedex/v001 and v002; stopped worktree /mnt/zer0models/workspace/zer0/experiments/pokemon/.worktrees/pokedex-v002 branch codex/pokedex-v002-reference-faithful. Original references v001/references/board-01.jpg and board-02.jpg. Full generation collection/progression is future scope, not license to parallelize another Blender lane now.

## Delivery and Git hygiene

Kevin authorized milestone previews through Hermes Telegram gateway to telegram:1083429746. Last confirmed R138 message17803; no R139 delivery. Send one choice-ready preview and brief retained/rejected result per meaningful batch; avoid diagnostic spam.
Hermes profile /workspace/hermes-home/profiles/chiefstaff; interpreter /home/kvn/.hermes/hermes-agent/venv/bin/python. Reuse existing private whole-r137/delivery/send-preview.py pattern after inspecting; preserve exclusive attempt/result receipts, never print credentials.

At handoff preparation these unrelated files were untracked; preserve:
- tools/charizard-whole/capture_home_head_r08.py
- tools/charizard-whole/cua_compress_nose_r08.py
- tools/charizard-whole/cua_taper_nose_r08.py
- tools/charizard-whole/measure_native_edit_r08.py
- tools/charizard-whole/prepare_home_head_r08.py

Commit only coherent owned changes. Latest handoff commit can be found via git log, not hardcoded into itself. No push/merge. No concurrent edits during transfer. This notes audit deliberately reopened no images and performed no Blender changes.
