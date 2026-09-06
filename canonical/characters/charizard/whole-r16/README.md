# Charizard r16 — jaw underside and lower neck

Retained source: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r16/charizard-hybrid-r16b-neck-flare.blend`.
Physical export: `charizard-blockout-r16b.glb` in the same private directory. Intake preserves r15E; A and B are independent rollback files.

A raises only the middle underside of the jaw, retaining the chin, mouth rim, endpoints and rear attachment. B aligns and broadens the lower neck cross-section so it spreads toward the shoulders. Root and the independent xhigh critic retained both as limited form improvements. The max advisor identified the rotated basal cross-section and recommended preserving separate components. The torso was not changed because the four-view review did not justify enlarging it.

Scope relative to intake: four jaw vertices and 32 lower-neck vertices changed. Neck heights, upper-neck vertices32–95, all face arrays, all object matrices and the other37mesh coordinate arrays are unchanged. R15's broader abdomen remains intact. No scripted anatomy or mesh joins/remeshes were used.

Actual reopened source and GLB: 39meshes,3216controlvertices,7984evaluatedtriangles. Per-part closedmanifold/nondegenerate checks passed; imported counts/bounds and FlameSocket transform matched. FlameSocket is EMPTY and energyBaked=false; no flame mesh. Root inspected all four source A/B views, all eight fixed head-detail intake/A renders, and all four actual imported-GLB B views.

Still RED: full likeness, surface joins/intersections, deformation topology and Kevin production gate. Chest seam remains visible in threequarter. The upper muzzle/skull and expression need work; limbs/wing joins and pelvic transition remain coarse. No production UV, textures, rig, animation or playable vertical-slice acceptance. R14's local source/GLB mouth-shading difference persists and was not re-investigated.

Export recovery: the first attempt ran immediately after open_mainfile in the same MCP call and failed because Blender context lacked active_object. No GLB existed. A fresh read verified source/mode/context and absence of output; export then succeeded in a separate call. Validator now asserts a valid context before starting. Do not blindly repeat an export if an output exists.

Official references remain HOME/art from whole-r11/references.json. Fixed views and detail cameras are consistent comparisons, not calibrated official orthographic matches. No merge, push, publication or website change.
