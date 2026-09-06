# Charizard r15 — lower abdomen blockout

Retained working source: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r15/charizard-hybrid-r15e-belly-transition.blend`.
Physical export: `charizard-blockout-r15e.glb` in the same private directory.

R15E broadens the lower abdomen and raises the hanging center, then blends the adjacent upper ring. Root and the xhigh critic accept this as a limited blockout improvement over r14f. Charizard remains far below the requested final quality. The flank is angular, the raised belly exposes more pelvic/tail-root volume, and head, neck and component joins remain unresolved. Kevin's visual gate remains RED. No production UVs, textures, rigs or clips were added.

A shortened jaw endpoint and B tapered rear cheek were rejected. C lowered the basal neck ring but did not meaningfully improve the visible collar; it was rejected. D is an intermediate belly shape with an equatorial kink; E softens that break. All private sources and four-view renders are preserved. The proposed eye-aperture edit was abandoned before an accepted transform.

Validation: source actually reopened; physical GLB exported, imported and rendered from four fixed cameras. 39 meshes, 3,216 control vertices, 7,984 evaluated triangles. Per-component closed-manifold and nondegenerate checks passed; imported per-part triangle counts and bounds matched. FlameSocket remains an empty attached to the physical tail, energyBaked=false, with no flame geometry. No whole-character intersection or deformation acceptance is claimed.

Scope audit against intake: only 137 body vertex positions changed; face arrays and object matrices are unchanged. The other 38 mesh coordinate arrays are unchanged. The source and GLB retain the previously documented local mouth-shading difference; this pass did not investigate or resolve it. The four cameras are consistent comparison views, not calibrated official orthographic matches.

Authoritative references remain the official HOME and artwork files recorded in whole-r11/references.json. No generated image or anatomy script was used for this iteration.

No merge, push, publication, web deployment or other Pokémon edits. Source scripts and receipts are in Git; private binary assets remain under /mnt/zer0models.
