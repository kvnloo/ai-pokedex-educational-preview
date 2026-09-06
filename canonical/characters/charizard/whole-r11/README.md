# r11 coarse component blockout

Kevin's decomposition addendum is implemented in the existing owned lane. No competing author or task. All r03+ rollback files remain preserved. r10 intake and jaw candidate hashes were explicitly rechecked unchanged.

Four coarse revisions were rendered in orthographic front, side, rear and three-quarter views, with critique between changes. A had tall thigh masses, stacked oval face volumes, angular wing edges and a tail frame twist. B broadened/squatted the lower body, shortened arms, curved trailing edges and repaired the tail frame. C replaced the face ovals with a simple broad head block. D repaired the head/neck overlap. These are blockout candidates, not final likeness or production assets.

Current source: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r11/charizard-blockout-r11d-review.blend`. Matching export: `charizard-blockout-r11d.glb`. Earlier a/b/c/d checkpoints and the rejected unapplied GLB are preserved beside them.

The source contains independently controllable body/limb masses, head and neck, wing membranes, spars, tail, eye placeholders and hard parts. Eye placement placeholders are excluded from renders/export; teeth are deferred. Export has36 meshes,2,716 control vertices and6,696 evaluated triangles. Source is143,429 bytes. No UVs, textures, production materials, rig or animation. The source was reopened; evaluated GLB triangle counts, bounds and FlameSocket transform/parent were checked after reopening. Per-part evaluated geometry has no nonmanifold edges or degenerate triangles. Intentional overlapping construction volumes are not a production intersection pass.

Export validation caught a real mismatch: the first GLB omitted modifiers. It is rejected. Explicit `export_apply=True` corrected the export and the rerun passed. Raw GLB JSON was also inspected for mesh count and absence of images/textures/animations.

Reference ground truth remains official HOME/artwork and the low-resolution rear game sprite, with source hashes verified. Front/three-quarter comparisons expose unresolved head, neck and wing-root proportions. The supplied references do not provide matching orthographic side/rear views; those views remain partly inferred and unverified. The four-view critique records this instead of awarding a false pass.

The likeness gate remains RED. Continue coarse head/neck, wing-root and stance correction. Do not advance to detail, textures, topology lock, rigging or max audit. Requested effort remains xhigh; no runtime effort change is claimed. No merge, push, publication or website deployment.
