# Charizard head repair checkpoint

`charizard-head-r06` removes the inherited false posterior branches and replaces the two blunt distal horns with tapered geometry. It is an intermediate anatomy checkpoint. The small posterior skull divot, soft muzzle/eyes/jaw, and one inherited local head intersection remain. The character is not ready for game promotion or an S+/AAA verdict.

The root agent authored all geometry through Blender MCP. Separate agents only inspected CPU evidence. Authoring used distinct scenes and private output folders; the frozen tail checkpoint, historical scenes, other Blender process, unrelated worktrees and live Field OS deployment were preserved. Nothing was merged or pushed.

## Inputs and candidates

Private root: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03`.
Frozen parent: `anatomy-r02/r02e/charizard-tail-r02e.blend`, SHA256 `998ed1a4bea9dfc565217ac1ab545953646e216c3ee0640363ae43cdc8c2bb8e`.
The official-source ancestor remains `charizard-official-raw-61062-o256`. Existing official illustration, HOME image and low-resolution front/rear sprites informed the shape review. Their hashes and provenance are in the batch manifest. No new generation or unofficial image input was used. These images establish character direction, not exact orthographic dimensions.

| Attempt | Change and decision |
| --- | --- |
| Selection r01 → r02 | Colored renders exposed 32 disconnected intended-horn vertices in a broad removal mask. Connected-tip selection excluded them before editing. |
| Initial hole filling | Native fill/beautify left a four-face chord and wire edge; cleanup/fill closed only one of two boundary loops. Failed diagnostics are preserved. |
| Head r01 | Removed 1,033 source vertices; explicit 66- and 89-vertex boundary fans closed the holes. Eleven numerical gates passed, but the caps had visible creases. Intermediate only. |
| Head r02 | Constrained Delaunay projection collided with existing face IDs. Aborted before mesh mutation; no exported candidate. The recipe and transcript-derived failure description remain, but there is no separate raw error file. |
| Subdivision attempt | Adaptive BMesh subdivision/triangulation created a four-face edge in the temporary mesh. Failed before creating a candidate scene. Recipe and diagnostic retained. |
| Head r03 | Geometry was created, but adding custom layers invalidated BMesh wrapper membership tests. Every ancestry ID became −1 and the protection check was vacuous. Rejected; the failed `.blend`, arrays and receipt are preserved. |
| Head r04 | Explicit conforming edge splits plus a .035 geodesic relaxation band, 60 iterations. Corrected ID initialization and explicit protected-count guards. Nine numerical gates passed; visible fold remained. |
| Head r05 | Same cap subdivision, broader .075 band, 220 iterations. Reduced the fold to a small divot. Nine numerical gates passed; blunt horns remained. |
| Head r06 | Replaced 1,041 distal horn vertices with 767 vertices in two connected lofts. Retained root rings and all other r05 coordinates. Twelve numerical gates passed. Current local checkpoint; face still unfinished. |

Five selectable review checkpoints are registered: frozen baseline, r01, r04, r05 and r06. Their assistant verdict is `needs-work`; `completed` means that experiment finished, not that character quality passed. Rejected metadata is never promoted as valid evidence.

## Measured result and scope

| Export | Vertices | Triangles |
| --- | ---: | ---: |
| Body | 122,633 | 245,266 |
| Flame | 4,516 | 9,028 |
| Total | 127,149 | 254,294 |

The GLB contains two meshes and one scene, with no authored UVs, materials, textures, rig or animation clips. This is the detailed geometry source, not an optimized runtime derivative. Body transform is identity; the unchanged flame translation is recorded in `head-r06/reopen-receipt.json`.

All 113,062 protected frozen-source vertices and 226,039 oriented protected triangles remain exact. All 121,866 retained r05 coordinates remain exact. The body has one closed connected component, consistent edge winding, no excess-incidence edges and no tested degenerate triangles. Both horn patches have a fixed root cycle (25 and 26 vertices), 16 rings including the root, and a real final tip vertex. The independent audit validates actual exported connectivity, taper and ring progression.

The local head AABB check finds one unchanged source intersection pair and zero new pairs. An additional test finds zero overlaps among 625 shared-tip fan pairs. This does **not** establish whole-model intersection freedom, all shared-vertex cases, or flame/body separation. Hands, feet, wing roots, tail proportions and deformation topology remain provisional.

## Visual evidence

The root inspected all six final head views (front/right/left/rear/top/three-quarter), five whole-body views, the reopened GLB head render and an actual Blender UI screenshot saved after redraw. Baseline views, colored selection renders and intermediate cap views were also inspected. Whole-body Workbench cast shadows can produce flat patches; matched head close-ups disable those shadows. The improvement is localized to the false branches and horn silhouette. A soft face and skull divot remain visible.

`head-r06/comparison-preview.png` and `phone-preview.png` are actual browser captures. Fifteen browser checks pass: all six paired head images decode, the exact r06 image is visible at 412×892, all five checkpoints can be selected, and there is no horizontal page overflow or uncaught JavaScript error. This is simulated phone evidence; Kevin's device/visual acceptance is pending.

[Phone iteration inspector](https://0.taila30dc.ts.net:8445/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=charizard-head-r06&view=head-top) · [Before/after comparison](https://0.taila30dc.ts.net:8445/devtools/experiments.html?pokemon=charizard&a=charizard-head-baseline-r02e&b=charizard-head-r06&view=head-top)

The functional game Field OS remains at `https://0.taila30dc.ts.net:8469/pokedex.html`, implementation `fa975753269125aebcf471a04515664b90d7fc7c`, private release `f85e3ae295feec02`. This mesh inspector does not replace it. Its six-species/scan/navigation repair and worker-upgrade tests were previously committed and delivered. Actual S25 acceptance remains pending; no deployment change belongs to this head milestone.

## Reproduction

Run from this worktree. The output directory must not already exist. Blender 5.2 LTS and the installed Hunyuan Python environment were used.

```sh
/usr/bin/blender --background --factory-startup --threads 4 --python tools/charizard-head/replay.py -- --out /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/reproduction-r06-final
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-head/compare_replay.py --reproduction /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/reproduction-r06-final
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-head/audit/validate_horn_replacement.py
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-head/audit/validate_horn_replacement.py --candidate-dir /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/reproduction-r06-final/head-r06 --output-prefix /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/audit/reproduction-final-validation
/tmp/pokedex-m5-node/node-v26.4.0-linux-x64/bin/node tools/charizard-head/browser_check.mjs
```

These commands already completed successfully; choose a new private output path for another replay. The final fresh process verifies all 14 pinned source/camera/recipe records before loading frozen tail-r02e, then authors r01 → r05 → r06. It checks that the loaded source, camera file and every executed script are members of the verified set. Each step reads only its newly produced intermediate mesh/audit files. Every decoded GLB coordinate, triangle, transform and NPZ array matches the original stage. All 33 rendered images match pixel for pixel. `.blend` bytes and receipt wording are not claimed identical. The tracked CPU validator also passed against both original and replayed r06.

Read-only review caught the first replay's dependence on frozen intermediate audit files. That first result remains in `reproduction-r06`, with historical inputs in `inputs-original-replay.json`. The final replay removes that dependence and adds input-membership guards. Original per-candidate recipe copies remain private and hash-linked by their experiment records; current repository recipes add independent-replay support. The registration helper preserves an existing recipe copy when rerun. `reproduction-r06-independent` is a preserved pre-guard run, superseded by the fully checked final replay. Review uses the same GPT model family; it is not cross-family or human approval.

The immediate next anatomy unit is the remaining skull defect and faithful facial structure, with protected-region receipts and matched views. Retopology, official colors/PBR, rigging, motion/attacks and playable integration follow complete geometry review. Keep the overall goal active.
