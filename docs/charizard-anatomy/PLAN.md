# Charizard anatomy iteration

## Pstack autonomous run

- [x] Read the Principles section in full. Separate shared state by working in a new root-owned lane and a copied Blender scene. Prove the real artifact with matched views and coordinate/topology checks. Sequence the local tail repair before head, retopology, materials or rigging.
- [x] State the exit condition as a checkable predicate before the first iteration. The complete S+ contract remains `discovery/charizard/splus/plan.md` in the Pokémon workspace. This unit must reduce the flat proximal tail and visible join, preserve vertices outside the chosen anatomical region, retain a closed connected body and introduce no degenerate triangles. Five matched clay cameras and a close-up must support the improvement. Technical checks alone are insufficient.
- [x] Pick the wake mechanism. The existing native goal and heartbeat remain active; do not create duplicates.
- [x] r02a makes the smallest change supported by the seam audit. Numerical checks and matched renders support keeping it as an intermediate repair; the original flat-root predicate remains open.
- [x] Fresh-process verification caught a stale flame transform in the reproduction loader. Evaluating the loaded parent scene before copying transforms fixes it. The failed output is preserved as `reproduction`; `reproduction-r3` reproduces mesh values and all five images exactly.
- [x] Record this milestone in the canonical `discovery/charizard/decisions.tsv`, with a committed snapshot and receipts for reproducibility.
- [ ] Stop when the predicate is met. The tail unit is not the full Charizard goal; continue to head/limbs, deformation topology, official colors/PBR, rig/clips and playable integration.

## Current evidence and ownership

The bounded generation comparison is complete. Parent manual candidate is `assets/blender/charizard-tail-r01/charizard-tail-r01.blend`, derived from official illustration seed61062/octree256. The source image has been inspected again. The side view shows a broad proximal flat patch and an abrupt join at the previous Y=.15 cut. Prior validation proves that patch was preserved unchanged; more generator seeds will not repair this manually frozen region.

Root owns Blender MCP on process2418389. An unrelated Pikachu Blender process109382 remains untouched. A read-only CPU audit may measure tail sections and protected regions; it may not author Blender or mesh assets. The live Pokédex repair remains compiled on8469 and is not part of this editing lane.

Throughput checkpoint: one sequential geometry writer; independent CPU measurements run beside visual inspection. Scene copies and distinct candidate output directories eliminate shared writes. No GPU generation is queued. Scripts/receipts are committed here; binaries remain under `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02`.

Data shape: a revision pins its parent source/hash, a Blender-space protected region, explicit tail-section guides, unchanged vertex coordinates, geometry checks and matched review cameras. The coordinate convention is X left/right, +Y rear, Z up. This is manual shape refinement over the existing official-input Hunyuan mesh; no generated or unofficial imagery is a new input.

No source or output is approved as AAA/S+ yet. Current defects also include extra head projections and malformed hands/feet. UVs, official colors, production PBR, rig and animations remain incomplete. No merge/push without Kevin's approval.

## r02a result and next unit

The independent audit found 29 first-ring vertices behind the attachment plane and a local intersecting triangle pair. The first ring rotates before its center advances far enough. r02a replaces the first five generated rings with cubic Hermite ribbons that follow the original surface tangent, then meet the unchanged sixth ring. It moves 1,585 vertices; the original body, seam, distal tail and flame stay fixed.

Five matched whole-body renders and two matched close-ups were inspected, plus the actual Blender viewport. The circumferential fold is gone. The close-ups still show shallow longitudinal ribs, so this does not satisfy the full tail-unit predicate. Plane sections also exaggerate the root's oval shape when the plane cuts it obliquely; estimated perpendicular sections measure about 1.43–1.58 axis ratio in the sampled proximal region. Do not force a circle based on the original side image alone.

Next: inspect and smooth the local root's lengthwise ridges with an explicitly bounded anatomical selection, preserve unrelated body coordinates, then repeat the section/intersection and matched-angle review. Head/horn and hand/foot corrections follow before retopology, UVs, materials or rigging. Do not promote this static WIP into the live game as an accepted Charizard.

The phone preview uses the existing iterations route. An initial r02a check incorrectly supplied the reference-only `image` query for a mesh render; that check is preserved and the delivery URL corrected. No Pokédex application code was changed.

## Root surface batch: r02b through r02e

The orange selection renders establish one connected tail-root region with 9,902 weighted vertices and 112,475 protected coordinates. Native Blender smoothing in r02b leaves the visible ribs. A quadratic local surface fit in r02c removes much of the ribbing, but noisy mesh normals reverse 48 narrow inherited triangles. It is rejected. Neighborhood PCA normals in r02d eliminate those reversals and preserve the body volume within +0.00547% of r02a. The wider root check nevertheless finds 12 actual crossings in a narrow inner collar strip.

r02e removes 41 vertices inside that measured strip and fills its unchanged 29-vertex boundary with 27 triangles. It moves no remaining coordinates. Four recreated triangles have the same triples as old triangles; the native receipt explicitly accounts for these. The protected coordinates and their 224,371 oriented triangles remain exact. The same root intersection test measures r02a=2, r02d=12, r02e=0. This wider scope supersedes the old narrow seam test for this batch; neither proves whole-model intersection freedom.

All five whole-body clay views, two root views and the magnified inner strip were inspected for r02e. The actual Blender viewport and GLB reopening were inspected. Fresh process `reproduction-root-final` reproduces geometry, transforms, topology audit arrays, native patch receipt and all eight image pixels exactly. Original and reproduction pass independent CPU validation. The 253,700-triangle export has no authored UVs, materials, rig or clips.

Keep r02e as the next manual parent. The sharp seam and lengthwise ribs are repaired locally. Broad proximal ovality remains provisional, and the global head, limbs and wing roots need work. Do not keep making unbounded surface-smoothing passes. Next inspect official front/side head anatomy against the current malformed horns and face, define a protected head region, and make a distinct manual candidate. Deformation topology and final tail proportion review remain ahead of UVs, materials and rigging.

Root remains sole Blender author. Read-only CPU diagnoses and validators are tracked under `tools/charizard-anatomy/root_audit`; candidate records and receipts are under `canonical/characters/charizard/root-surface-batch`. All four attempts remain selectable, with assistant rejections kept separate from human reviews. Phone route: `tab=iterations&run=charizard-tail-r02e&view=root-side`. Browser checks pass at 412×892; actual phone acceptance remains pending. The repaired Field OS release f85e3ae295feec02 on8469 is unchanged. No merge/push.
