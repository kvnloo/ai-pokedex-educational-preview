# Charizard r17 — eye experiment, unfinished

Private artifacts: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r17`.

A (`charizard-hybrid-r17a-eye-wedge.blend`) is the working intermediate. Native edits raised six lower-front socket vertices by local Z 0.022 and lowered six upper-front vertices by 0.010. The xhigh critic found a sharper surrounding corner, but the exposed eye remains rounded. This is not an accepted expression or production gate.

B (`charizard-hybrid-r17b-eye-depth.blend`) moved each eye inward by local X 0.004. Root inspected all four full-body renders and detail views; the critic compared all four A/B head pairs, B front/threequarter, and official HOME. Reject B: it makes the oval smaller without giving the exposed eye the desired angular corner. B remains preserved; Blender was reopened to A after this verdict.

Next bounded eye correction: reshape the insert's lower forward contour upward toward the socket corner, fading to an unchanged rear half. Preserve A depth, socket geometry and rear opening height. Do not repeat recession. The max planner is independently reassessing larger silhouette priorities before this detail pass continues.

No r17 GLB, reopen validation, production acceptance, or preview delivery yet. R16B remains the last validated physical export. No merge, push or website change.

## C: muzzle/cheek trial

Planner reprioritized head silhouette before more eye detail. Native box selection verified head13/14, then local GZZ +0.03. Separate verified selection4,7,20,23,28,33 scaled local X1.1. Saved C separately and rendered all four full-body plus four fixed head-detail views; root opened all eight. Fresh coordinate read confirms edits. Root finds a modest close-up change, insufficient full-body improvement so far. Critic review pending; no acceptance or GLB claim. The source and eight renders are hashed in trial-c-manifest.json.

## C verdict and D trial

Critic rejected C after four full-body A/C pairs and detail/HOME inspection: it fills the saddle ahead of the brow without useful compactness. Restored A. C remains preserved. Its scope audit confirms only head coordinates changed, no faces or matrices.

D lifts the broader upper-rear crown: native verified selection5,6,21,22,29,32, local GZZ +0.04 and SXX1.15. Saved as charizard-hybrid-r17d-crown.blend, rendered four full-body and four head views; root inspected all eight. Distinct crown silhouette is visible, but enlarged rim obscures more eye and may be excessive. Critic verdict pending. No GLB or visual gate acceptance.

D verdict: reject. The xhigh critic confirms useful forehead break but eye rear-half occlusion outweighs gain. E repeats only the same crown local Z+0.04 from restored A, no width scaling. Native selection verified before move. E saved and all eight full-body/head renders inspected by root. Less severe occlusion than D, but eye still appears small within surround. E awaits critic; no visual acceptance.

E verdict: reject, restore A. Critic inspected all eight E renders and reopened A front/threequarter head views. Height-only still reduces eye exposure to a small oval inside broad surround. Stop isolated lifts of these six vertices. Crown and aperture are practically coupled in this construction; next pass must establish independent crown/aperture control and fit separate insert, preserving muzzle/mouth/jaw. A reopened after verdict.

## F: independent crown control

From A, native top-view face box selected only roof face4 [21,22,26,25]. Native inset0.015 created four additional vertices; selected inner face lifted local Z0.03. No scripted anatomy. Saved F independently. Root opened all four full-body and four head-detail renders. Eye exposure appears preserved while crown outline rises. Head control cage60vertices53faces, zero nonmanifold edges or degenerate faces. This narrow topology check is not production validation. Critic pending. Planner supports inset route but recommends broader region faces1+4 if this single-face patch looks like a central bump; that alternative is not executed.

F RETAINED as limited construction/form improvement by root and xhigh critic, who inspected all8 renders and A/HOME. Eye area remains filled, shallow saddle/crown rise distinct. Keep height; no further crown lifting. Whole-head/asset visual gate remains RED. Actual source reopened, GLB exported/reopened,39meshes3220controlvertices8016triangles, per-part manifold/nondegenerate and bounds/socket checks passed. Root inspected all4 imported GLB renders. Known mouth shading difference persists. No production UV/textures/rig/animation acceptance.
