# Charizard manual anatomy checkpoints

Current working parent is **charizard-tail-r02e**. It keeps the smoother tail-root surface from r02d and repairs a narrow intersecting collar strip. The root ridges are reduced in matched clay views. Charizard still needs head, limb and wing corrections, deformation topology, UVs/PBR, rig, clips and playable integration. This is not AAA/S+ acceptance.

## Current root surface batch

Source and export are under `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02e`. The four candidates, failed attempts, correspondence arrays, render cameras and replay hashes are pinned in `canonical/characters/charizard/root-surface-batch/manifest.json`. Candidate operation receipts retain their original pre-validation status; the later audit reports and experiment verdicts record the results.

| Attempt | Change | Decision |
| --- | --- | --- |
| r02b | Native weighted smoothing | Reject: ribs remain |
| r02c | Quadratic surface fit using mesh normals | Reject: 48 reversed triangles, 50 local crossings |
| r02d | Quadratic fit using neighborhood PCA normals | Preserve as intermediate only: smoother, but 12 crossings |
| r02e | Replace the measured narrow collar strip | Keep as local checkpoint: zero detected crossings in the same root region |

r02e removes 41 vertices, then triangulates the unchanged 29-vertex boundary into 27 faces. Four recreate old triangles exactly; native-patch.json distinguishes authored faces from a set difference. All retained coordinates match r02d. All 112,475 protected r02a vertices and their 224,371 oriented triangles remain exact. The flame is unchanged. The reopened export contains 253,700 triangles, no UVs, materials, rig or animation tracks.

Fresh `reproduction-root-final` matches the candidate's decoded geometry, transforms, all topology arrays, native patch receipt and all eight render images exactly. Independent CPU validation passes for both copies and for the tracked validator. The crossing check covers only the recorded wider root bounds. It does not prove whole-model or flame/body intersection freedom. Actual Blender viewport, five whole-body renders, two root close-ups, the inner-collar comparison and phone screenshots were inspected.

From this worktree, replay into a **new** private output directory:

```sh
/usr/bin/blender --background --factory-startup --python tools/charizard-anatomy/reproduce_root.py -- --out /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/my-root-verification --through r02e
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-anatomy/compare_root_reproduction.py --candidate r02e --reproduction /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/my-root-verification
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-anatomy/root_audit/validate_strip_cleanup.py --candidate-dir /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/my-root-verification/r02e --output-prefix /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/my-root-verification/validation
```

The source recipe verifies the parent manifest and every pinned input hash before loading the frozen r02a .blend. It recreates the same region and surface fit, repairs the strip, exports and renders. `--through r02d` retains the intermediate-only replay. `root_audit` is CPU-only and reads the private candidate root; it never authors geometry. Rejected b/c recipes remain alongside their receipts for diagnosis.

The [phone preview](https://0.taila30dc.ts.net:8445/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=charizard-tail-r02e&view=root-side) and [matched comparison](https://0.taila30dc.ts.net:8445/devtools/experiments.html?pokemon=charizard&a=charizard-tail-r02a&b=charizard-tail-r02e&view=root-side) use the existing experiment desk. All attempts remain selectable. The 18-check browser receipt covers images, switching and preview visibility at 412×892; no human verdict is written.

The functional Field OS on8469 remains release f85e3ae295feec02. This batch changes no game application code or deployment. Kevin's real S25 acceptance is pending. Root is the sole Blender author; CPU review was delegated read-only. No merge/push.

## Historical r02a checkpoint

This checkpoint removes a folded join in the manually rebuilt tail. It is not an accepted S+ asset. Source input remains the official illustration from PokeAPI, seed 61062, octree 256; no new image or mesh generation was run.

The Blender source and GLB are in `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02a`. The manifest under `canonical/characters/charizard/tail-r02a` pins the files and hashes. Scripts are under `tools/charizard-anatomy`. The live Field OS on port 8469 is unchanged by this checkpoint.

## What changed

Five rebuilt tail rings now follow the source surface tangent into the unchanged distal tail. Exactly 1,585 vertices moved. All 106,843 original source vertices, 317 attachment vertices, and the static flame are unchanged. The existing circumferential ridge is removed; shallow lengthwise ridges and moderate proximal ovalness remain visible.

The export contains one scene and two mesh nodes: body 122,377 vertices / 244,754 triangles, flame 4,516 / 9,028. Total 253,782 triangles. This is a geometry work source, above a final runtime asset budget. Reopening in Blender confirms zero UV layers, material slots, armature modifiers and animation clips. There are no texture maps. Those absent systems are unfinished work, not a successful material/rig pass.

## Verification and limits

The CPU audit proves a closed connected body, consistent winding, no tested degenerate triangles and unchanged protected coordinates and triangle triples. First-ring foldback drops from 29 vertices to zero. Maximum exported seam face angle drops from 164.878° to 4.556°. The local Open3D test checks 5,760 triangles in each export and finds one intersecting pair in r01 and none in r02a. This does not establish whole-model or separate flame-to-body intersection freedom.

Blender MCP authored the patch and reopened the GLB. Five matched whole-body renders and two root close-ups were visually inspected, along with the actual Blender viewport. Root close-ups disable cast shadows in both versions to reveal the surface; whole-body views retain the previous camera/Workbench setup. Camera receipts preserve that distinction. These are geometry-review images, not PBR beauty renders.

The first fresh-process reproduction misplaced the unchanged flame because the loaded scene had not evaluated its saved transform. It remains in `anatomy-r02/reproduction` as failed evidence. The corrected `reproduction-r3` matches both meshes, transforms and every pixel in all five whole-body renders. Its GLB hash differs only because scene-local data names differ; decoded geometry and transforms match exactly. Both copies pass the independent numerical audit. The authoring code also saves stable vertex arrays for rerunning that audit.

## Reproduce

Run these from this worktree; use a new private output directory for each attempt:

```sh
/usr/bin/blender --background --factory-startup --threads 2 --python tools/charizard-anatomy/reproduce.py -- --out /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/my-verification
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-anatomy/compare_reproduction.py --reproduction my-verification
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-anatomy/validate_tail_patch.py --candidate-dir /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/my-verification --output-prefix /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/my-verification/validation
```

`render_closeup.py` operates on loaded parent/candidate scenes through Blender MCP, linking read-only geometry into owned review scenes. `reopen_glb.py` imports only the saved candidate into another owned scene. `register_experiment.py` adds the candidate and matched parent close-ups to the existing reference desk; it does not write human reviews. `browser_check.mjs` checks both candidates and all seven shared views, then the phone preview route and switches between revisions.

The local tail unit remains open. After its surface and proportions pass, the head/horns, hands/feet and wing connections need anatomical work, followed by deformation topology, UV/PBR, rig, clips, attacks and playable integration. Kevin's S25 acceptance gate remains open for the separately repaired Field OS; browser simulation is not a device verdict.
