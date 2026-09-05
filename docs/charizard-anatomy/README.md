# Charizard tail repair r02a

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
