# Notes-only version evidence index

Generated 2026-09-07. No images reopened. This is an extracted receipt index, not a new visual certification. Chronological files can contain superseded interim decisions; explicit final retention/rejection receipts take precedence. Missing numbered directories do not prove missing experiments.

## whole-r01

### comparison-check.json

Source: `canonical/characters/charizard/whole-r01/comparison-check.json`

"phone": "Selections load; changing views can require scrolling above the dock. No device acceptance.",
"status": "desktop-comparison-pass/phone-scroll-limitation"

### review.json

Source: `canonical/characters/charizard/whole-r01/review.json`

"verdict": "needs-substantial-correction",
"improvements": [
"deviceAcceptance": "S25 pending; Pok\u00e9dex polish paused"

## whole-r02

### review.json

Source: `canonical/characters/charizard/whole-r02/review.json`

"verdict": "rejected-face-retain-tail",
"summary": "Tail path is shorter and clearer; reject facial deformation for pinched snout, radial wrinkles and uneven jaw.",
"retained": [
"rejected": [
"promotion": "No game deployment, merge or push. Official input ancestry retained.",

## whole-r03

### review.json

Source: `canonical/characters/charizard/whole-r03/review.json`

"verdict": "working-tail-checkpoint-needs-work",
"summary": "Retains shorter reposed tail and triangulation cleanup; restores the prior r01 face exactly after r02 facial regression. Working sculpt, not S+ or game-ready.",
"retained": [
"rejected": [
"promotion": "No game deployment, merge or push. Official input ancestry retained.",

## whole-r05-study

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r06

### review.md

Source: `canonical/characters/charizard/whole-r06/review.md`

The head comes from the official illustration input used by Hunyuan run `charizard-official-raw-61062-o256`. That source was selected earlier for clearer wing membranes and separated toes, not because its head had beaten the original HOME61061 head in a controlled comparison. Both the official HOME and official illustration images were inspected during r06. A dedicated HOME61061 head comparison is the next source-selection check.
| Muzzle | Native GUI Edit Mode `S Y 0.85`, LOCAL orientation, cursor at head-local `(0,.035,0)`. MCP selected 3,154 vertices with forward coordinate above `.035`. Maximum measured transform error `2.98e-8`; Basis unchanged. | Retain shorter profile; nasal bulb still wrong. |
| Jaw closure | Native GUI `R X 3` around head-local `(0,-.01,-.003)` on a separate key. 1,827 selected vertices, maximum transform error `3.38e-8`. | Retain narrower gap; mouth curve and hanging jaw unresolved. |
| Eye fit | MCP-native Blender BVH queries and separate shape keys place the lenses against the head, preserving front-to-back depth. Offset `.0008`; rim sampling is documented in `eye-surface-fit.json`. | Retain visibility as a study; gaze, eyelids and materials still fail. |
| Lower lip | Native GUI Smooth brush stroke from `(800,545)` through `(840,555),(885,560),(922,555)` to `(945,550)`, size90, strength.45, local-X symmetry. MCP mask protected upper jaw and neck. 258 vertices changed, maximum displacement `.0053222842`. | Retain small cleanup; folded lip remains. |
| Exact Boolean neck union | Native MCP Exact Union on an exclusive body copy produced one manifold component but a visibly torn seam. | Rejected; source and captures preserved. |
| Curved bridge | MCP trimmed body and head at head-local Up `-.19` and `-.145`. Native GUI subdivided 13 longest upper-loop edges to make both loops 199 vertices, bridged them and set three intermediate rows through F9. Default path interpolation overshot into a collar. | Rejected curvature; retain native bridge connectivity. |
| Linear bridge | MCP graph traversal of the 796 bridge quads found five rows of 199 vertices. `Bridge_Linear_r06` sets the 597 middle vertices to endpoint interpolation at row/4, keeping both boundary loops unchanged. Maximum correction `.08646571`. | Retain continuous connection; anatomical shaping remains. |
| Tessellation | Native GUI `Ctrl T` triangulated one degenerate quad, without vertex displacement. Export has zero degenerate triangles. | Retain. |
`gui-modeling.jsonl` records input delivery. Resulting geometry and captures, rather than the journal alone, establish what happened. Unequal-loop bridging initially ignored the requested cut count; native undo returned to Sculpt Mode and required explicit inspection before proceeding. A first observation after Subdivide was stale; the next observation confirmed completion without repeating the operation.
The inline linearization used adjacency restricted to the captured bridge faces and breadth-first distance from the lower boundary. Every middle vertex had one neighbor in the preceding row and one in the following row. Following those chains gave the endpoint pair used for linear interpolation. `bridge-linear-ta

## whole-r07

### README.md

Source: `canonical/characters/charizard/whole-r07/README.md`

- `charizard-home-head-r07-study-repaired.blend`: editable scene, with the visible repaired triangulated head and both closed eye patches. Original shape-key head and rejected trials remain hidden. The repaired head bakes its previous Smooth key.
## Construction and failed trials
The first Exact lid union destroyed most of the head and is rejected. The MANIFOLD union preserved the native mesh but produced folded n-gons: triangulation contained 58 identical opposite-winding face pairs. The initial GLB import deleted one face per pair and left 174 nonmanifold edges. The later weld/dissolve trial did not fix it and is also rejected.
The retained repair removes both faces of each zero-thickness pair and 58 unused vertices. It moves no surviving vertex, preserves bounds and signed volume, and leaves the head as one closed component with 42,960 triangles. Reopening the new GLB preserves every triangle with importer vertex merging both enabled and disabled. Unmerged eye primitives have expected material-seam vertex duplication; the merged import is closed. No broader self-intersection or deformation certification is implied.
Read `study-adjudication.json` with the original receipts. It supersedes misleading pending labels while preserving those originals. The frozen failed GLB remains available and must not be confused with the `study-repaired` version.
The source-density comparison is post-hoc and retains input, seed and pose differences. It is not a controlled experiment. Only Basis reprojection was numerically checked during the approximate frame conversion; the Blender API received all shape keys. The original density probe and several early inline modeling operations do not have complete executable recipe capture. Frozen checkpoints and receipts, rather than an asserted end-to-end replay, are authoritative for those steps. Original executed helper versions are archived alongside the subsequently guarded helpers.
Eight new read-only browser checks cover both comparison entries and all four phone views at 412×892, with zero page errors or write requests. Root inspected the resulting desktop and phone screenshots. These are simulated checks, not acceptance on Kevin's S25.
## Next asset gate

### muzzle-planes-verdict.json

Source: `canonical/characters/charizard/whole-r07/muzzle-planes-verdict.json`

"verdict": "rejected as likeness gain",

## whole-r09

### README.md

Source: `canonical/characters/charizard/whole-r09/README.md`

Retained as an unfinished local study, not an accepted Charizard. Root is the sole Blender author. The xhigh critic only inspected images. Field OS on 8469 is unchanged; no merge or push.
The source is a full working-session checkpoint containing historic studies. It is not yet a clean component-only hero file. Private binaries and screenshots remain outside Git; `manifest.json` records their hashes. The final source and GLB are listed explicitly above so backups and rejected trials cannot be confused with the retained study.
The first native horn taper exposed neck geometry behind a screen-space mask. It was rejected and the complete pre-pinch checkpoint reopened. The retained second pass hid the body in Edit Mode before masking the skull and roots. Four native Pinch strokes at 80 px and strength 1 changed 1,041 vertices, with no movement in hidden or masked vertices and none below Z=.5. No script computed anatomical vertex positions.
Root inspected four fixed whole-body views and head closeups; the xhigh critic compared the matched before/after images. The taper is modestly better at whole-body scale. Rounded tips, shaft waviness, a taper shoulder and a shallow tip dent remain. The nose/jaw, hands, wing membranes and tail still need substantial work. See `adjudication.json` for retained and rejected artifacts.
- `horn-isolated-native-delta.json` and `horn-isolated-reopen.json`: retained native change and round trip.
- `browser-study.json`: phone-sized inspector and desktop selector/image checks. These do not constitute S25 device or model-quality acceptance.
Mechanical helpers live in `tools/charizard-whole/*r09.py`. They do not replay native strokes. `separate_flame_r09.py` requires the untouched pre-separation intake and must not be rerun on the current mesh. Open the retained source in a separate MCP call before `export_horn_r09.py`: reopening and exporting in one callback invalidates Blender's UI context. All exports must specify both selection and active-scene scope. Never mutate shared review mesh data.
Next: separate the head/neck, body, wings, tail and hard components into controllable components, preserving this whole-body rollback. Continue a bounded native shape correction, starting with muzzle/jaw or replacement horn construction. Do not repeat ineffective micro-strokes or advance to texture/rig work before the shape gate.

### integrity-review.json

Source: `canonical/characters/charizard/whole-r09/integrity-review.json`

{
  "reviewer": "r07_evidence_review",
  "mode": "read-only, no Blender/CUA authoring",
  "blockers": [],
  "independentGlbCheck": {
    "scenes": 1,
    "meshes": 1,
    "nodes": 2,
    "vertices": 345177,
    "triangles": 690350,
    "materials": 0,
    "animations": 0,
    "attributes": [
      "POSITION",
      "NORMAL"
    ],
    "socketParentAndExtrasCorrect": true
  },
  "limitation": "validate_native_r09.py references a prior in-session validation-scene suffix; it is a one-off receipt refresh, not a general replay tool. The final export_horn_r09.py evidence is independent."
}


## whole-r10

### README.md

Source: `canonical/characters/charizard/whole-r10/README.md`

Kevin's operating law is recorded in ../OPERATING-LAW.md. Default requested effort is xhigh, with max reserved for the bounded final audit. The app accepted an xhigh continuation request; this does not prove that the already-running turn changed effort.
## Source and result
Root inspected fixed front/side/three-quarter head comparisons and four whole-body views, plus the actual GUI with official HOME reference. Fixed mesh comparison cameras are not calibrated official-art overlays. No S+ claim. No publication, merge or push. Kevin's visual acceptance remains required before production textures, rigging or animation.

## whole-r11

### README.md

Source: `canonical/characters/charizard/whole-r11/README.md`

Current source: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r11/charizard-blockout-r11d-review.blend`. Matching export: `charizard-blockout-r11d.glb`. Earlier a/b/c/d checkpoints and the rejected unapplied GLB are preserved beside them.
Export validation caught a real mismatch: the first GLB omitted modifiers. It is rejected. Explicit `export_apply=True` corrected the export and the rerun passed. Raw GLB JSON was also inspected for mesh count and absence of images/textures/animations.

### rejected-export.json

Source: `canonical/characters/charizard/whole-r11/rejected-export.json`

"reason": "export_apply omitted; exported base cages rather than evaluated modifiers",

## whole-r12

### README.md

Source: `canonical/characters/charizard/whole-r12/README.md`

Retained candidate: `charizard-hybrid-r12c.blend`, physical export `charizard-blockout-r12c.glb`, under `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r12`. Intake, A, B and C sources and twelve fixed-camera renders remain separate. Binary assets stay private; hashes and receipts are in this directory.

## whole-r13

### README.md

Source: `canonical/characters/charizard/whole-r13/README.md`

Current provisional candidate is `charizard-hybrid-r13i-head-turn.blend`, with `charizard-blockout-r13i.glb`, under `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r13`. F and H preserve alternative poses. This remains a coarse blockout. Likeness and production acceptance are RED.
Retained changes raise the nose, narrow the bridge while retaining the cheeks, and introduce a coarse inset socket around the existing eye placeholders. Two eye placements and a socket-edge collapse were rejected. The head, neck, eyes and horns remain independently editable; their group turns toward the HOME reference in H and I. I has a head yaw of -63 degrees, versus -18 in F. This is a pose study, not calibrated camera matching.
Each A–I change has front, side, rear and three-quarter source renders. The first G captures preceded completion of a native menu operation; only `r13g-ready-*` represent the completed rejected trial. G was reverted by reopening F. F, H and I have actual GLB reimports, geometry checks and four-camera reopened renders. All four I source and GLB views were visually inspected. Their silhouettes and component placement agree; images are not pixel-identical.
The muzzle still lacks a convincing mouth/jaw structure, the eyes lack Charizard's expression, and the neck/chest seam is visible. Wing roots, hand construction and stance remain coarse. Next work should address jaw/cheek volume and the head/neck transition before further eye nudges or detail. Kevin remains the visual gate before production texture, rig and animation work.
Official reference provenance is inherited from `../whole-r11/references.json`. HOME was open beside the model; fixed scene cameras provide consistent comparisons. Exact orthographic official side/rear references are unavailable, so no measured side/rear fidelity score is claimed. Private binary sources, rejected candidates and renders are hashed in `manifest.json`; no previous checkpoints were overwritten.

### glb-render-comparison.json

Source: `canonical/characters/charizard/whole-r13/glb-render-comparison.json`

{
  "front": {
    "dimensions": [
      1000,
      1000
    ],
    "pixelIdentical": false,
    "meanAbsoluteChannelDifference": [
      0.027862,
      0.029639,
      0.029811
    ]
  },
  "side": {
    "dimensions": [
      1000,
      1000
    ],
    "pixelIdentical": false,
    "meanAbsoluteChannelDifference": [
      0.022956,
      0.024187,
      0.024272
    ]
  },
  "rear": {
    "dimensions": [
      1000,
      1000
    ],
    "pixelIdentical": false,
    "meanAbsoluteChannelDifference": [
      0.030308,
      0.031172,
      0.031199
    ]
  },
  "threequarter": {
    "dimensions": [
      1000,
      1000
    ],
    "pixelIdentical": false,
    "meanAbsoluteChannelDifference": [
      0.028968,
      0.030444,
      0.030615
    ]
  }
}


## whole-r14

### README.md

Source: `canonical/characters/charizard/whole-r14/README.md`

Retained source: `charizard-hybrid-r14f-mouth-clearance.blend`. Physical export: `charizard-blockout-r14f.glb`. Both are under `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r14`, actually reopened and inspected. This remains a coarse component blockout. Likeness and production acceptance are RED.
Native Blender bisect, separate, fill, inset and transform operations create an independently editable lower jaw from the existing head. The mouth has recessed internal faces and a small physical clearance. A native scale of the lowest neck ring reduces its overhang against the torso. A second neck-ring reduction was rejected because it gave little visible benefit and thinned the transition. All anatomy changes used keyboard/mouse; bpy handled views, read-only inspection, checkpoints and exports. One owned Blender, requested xhigh. No max pass, new mesh lane, merge, push or deployment.
The retained export has 39 meshes, 3,216 control vertices and 7,984 evaluated triangles. Upper head is 56 vertices/49 faces; jaw is 40 vertices/33 faces. Both retain subdivision level 1 and separate construction topology. Existing body, eyes, horns, wings, limbs and tail mesh coordinates stay unchanged. Sixteen neck vertices changed; the head topology changed, even though its final vertex count happens to equal the intake count. All existing object transforms stayed unchanged. The new jaw has a native local-Z clearance offset of -0.006.
Per-part evaluated manifold/degenerate checks pass. Reopened GLB bounds and triangle counts match. A targeted evaluated BVH comparison reports zero overlaps between upper head and jaw. Spatial matching confirms all 412 upper-head and 284 jaw triangles correspond between source and GLB, with maximum vertex displacement below 2.7e-7 Blender units. These checks do not accept other component intersections or deformation topology.
Four fixed source views were inspected after A through F. C and F also have four rendered GLB views. Fresh F source renders after reopening are pixel-identical to the initial F renders. F GLB renders retain a localized mouth-shading difference in Workbench despite matching geometry. Subdivision levels match, all source faces are already smooth, and matched corner normals differ by at most about 0.02 degrees. The precise rendering cause remains unresolved; do not claim identical appearance. `render-comparison-r14f.json` includes full-frame and head-region measurements. The first normal-comparison report used rounded-position keys; the later spatial comparison resolves those rounding misses and proves triangle correspondence.
The mouth corners still extend too far toward the rear of the head, the eyes lack the official expression, and joins at the neck/chest and wing roots remain visible. The new jaw is a construction component, not a finished oral cavity or rig. Next form work should correct the mouth endpoint/cheek relationship and head expression against HOME, with a separate bounded render check for the source/GLB shading difference. No texture, UV, rig or animation transition is authorized by this checkpoint.
All intake/A–F source checkpoints and rejected D remain private and unchanged. Man

### normal-triangle-comparison-r14f.json

Source: `canonical/characters/charizard/whole-r14/normal-triangle-comparison-r14f.json`

{
  "GEO-r11-head-block": {
    "sourceTriangles": 412,
    "glbTriangles": 412,
    "matchingTriangles": 231,
    "sourceUniquePositions": 208,
    "glbUniquePositions": 208,
    "matchedPositions": 171,
    "maxCornerNormalAngleDegrees": 0.01978234059262607,
    "meanCornerNormalAngleDegrees": 0.00011551731732920332
  },
  "GEO-r14-jaw": {
    "sourceTriangles": 284,
    "glbTriangles": 284,
    "matchingTriangles": 187,
    "sourceUniquePositions": 144,
    "glbUniquePositions": 144,
    "matchedPositions": 127,
    "maxCornerNormalAngleDegrees": 0.01978234059262607,
    "meanCornerNormalAngleDegrees": 0.0003165174494820171
  }
}


### render-comparison-r14f.json

Source: `canonical/characters/charizard/whole-r14/render-comparison-r14f.json`

{
  "front": {
    "sourceReopenedVsGLBMeanAbsoluteRGB": [
      0.06897,
      0.073408,
      0.073929
    ],
    "initialVsReopenedSourceMeanAbsoluteRGB": [
      0.0,
      0.0,
      0.0
    ],
    "identical": false,
    "headRegion": [
      345,
      180,
      580,
      305
    ],
    "headRegionMeanAbsoluteRGB": [
      1.9586382978723405,
      2.072204255319149,
      2.0839148936170213
    ]
  },
  "side": {
    "sourceReopenedVsGLBMeanAbsoluteRGB": [
      0.070658,
      0.075066,
      0.075444
    ],
    "initialVsReopenedSourceMeanAbsoluteRGB": [
      0.0,
      0.0,
      0.0
    ],
    "identical": false,
    "headRegion": [
      365,
      180,
      575,
      305
    ],
    "headRegionMeanAbsoluteRGB": [
      2.3235047619047617,
      2.474552380952381,
      2.4858666666666664
    ]
  },
  "rear": {
    "sourceReopenedVsGLBMeanAbsoluteRGB": [
      0.078797,
      0.082799,
      0.083008
    ],
    "initialVsReopenedSourceMeanAbsoluteRGB": [
      0.0,
      0.0,
      0.0
    ],
    "identical": false,
    "headRegion": [
      440,
      180,
      655,
      305
    ],
    "headRegionMeanAbsoluteRGB": [
      2.234753488372093,
      2.362827906976744,
      2.371348837209302
    ]
  },
  "threequarter": {
    "sourceReopenedVsGLBMeanAbsoluteRGB": [
      0.092631,
      0.097925,
      0.098403
    ],
    "initialVsReopenedSourceMeanAbsoluteRGB": [
      0.0,
      0.0,
      0.0
    ],
    "identical": false,
    "headRegion": [
      340,
      195,
      585,
      330
    ],
    "headRegionMeanAbsoluteRGB": [
      2.592320483749055,
  

### spatial-triangle-comparison-r14f.json

Source: `canonical/characters/charizard/whole-r14/spatial-triangle-comparison-r14f.json`

{
  "GEO-r11-head-block": {
    "sourceTriangles": 412,
    "glbTriangles": 412,
    "matchingTriangles": 412,
    "maxVertexDistance": 2.6415435172566504e-07,
    "uniqueMappedVertices": 208
  },
  "GEO-r14-jaw": {
    "sourceTriangles": 284,
    "glbTriangles": 284,
    "matchingTriangles": 284,
    "maxVertexDistance": 2.6193850999334245e-07,
    "uniqueMappedVertices": 144
  }
}


## whole-r15

### README.md

Source: `canonical/characters/charizard/whole-r15/README.md`

Retained working source: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r15/charizard-hybrid-r15e-belly-transition.blend`.
R15E broadens the lower abdomen and raises the hanging center, then blends the adjacent upper ring. Root and the xhigh critic accept this as a limited blockout improvement over r14f. Charizard remains far below the requested final quality. The flank is angular, the raised belly exposes more pelvic/tail-root volume, and head, neck and component joins remain unresolved. Kevin's visual gate remains RED. No production UVs, textures, rigs or clips were added.
A shortened jaw endpoint and B tapered rear cheek were rejected. C lowered the basal neck ring but did not meaningfully improve the visible collar; it was rejected. D is an intermediate belly shape with an equatorial kink; E softens that break. All private sources and four-view renders are preserved. The proposed eye-aperture edit was abandoned before an accepted transform.
Validation: source actually reopened; physical GLB exported, imported and rendered from four fixed cameras. 39 meshes, 3,216 control vertices, 7,984 evaluated triangles. Per-component closed-manifold and nondegenerate checks passed; imported per-part triangle counts and bounds matched. FlameSocket remains an empty attached to the physical tail, energyBaked=false, with no flame geometry. No whole-character intersection or deformation acceptance is claimed.
Scope audit against intake: only 137 body vertex positions changed; face arrays and object matrices are unchanged. The other 38 mesh coordinate arrays are unchanged. The source and GLB retain the previously documented local mouth-shading difference; this pass did not investigate or resolve it. The four cameras are consistent comparison views, not calibrated official orthographic matches.

## whole-r16

### README.md

Source: `canonical/characters/charizard/whole-r16/README.md`

Retained source: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r16/charizard-hybrid-r16b-neck-flare.blend`.
A raises only the middle underside of the jaw, retaining the chin, mouth rim, endpoints and rear attachment. B aligns and broadens the lower neck cross-section so it spreads toward the shoulders. Root and the independent xhigh critic retained both as limited form improvements. The max advisor identified the rotated basal cross-section and recommended preserving separate components. The torso was not changed because the four-view review did not justify enlarging it.
Still RED: full likeness, surface joins/intersections, deformation topology and Kevin production gate. Chest seam remains visible in threequarter. The upper muzzle/skull and expression need work; limbs/wing joins and pelvic transition remain coarse. No production UV, textures, rig, animation or playable vertical-slice acceptance. R14's local source/GLB mouth-shading difference persists and was not re-investigated.
Export recovery: the first attempt ran immediately after open_mainfile in the same MCP call and failed because Blender context lacked active_object. No GLB existed. A fresh read verified source/mode/context and absence of output; export then succeeded in a separate call. Validator now asserts a valid context before starting. Do not blindly repeat an export if an output exists.

## whole-r17

### README.md

Source: `canonical/characters/charizard/whole-r17/README.md`

A (`charizard-hybrid-r17a-eye-wedge.blend`) is the working intermediate. Native edits raised six lower-front socket vertices by local Z 0.022 and lowered six upper-front vertices by 0.010. The xhigh critic found a sharper surrounding corner, but the exposed eye remains rounded. This is not an accepted expression or production gate.
B (`charizard-hybrid-r17b-eye-depth.blend`) moved each eye inward by local X 0.004. Root inspected all four full-body renders and detail views; the critic compared all four A/B head pairs, B front/threequarter, and official HOME. Reject B: it makes the oval smaller without giving the exposed eye the desired angular corner. B remains preserved; Blender was reopened to A after this verdict.
Next bounded eye correction: reshape the insert's lower forward contour upward toward the socket corner, fading to an unchanged rear half. Preserve A depth, socket geometry and rear opening height. Do not repeat recession. The max planner is independently reassessing larger silhouette priorities before this detail pass continues.
No r17 GLB, reopen validation, production acceptance, or preview delivery yet. R16B remains the last validated physical export. No merge, push or website change.
Planner reprioritized head silhouette before more eye detail. Native box selection verified head13/14, then local GZZ +0.03. Separate verified selection4,7,20,23,28,33 scaled local X1.1. Saved C separately and rendered all four full-body plus four fixed head-detail views; root opened all eight. Fresh coordinate read confirms edits. Root finds a modest close-up change, insufficient full-body improvement so far. Critic review pending; no acceptance or GLB claim. The source and eight renders are hashed in trial-c-manifest.json.
## C verdict and D trial
Critic rejected C after four full-body A/C pairs and detail/HOME inspection: it fills the saddle ahead of the brow without useful compactness. Restored A. C remains preserved. Its scope audit confirms only head coordinates changed, no faces or matrices.
D lifts the broader upper-rear crown: native verified selection5,6,21,22,29,32, local GZZ +0.04 and SXX1.15. Saved as charizard-hybrid-r17d-crown.blend, rendered four full-body and four head views; root inspected all eight. Distinct crown silhouette is visible, but enlarged rim obscures more eye and may be excessive. Critic verdict pending. No GLB or visual gate acceptance.
D verdict: reject. The xhigh critic confirms useful forehead break but eye rear-half occlusion outweighs gain. E repeats only the same crown local Z+0.04 from restored A, no width scaling. Native selection verified before move. E saved and all eight full-body/head renders inspected by root. Less severe occlusion than D, but eye still appears small within surround. E awaits critic; no visual acceptance.
E verdict: reject, restore A. Critic inspected all eight E renders and reopened A front/threequarter head views. Height-only still reduces eye exposure to a small oval inside broad surround. Stop isolated lifts of these six vertices. Crown and aperture are practically coupled in this construction; next pass must establish independent crown/aperture control and fit separate insert, pre

## whole-r18

### README.md

Source: `canonical/characters/charizard/whole-r18/README.md`

Intake preserves retained r17F. Root inspected all four intake leg closeups; critic compared HOME and requested lower-haunch taper into broad short ankle, feet fixed.
A native edits: both thighs selected in multi-edit, front-view box lower region selects99vertices each, worldZ0.041235–0.235310. GY−0.05 then SY0.85. Object-mode shins SX1.2 about individual origins. Saved A and rendered four full-body plus four leg views. Root inspected four leg views and rejected visible abrupt posterior ledge at selected/unselected boundary. Intake reopened. No A export or quality acceptance. Next use gradual influence between lower taper and preserved upper mass; do not repeat hard boundary.
From intake: native lower50vertices/thigh worldZ0.041–0.108 selected. Native GY−0.05 with Smooth proportional editing radius0.26; no depth compression or shin changes. Proportional editing switched off afterward. Scope audit:136vertices per thigh moved only worldY, maximum0.05; all other meshes, faces and matrices unchanged. Root inspected all8 leg/full-body renders. Rear shelf removed; fuller upper mass and visible instep preserved. Independent critic pending; no B acceptance/export yet.
B RETAINED as limited haunch-form improvement by root and xhigh critic. Critic inspected4legdetails, Bfront/threequarter, intake side/threequarter and HOME: diagonal descent, upper mass and instep preserved, no ledge. Keep displacement; more forward movement risks swallowing instep. Ankle narrowing/feet still unresolved. Actual source and GLB reopened;39meshes3220controlvertices8016triangles, per-part manifold/nondegenerate, imported bounds/count/socket checks pass. Root inspected all4 imported GLB renders; known mouth shading difference persists. Whole likeness/intersections/production gate remain false. No UV/texture/rig/animation advancement.

## whole-r19

### README.md

Source: `canonical/characters/charizard/whole-r19/README.md`

Intake preserves retained r18B. Critic requested fuller outer shoulder without increased total span: root, apex and outer lower tip held fixed. Native multi-object vertex selection verified membrane3 each and leading spar30–39 each. Median pivot SX1.05 then GZ+0.04. Saved independent A source and four renders in /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r19. Root inspected all4: fuller shoulder, continuous membrane/spar border; corner remains angular. Critic pending, no visual acceptance or GLB yet. Scope audit records only targeted coordinates changed; faces and matrices unchanged. No production progression or merge/push.
A retained by root and xhigh critic as limited wing-form improvement. Critic inspected all4source views, previous Bfront and HOME. Fuller outer panels visible front/rear/threequarter, no visible gap/sliver, scallops preserved. Keep amplitude; further movement risks boxy shoulder. Source and GLB actually reopened:39meshes3220controlvertices8016triangles; per-part manifold/nondegenerate, bounds/count/socket checks passed. Root inspected all4importedGLBrenders; knownmouthshadingdifference persists. Whole visual/intersection/production gates false. No texture/rig/animation progression.

## whole-r20

### README.md

Source: `canonical/characters/charizard/whole-r20/README.md`

A shortens the front upper muzzle and matching jaw via native local Y +0.035 on 16 vertices each. Scope audit confirms no other coordinate, face or matrix changes. Xhigh critic retained A: compact blunt muzzle, preserved mouth alignment and eye aperture; stop shortening here.
B tests the upper throat beneath the rear cheek: native local Y -0.03 on neck vertices 86–90 with smooth proportional radius 0.22. Anatomy was edited with native keyboard input; bpy set selection/UI and saved/rendered only. Separate source and four fullbody plus four head renders preserve A rollback. B critic pending; no GLB or production acceptance claimed. Root inspected B front and three-quarter head; other views remain to inspect.
B retained as a limited throat-continuity gain. Xhigh critic inspected all eight B renders, opposing A head views and HOME: reduced unsupported overhang, retained neck thickness, no new collar/jowl. Keep amplitude; visible coarse boundary remains unresolved. Root inspected opposing side/rear head views. Coordinate audit proves only26 neck vertices changed localY, max0.03; othermesh coordinates unchanged. Export/reopen validation remains pending.
R20B source and exported GLB reopened. 39 meshes,3220 control vertices,8016 evaluated triangles. Per-part manifold/nondegenerate and imported triangle/bounds/socket checks pass. Root inspected all four reopened GLB renders. Existing mouth shading discrepancy remains visible; construction seams and overlaps remain unresolved. No whole-character visual or production acceptance.

## whole-r21

### README.md

Source: `canonical/characters/charizard/whole-r21/README.md`

Intake preserves retained and export-validated r20B. Native Object Mode Ctrl1 adds subdivision level1 to the two arm components, previously without modifiers. No coordinate writes. A saved separately and rendered front/side/rear/threequarter. Root inspected front and threequarter: elbow corners round off; possible overly continuous tube shape needs critique. Xhigh critic pending. No retention, GLB export or production gate claimed.
A retained by xhigh critic after matching render subdivision to viewport level1. Original audit records initial render2; matched render files supersede original visual review. No further subdivision.
C retained by xhigh critic after four views plus matchedA and HOME. Root inspected remaining views and audited48 tip vertices + two palm transforms only; no face changes. Telegram17160 confirmed.
D retained by root and xhigh critic: bend visible side/threequarter, spread/size/attachments stable, no collapsed sections at render scale. Keep amplitude; tips remain blunt. Read-only source snapshots prove original16vertices per digit untouched, only8new vertices each; all other mesh coordinates unchanged. Source/GLB reopened:39meshes3268controlvertices8456triangles. Perpart manifold/nondegenerate and importedbounds/count/socket pass. Root inspected all4source and all4reopenedGLBrenders. Knownmouthshading discrepancy, construction overlaps/seams and fullvisualgate remain unresolved.

## whole-r22

### README.md

Source: `canonical/characters/charizard/whole-r22/README.md`

Preserves retained r21D. No anatomy edits yet. Native side wireframe inspected. Tail has seven 16-vertex rings; measured mean radii taper .225,.170,.130,.105,.075,.049,.021. Centers follow a low returning arc. Therefore no evidence for indiscriminate thinning; path versus pelvic attachment remains the next visual question. Meta planner read-only review running. Current GUI is tail Edit Mode with nothing selected.
A retained by critic as limited placement gain: frontbulb recedes, higher side departure. Rearplug remains. Root inspected rear closeup; attachmentaudit verifies unchangedfaces/matrix/distalcoords and EMPTYsocket at(.86,.13,.58),energyBakedfalse.
B bounded correction: native median SX1.2 ring0 and SX1.1 ring1. Height/distalcurve held. SavedB and4views. Root inspected front/rear; critic pending. No production acceptance.
B retained by root and critic after all4source views; broader lesscircular rear departure, continuous taper, frontbulb remains suppressed, no newcuff. Stop root loop. Seam/integration incomplete. Source/GLB reopened:39meshes3268controlverts8456triangles; manifold/nondegenerate/bounds/count/socket checks pass. Reopened GLB visual renders pending.

## whole-r23

### README.md

Source: `canonical/characters/charizard/whole-r23/README.md`

Intake preserves retained r22B. Chest source coordinates and four details captured. Root side/threequarter inspection: largely continuous side contour, jagged shading boundary between separate body/neck surfaces. Do not assume more buriedring movement solves seam.
A reversible torso-only nativeCtrl1 adds subdivision1, render matched1 mechanically. Saved separate source and4views. Rootthreequarter: smoother abdomen silhouette, collar persists. Critic pending on retained pear mass/attachments. No retention/GLB/production gate claim.
A retained by root/critic after4views: pear mass preserved, no newwaist/gaps, cleanerflank curve. Stopsubdivision1. Collar remainsjunctionissue.

## whole-r24

### README.md

Source: `canonical/characters/charizard/whole-r24/README.md`

Base retained r23A. Native globalRZ+12 degrees on head/jaw/eyes/horns about upperneckring center(-.15833,-.118732,1.56). Upperneckring80–95 follows12degrees; ring64–79 follows6degrees, lowerneckfixed. bpy selection/pivot/fileIO only; native keys for anatomy. Savedintake/A and4renders. Root inspectedfront/threequarter; critic pending. No headshape edits, no acceptance/export claim.
Critic retainsA as presentation adjustment after4views,r23Afront/3q,HOME. Morecompact3q muzzle and clearerhorns; no obviousnewneckkink/thinning. Underlyingjaw/head gate notcomplete. Stopposeloop. Telegram17173 confirmed. Export validation pending.
Source/GLB reopened and root inspected all4GLBrenders. 39meshes3268controlverts9856triangles; increase includes retained torso subdivision1. Perpart manifold/nondegenerate and importedbounds/count/socket pass. Existing mouthshading discrepancy remains. No wholevisual/production acceptance.

## whole-r25

### README.md

Source: `canonical/characters/charizard/whole-r25/README.md`

Base retained/exportvalidatedr24A. Native multiobjectedit inwardtranslations: elbow membrane1+leading10–19 X±.12; wrist membrane2+leading20–29+finger-spar0–7 X±.10. Leftpositive/rightnegative. Proportionaloff. Roots/outershoulders/tips intendedfixed; objectsseparate. SavedA and4views. Rootfront/3q inspected: shorterinner supports, fullerfan; critic/scopeaudit pending. No retention or export claim.
A audit confirms intended76wing coordinates Xonly, roots/outerlandmarks unchanged. Rootall4views. Head/eyes/jaw versuswing surfaceBVH no overlap pairs; containmentnotchecked, notwholeintersectionpass. Critic rejects retention pending silhouetteclearance correction despite no physicaloverlap. Telegram17184 confirmedApreview.
B native matchingwristgroups .05outward, keepingelbowpositions. SavedB and4views; root3q gapimproved. Finalcriticpending; nomoreamplitudeloop.
B retained by critic after4views and A3q comparison. Clearbackgroundgap beside muzzle restored; broaderfans/spreadspars retained, continuousborders/scallops, no observednewkink/gap. Root inspectedall4sourceviews. Closewingtrial atthisamplitude. Exportvalidationpending; wholevisualgate false.

## whole-r26

### README.md

Source: `canonical/characters/charizard/whole-r26/README.md`

Preserves retained/exportvalidatedr25B. Four leg detail views and read-only thigh/shin/foot/claw worldcoordinates captured. Root inspected side/threequarter: exposed contour remains roundedhaunch into flatovalfoot; shin largelyburied. Planner using details to distinguish visibleankle correction from ineffective buriedmesh motion. No anatomy edit yet.

### camera-diagnostic.json

Source: `canonical/characters/charizard/whole-r26/camera-diagnostic.json`

"rootVisualReview": "Lower elevation reduces head top visibility; rounded muzzle/jaw concern persists. Not a calibrated reference match and not production acceptance.",

### export-review.md

Source: `canonical/characters/charizard/whole-r26/export-review.md`

Root inspected all four reopened GLB renders. Overall forms and the retained jaw taper are present. The previously documented source/GLB mouth shading difference persists; this pass does not resolve it. Whole-character visual and production gates remain false. No textures, UVs or animation have been added.
Next named form target from the whole-blockout critic is weak center foot-claw projection relative to the outer pair. Do not reopen the ankle or increase jaw amplitude without new evidence.

### whole-blockout-review.md

Source: `canonical/characters/charizard/whole-r26/whole-blockout-review.md`

# Whole-blockout review of retained r25B
Status: needs work. R26 intake has no anatomy changes.
- The pear abdomen, small arms, large thighs and broad wing fans read at full-body size. This supports those broad blockout directions, not production acceptance.
- The max planner withdrew the proposed ankle edit after inspecting the detail views: the side contour is continuous, the shin is mostly buried, and no major ankle silhouette failure was established. Do not widen or raise the shin speculatively.
- Wing r25B remains retained locally. That verdict does not certify the whole character.
## Next gate
Xhigh critic is reviewing all four views against HOME. Require a named view, anatomical landmark, visible discrepancy and correction direction for any new anatomy pass. Rank silhouette/volume before seams or detail. Root remains sole Blender author; use native input for anatomy and preserve rollback. No textures, UVs, rigging or production acceptance before Kevin's visual gate.

## whole-r27

### README.md

Source: `canonical/characters/charizard/whole-r27/README.md`

Intake preserves retained r26B. All six claws had identical dimensions and Y positions; the curved foot buried more of the center claw than the outer pair.
Native object-mode global-Y -.025 moved center claws L1/R1 forward. All mesh coordinates remain unchanged, and only those two object matrices changed. Root inspected all four full-body renders and intake/candidate three-quarter foot details: more balanced exposed center projection, no visible detached root. Xhigh retain/revert review pending.
No ankle edit, texture, rig, production acceptance or publication. Max planner is assessing the next form-refinement unit after the coarse proportion trials.
Xhigh verdict: retain r27A after all four fullbody and foot-detail views. Center claws balance outer pair at fullbody size; roots visually embedded, no new gap or oversized center spike. Foot and leg silhouettes stable. Close this local trial.

### export-review.md

Source: `canonical/characters/charizard/whole-r27/export-review.md`

Retained r27A source reopened, exported, and actual GLB imported successfully. 39 meshes, 3268 control vertices, 9856 evaluated triangles. FlameSocket empty and energyBaked=false. Root inspected all four reopened GLB views: center claw placement preserved, no new visible attachment gap. The known mouth shading difference remains unresolved. Whole-character visual, assembled-intersection and production gates remain false.
Telegram preview delivery confirmed message17215. Max planner currently assessing next authorized form-refinement unit; do not infer production acceptance from retained local trials.

## whole-r28

### README.md

Source: `canonical/characters/charizard/whole-r28/README.md`

Root inspected front/threequarter head and fullbody views. Aperture is more angular and eye remains exposed; broader cheek improvement is subtle. Xhigh review pending: do not equate sharper rim alone with completed connected facial form. One directional correction remains available. No production transition.

### export-review.md

Source: `canonical/characters/charizard/whole-r28/export-review.md`

R28A actual source/GLB reopened and validated: 39 meshes, 3268 control vertices, 9856 evaluated triangles; FlameSocket empty and energyBaked=false. Root inspected all four imported renders. Aperture definition survives export. Known mouth shading difference persists. Whole likeness/assembled intersections/production gates remain false. B rejected and A restored.

### rejected-b-manifest.json

Source: `canonical/characters/charizard/whole-r28/rejected-b-manifest.json`

[
  {
    "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r28/charizard-hybrid-r28b-cheek-planes.blend",
    "sha256": "46a790482c6215a072ba5795057a0d0f5d61acac2d0222b75274324af9dc7fa9"
  },
  {
    "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r28/r28b-front.png",
    "sha256": "c6f26ef315ac1c7daf6e7ad53c19df8d2bcdaf430bc224286401d429dc6432a4"
  },
  {
    "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r28/r28b-head-front.png",
    "sha256": "7d7c6a0301c00cf3bc509520dc673cd73cec7d541d4593923bc02469d93afd10"
  },
  {
    "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r28/r28b-head-rear.png",
    "sha256": "ce1c58847f2e0408d393874b909dd887d52477cb8062ee6fbd49561237d1f1ef"
  },
  {
    "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r28/r28b-head-side.png",
    "sha256": "8c5de1a0f6af65f8fa1a8fd08d8f69ec596fac88a3cbe5f34a9dd89e75db0995"
  },
  {
    "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r28/r28b-head-threequarter.png",
    "sha256": "7fc3cba5e8553b47e8efc8c3b8489ebe45ed124228a7c6a091904a2a9cacea3c"
  },
  {
    "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r28/r28b-rear.png",
    "sha256": "931aed45518f0f34ccd98ec705da28ce6ccfab800cd50052e80d76ef0c6bd914"
  },
  {
    "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r28/r28b-side.png",
    "sha256": "61d376eca938d4a464c27f8e34153aa739cb8644255cb087fea8fe43af1f7b92"
  },
  {
    "path": "/mnt

### verdict.md

Source: `canonical/characters/charizard/whole-r28/verdict.md`

# R28 verdict
Xhigh retained A as a limited aperture improvement after four head/fullbody views, lower-camera render, HOME/art and r26B comparisons. Sharper opening reads at fullbody threequarter with eye exposure preserved. Broader brow/cheek goal remains unmet; no further rim-crease increase.
B used native individual inset .015 on broad cheek faces5/36 and localSX .96 on only the new inner faces. All original coordinates preserved, 60→68 head vertices. Root inspected front/threequarter head/fullbody renders and rejected B: visible recessed cheek patch/perimeter ridge, rather than a broad integrated plane. B source preserved and A restored. This exhausts the regional candidate/correction trial; do not iterate the inset amplitude.

## whole-r29

### README.md

Source: `canonical/characters/charizard/whole-r29/README.md`

Intake is retained r28A. No sculpt strokes were made.
Native duplicate → Convert Mesh froze Subsurf1 to 224 vertices. Three native linear subdivisions produced 14210 vertices/14208 faces. Initial Shift-R attempts repeated selection rather than subdivide; count inspection caught this, and explicit Subdivide plus repeat completed density. All faces smooth, no sharp edges or custom normals. Nevertheless renders expose the coarse source facets: linear geometry subdivisions do not preserve the original smooth normal interpolation at inserted interior vertices. Density preflight rejected.
A fresh duplicate of intake used native Ctrl4 → Convert Mesh to produce the same density directly from a higher Catmull-Clark level. It is smooth, but rounds the aperture and muzzle relative to A. Root inspected front/threequarter closeups and rejected this as an unchanged starting surface. No sculpt performed on either variant; intake restored. Both sources and renders preserved.

## whole-r30

### README.md

Source: `canonical/characters/charizard/whole-r30/README.md`

Retained as a local blockout improvement, not whole-character acceptance. Three native mouse sculpt strokes on the altered R29 dense construction source; original R28A head remains hidden and preserved. No scripted anatomy writes.
The critic inspected four head and four full-body views against R28A, HOME and official art. Root inspected all four full-body views. Cheek improvement remains unresolved. Visible component seams and unfinished forms remain. No production topology, texture, rig or animation gate has passed. GLB export and actual reopening passed: 39 meshes, 17,418 source vertices, 37,828 evaluated triangles, bounds and empty FlameSocket preserved. Root inspected all four reopened GLB renders. These checks do not establish production topology or intersection quality.
Next: frozen geometry camera comparison against HOME, corroborated by fixed views, before choosing another form correction.

### camera-review.json

Source: `canonical/characters/charizard/whole-r30/camera-review.json`

"criticStatus": "requested",

### leg-diagnostic.json

Source: `canonical/characters/charizard/whole-r30/leg-diagnostic.json`

"criticStatus": "running",

## whole-r31

### README.md

Source: `canonical/characters/charizard/whole-r31/README.md`

A native proportional global Z lift .04 revealed the squat ankle; one native per-thigh global XY taper .9 reduced its overhang. Xhigh critic retained B after four-view review. Scalloped component seams remain. No further amplitude loop.
Actual GLB reopening validates 39 meshes, 17,418 source vertices, 37,828 evaluated triangles, bounds and FlameSocket. Root inspected four reopened renders. This is not a production-topology or intersection pass. No production acceptance. Telegram preview 17267 delivered.

## whole-r32

### README.md

Source: `canonical/characters/charizard/whole-r32/README.md`

# R32 one-leg continuity study — unaccepted
First threequarter render inspected: coarse-source faceting remains; no junction sculpt yet. Next: smooth-shading inspection, protected junction-band native sculpt, multiview critique. No production or regional acceptance, no GLB export. R31B remains retained fallback.

### mirror-review.md

Source: `canonical/characters/charizard/whole-r32/mirror-review.md`

Xhigh critic retained unified left leg; root inspected exposed left-side. Native mirror initially failed: world coordinate error .17869 and detached right claw roots. Failed bilateral source preserved. Restored left-retained checkpoint, native Apply Rotation then duplicate and mirror X about origin. World vertex mirror error exactly0. Corrected source: whole-r32/charizard-hybrid-r32-mirror-corrected.blend. Right scale remains negative pending native Apply Scale and export validation. Corrected threequarter inspected; full review pending.

## whole-r33

### README.md

Source: `canonical/characters/charizard/whole-r33/README.md`

# R33 arm/palm preparation — failed, restored
MAX target: one arm/palm continuity and flatter dorsal palm, preserve digits/shoulder/reach. Initial native preparation failed (duplicate assertion,46 vertices after remesh instead of expected dense study). Do not trust charizard-hybrid-r33-arm-palm-preflight.blend. Restored authoritative R32B source immediately. Likely stale local-view/selection state; verify Object mode, exit local view and selected objects before retry. No retained anatomy change.

### verdict.md

Source: `canonical/characters/charizard/whole-r33/verdict.md`

# R33 rejected; R32B restored
Initial depth move affected all28108vertices including6459upper-arm vertices; rejected. Cause: stale edge/face selection propagated on entering Edit mode. Retried after clearing face/edge selection and verifying exactly9 selected vertices inside Edit mode. Native proportional GY.012 produced a visible central dish in corrected threequarter render. Root rejected against critic criterion; no more amplitude attempts. Restored validated R32B. All studies preserved.

## whole-r34

### status.md

Source: `canonical/characters/charizard/whole-r34/status.md`

Native whole-palm SY 0.70, SZ 0.85 about world (-0.44,-0.16,0.8); proportional editing off. Affine audit passes. Arm and digits remain separate. Saved source and five rendered detail views in private whole-r34 directory. Root inspected front, threequarter and exposed left side: shallower convex pad without R33 dish; wrist and digit transitions remain unresolved. No union, export or production acceptance.
Two initial native attempts changed no geometry because the restored file retained leg-only local view. Cleared local view, repeated native edit, then verified exact affine transform. R32B rollback untouched.
Critic retained palm shape for union only: shallower convex pad, no dish/plate, no open finger-root gaps; do not compress further. Native duplicated arm+palm, Ctrl3 -> Convert Mesh -> Join -> Sculpt CtrlR at .003 produced 27256 vertices. Saved union-preflight source plus four detail renders. Root inspected threequarter: wrist ridge and arm sampling bands remain. XHIGH reviewing next bounded sculpt target. Telegram palm preview delivered successfully as message 17273.
One native Smooth wrist stroke, feather mask z .81–.94, strength .5, diameter70. 974 vertices changed; max .00232023. Saved wrist-wip and four renders. Root inspected threequarter: ridge reduced, arm sampling bands unresolved. No repeat wrist stroke justified yet. Critic union verdict independently specified the same bounded wrist correction; review of WIP pending.

### verdict.md

Source: `canonical/characters/charizard/whole-r34/verdict.md`

Retain wrist correction; reject arm-only smoothing.
XHIGH inspected wrist and arm front/threequarter against union: wrist ridge reduced without losing narrow connection or shallow palm. Arm smoothing offers only slight local change and leaves sampling bands. Stop arm-polish loop. Palm-to-digit cylindrical transitions remain the next hand form issue; preserve digit separation, splay, bends and reach. No whole-hand or character acceptance.
Restored charizard-hybrid-r34-wrist-wip.blend via MCP. Verified all 27256 vertex coordinates exactly match arm-before.json (maximum error 0). Rejected arm-wip and its renders remain preserved. Full-character whole-* renders depict rejected arm-wip; do not label them retained-source evidence.

## whole-r35

### face-diagnostic.json

Source: `canonical/characters/charizard/whole-r35/face-diagnostic.json`

{
  "GEO-r11-membrane-L": [
    {
      "face": 0,
      "xzSignedArea": 0.01192777464720951
    },
    {
      "face": 1,
      "xzSignedArea": 0.006357328033299581
    },
    {
      "face": 2,
      "xzSignedArea": 0.011358310135868521
    },
    {
      "face": 3,
      "xzSignedArea": 0.00632778345743823
    },
    {
      "face": 4,
      "xzSignedArea": 0.004253009930694773
    },
    {
      "face": 5,
      "xzSignedArea": 0.006803705892739487
    },
    {
      "face": 6,
      "xzSignedArea": 0.01292767521681526
    },
    {
      "face": 7,
      "xzSignedArea": 0.0007138784706590684
    },
    {
      "face": 8,
      "xzSignedArea": 0.0037197442586034413
    },
    {
      "face": 9,
      "xzSignedArea": -0.00785276069707308
    },
    {
      "face": 10,
      "xzSignedArea": 0.0617166528622306
    },
    {
      "face": 11,
      "xzSignedArea": 0.007233350796170157
    },
    {
      "face": 12,
      "xzSignedArea": 0.012620834248593837
    },
    {
      "face": 13,
      "xzSignedArea": 0.09317998150706686
    },
    {
      "face": 14,
      "xzSignedArea": 0.10546500590800889
    }
  ],
  "GEO-r11-membrane-R": [
    {
      "face": 0,
      "xzSignedArea": -0.01192777464720951
    },
    {
      "face": 1,
      "xzSignedArea": -0.006357328033299581
    },
    {
      "face": 2,
      "xzSignedArea": -0.011358310135868521
    },
    {
      "face": 3,
      "xzSignedArea": -0.00632778345743823
    },
    {
      "face": 4,
      "xzSignedArea": -0.004253009930694773
    },
    {
      "face": 5,
      "xzSignedArea": -0.006803705892739487
    },
    {

### status.md

Source: `canonical/characters/charizard/whole-r35/status.md`

R35 partial wing trial, not retained. Native left leading-spar vertices40–49 GZ-.13; membrane4 GZ-.13,5 GZ-.08,6 GZ-.04. Exact edit selections verified before each transform. Saved private charizard-hybrid-r35-left-outer-trial.blend and outer four views. Root inspected front: longer outer tip, no obvious separation. Middle/inner and right wing not yet changed; candidate incomplete. Next complete bounded trial then audit whole front/rear/threequarter. R35 intake preserves retained R34 wrist.
Bilateral candidate completed via native keys. Exact all-visible-source world displacement audit passes; fixed vertices remain fixed. Four trial renders saved. Root front/threequarter review: inward-rising tips established, but horizontal crease/overlap across inner membrane is a new visual failure. Candidate not retained. XHIGH reviewing whether silhouette merits repair; inspect membrane face structure before any acceptance.
Root-cause evidence: face9 [8,13,0] reverses projected XZ signed area on both membranes, unlike other faces. Old triangle diagonals no longer support the raised concave boundary. Next bounded repair: native dissolve internal edges retaining boundary, then retriangulate; verify no coordinate movement and consistent projected orientation. Not a shading-only defect. No repair performed yet.
Native Dissolve Edges trial FAILED: default operator removed boundary vertices (17 ->9), violating outline preservation. Saved rejected-dissolve source, restored wing-trial and verified17 vertices. Do not reuse default dissolve. Next use operator panel Dissolve Vertices disabled or delete only faces/rebuild boundary; verify before triangulation. Initial assertion failure was followed by triangulation in same orchestration call; future dependent calls must stop on MCP text errors as well as isError.
Actual reopened R35 GLB rendered front/side/rear/threequarter and root visually inspected all four. Wing repair persists; no new gross export discrepancy observed. This does not establish runtime engine acceptance, intersections, deformation topology or character likeness. 34 meshes/228016 triangles is an unoptimized sculpt checkpoint.

### verdict.md

Source: `canonical/characters/charizard/whole-r35/verdict.md`

Retain R35 as regional wing improvement.
XHIGH inspected all four repaired views: horizontal fold/slit gone in front/rear/threequarter; lower outer tips and inward-rising trailing edge intact; continuous coverage and no obvious spar detachment. Residual panel shading is not previous overlap. Stop tip/triangulation adjustments this loop. Root also inspected all four views. Overall likeness and production readiness remain unaccepted.

## whole-r36

### status.md

Source: `canonical/characters/charizard/whole-r36/status.md`

Added actual exposed-left-side and four whole-character renders. Root inspected left side/full front: taper reads at whole scale, side tips narrow; palm-base ledges remain. XHIGH reviewing chunkiness and retain/correct before mirroring. No further geometry changes.
Actual embed-left-side render inspected: exposed cap ledge reduced; transition remains abrupt. XHIGH asked retain construction source/revert and whether union required. Added reusable temporary-camera helper for consistent exposed-left-hand checks.

### verdict.md

Source: `canonical/characters/charizard/whole-r36/verdict.md`

Retain digit taper only. XHIGH inspected detail front/threequarter/edited side, whole front/rear/threequarter, R34 wrist and HOME. Broad roots through bends to narrower tips read clearly; no convincing fragile-tip failure. Do not change .55 to .60 without evidence or thin further. Base ledges remain unresolved, preventing finished-hand acceptance.

## whole-r37

### status.md

Source: `canonical/characters/charizard/whole-r37/status.md`

R36 embedding retained by XHIGH as construction source; no further root translation. Native duplicate4 components and join into GEO-r37-hand-skin-study-L (27328 vertices), originals hidden preserved. Saved R37 intake and joined-study private sources. Not yet voxel union. Study inherits nonuniform scale1.15,.8,1; apply scale natively before remesh. Preserve gaps/bends/shallow palm; reject webbing/bulbous knuckles.
Applied scale natively. First mode-switch failed; union.blend is NOT union (27328 vertices). Separate CtrlTab then2 verified SCULPT, nativeCtrlR succeeded:43690 vertices, voxel.0025. Saved union-retry and retry four views. Root3q: gaps/bends intact but fingers visibly faceted due coarse input; not accepted. Next improve source finger sampling or bounded smoothing, not density-only reruns.
Read-only union inspection: all43688 faces smooth, so facets geometric. Restored intake; native duplicated3 fingers, Ctrl2 Subsurf source trial. Originals hidden preserved. Saved smooth-finger-source and four smooth-source renders. Root3q: smoother but bends softened; critic reviewing before union. No acceptance.

### verdict.md

Source: `canonical/characters/charizard/whole-r37/verdict.md`

Reject plain Subsurf2 smooth finger source. XHIGH front/rear/threequarter comparison finds teardrop shapes and lost two-segment bends/proximal mass. Root actual-left-side inspection agrees. Restored R36 root-embed source and verified three visible24-vertex original fingers. Preserve rejected R37 sources. Next construction must support bend geometry before smoothing; no union of rejected smooth fingers.

## whole-r38

### bilateral-review.md

Source: `canonical/characters/charizard/whole-r38/bilateral-review.md`

R38 regional hand retained by root and xhigh critic. Three fingers, supported bends and open gaps survive base blending. Native duplicate and world-X mirror, then native Apply Scale; maximum corresponding world-coordinate mirror error 0.0. Original right arm/palm/fingers hidden and preserved. Root inspected all four bilateral renders: no new gross discrepancy. Close hand pass. This is blockout retention, not finished-hand or production acceptance. Next: investigate neck-interface continuity without speculative global proportion changes.

### glb-visual-review.json

Source: `canonical/characters/charizard/whole-r38/glb-visual-review.json`

"result": "Bilateral hand changes survive GLB export; no new gross visual discrepancy. Existing neck/body/jaw junction defects remain. Construction quality only.",

### status.md

Source: `canonical/characters/charizard/whole-r38/status.md`

Native duplicated retained fingers, Ctrl2, middle-ring8 edges per digit ShiftE.5. Verified crease values. Saved supported-bends source/four support renders. Root3q sees modest bend definition restored versus plainSubsurf, but distal roundness remains; not accepted. Need editedside/critic before union. Originals hidden preserved.
Actual exposed-left-side support render inspected. Bend clearer than rejected R37 plainSubsurf, but terminal remains rounded. XHIGH reviewing front/3q/side for union source suitability; no retention yet.
XHIGH accepts supported source for union only. Native duplicate4, Convert Mesh, Join28222, Apply Scale, SculptCtrlR voxel.0025. Saved union source/four renders. Root3q: smoother than R37 union, gaps/bends retained, base blending still pending. No final-hand acceptance.

## whole-r39

### extension-review.md

Source: `canonical/characters/charizard/whole-r39/extension-review.md`

REJECTED: native terminal-face normal extrusion .035 added16vertices, preserved original96 coordinates. Root inspected side/threequarter: lateral step persists and new lip exposed beneath chin in threequarter. Restored R38 bilateral source. Preserve rejected .blend and renders. Do not repeat/increase extrusion.

## whole-r40

### review.md

Source: `canonical/characters/charizard/whole-r40/review.md`

REJECTED after root side/threequarter inspection. Native jaw4/7 localX.85 and localZ+.015 exactly verified; all other jaw coordinates fixed. Slight underside shape change does not clearly reduce jaw-neck step. Restored R38 bilateral. Stop cage nudges; next regional jaw-neck construction study. No export or production acceptance.

## whole-r41

### broad-review.json

Source: `canonical/characters/charizard/whole-r41/broad-review.json`

"retained": false,

### final-review.md

Source: `canonical/characters/charizard/whole-r41/final-review.md`

REJECTED by root and xhigh critic. All four broad views inspected by critic: projecting jaw band remains, no meaningful transition gain; union introduced underjaw ripples and rough mouth rim. Mask audit3948changed,maxdelta.00182707,fullymasked0. Restore R38 bilateral; preserve R41 trial. No more Smooth/amplitude iterations on this study. Telegram17290 delivered.

### smooth-review.md

Source: `canonical/characters/charizard/whole-r41/smooth-review.md`

One native protected Smooth stroke at displayed50px, strength.3; intended90px setup failed, recorded honestly. Root3q inspection finds no convincing junction improvement yet. Critic review requested. R41 remains trial, R38 retained.

### status.md

Source: `canonical/characters/charizard/whole-r41/status.md`

Unaccepted regional jaw-neck sculpt study. Native duplicates, Ctrl3 Convert Mesh then join:7908 vertices; native voxel remesh.003:163994 vertices. Originals hidden and preserved. Upper skull/body excluded. Root inspected union side/threequarter: mouth gap remains, rim voxel roughness visible, interface step remains pre-sculpt. Needs tightly protected local sculpt and comparison; not retained over R38.

## whole-r42

### bridge-review.json

Source: `canonical/characters/charizard/whole-r42/bridge-review.json`

{
  "vertices": 134,
  "nonmanifoldEdges": 0,
  "cuts": 2,
  "interpolation": "LINEAR",
  "nativeUiSettingsVerified": true,
  "zeroCutLandmarksMatched": 16,
  "rootReview": "Threequarter projecting band removed. Full critic review pending, regional trial only.",
  "files": [
    {
      "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r42/charizard-hybrid-r42-linear-bridge.blend",
      "sha256": "54e03a82a53b478001676e859e957496364bdb049380d9178a6868596fefa972"
    },
    {
      "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r42/bridge-front.png",
      "sha256": "f5c6eb93f6282d175c8c8dd7493eb3bb4dc3a142db474cb3ea527d7fbbffef9b"
    },
    {
      "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r42/bridge-side.png",
      "sha256": "9d6d8c233ee5b3b5a19654fa2e072418dcd7aa1b873ea9f3652fc7847351b89d"
    },
    {
      "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r42/bridge-rear.png",
      "sha256": "68461c37b1dfb9e64554f9b0cd73b4e54b14d5ca1335523d325f77b4134f9723"
    },
    {
      "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r42/bridge-threequarter.png",
      "sha256": "64f9bb302f858df6231fdacd81aa2e9be4dc37f3a2cb98bd435441a16143b453"
    }
  ]
}


### critic-review.md

Source: `canonical/characters/charizard/whole-r42/critic-review.md`

Current linear bridge NOT RETAINABLE. Xhigh all4views plus HOME/art: shelf removed, mouth cleaner thanR41, but longstraighttriangular throat removes shortchin/upperSturn and introduces midneck bend. One bounded intermediate bridge-shape correction allowed; endpoints/chin/mouth/lowerneck fixed. NoSmooth. Revert if wedge persists. Fullwhole renders captured; root inspected3q.

### final-review.md

Source: `canonical/characters/charizard/whole-r42/final-review.md`

REJECTED R42. Root/xhigh multiview: shelf removed but triangular throat and open posterior skullcontact. Max planner checked134vertex cage: anterior correction cannot restore separate rear contact; multiple repairs exceed bounded pass. No correction attempted. R38 bilateral restored. Keep allR42 topology study sources/evidence. Telegram17291 trial preview delivered.

### status.md

Source: `canonical/characters/charizard/whole-r42/status.md`

R42 RAW topology study in progress, not visual candidate. Native duplicated retainedR38 jaw40/neck96 with modifiers unapplied. Original parts hidden/preserved. Native Only Faces deleted jaw originalfaces0..7,19..21 after exact selection verification. Result22faces,10boundaryedges verified. Loose edges/vertices intentionally retained for stable indices. Source /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r42/charizard-hybrid-r42-jaw-open.blend. Next neck duplicate face deletion48..79+81 then verify16boundary; do not bridge unequal loops; max planner computing correspondence. R38 retained.

## whole-r43

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r44

### bilateral-review.json

Source: `canonical/characters/charizard/whole-r44/bilateral-review.json`

"regionalGate": "retained by root and xhigh critic",
"caveat": "Interior faceted shading remains; no finished membrane or whole-character acceptance.",

### export-review.json

Source: `canonical/characters/charizard/whole-r44/export-review.json`

"result": "Retained wing curve survives export, no new gross discrepancy. Existing anatomy and faceted shading remain unfinished.",

## whole-r45

### status.md

Source: `canonical/characters/charizard/whole-r45/status.md`

# R45 tail–pelvis study — rejected by root
Retained source remains R44 bilateral. Native duplicate Subsurf3 → Convert → Join produced 21,380 vertices; native Sculpt voxel remesh at 0.004 produced 240,784 vertices. Original body and tail preserved hidden in the study; FlameSocket remains parented to original tail.
Inspected rear/side detail and rear/side/threequarter whole views. Round cuff remains; gain negligible and remesh introduces surface banding. Reject, restore R44; no further smoothing series. No runtime export or production claim.
MCP inspection of obsolete Brush.sculpt_tool failed after viewport setup; no geometry action followed until brush and mask setup succeeded. All geometry operations used native CUA.

## whole-r46

### status.md

Source: `canonical/characters/charizard/whole-r46/status.md`

Root and xhigh critic retain regional seam improvement. Stop at union alone; no bevel/polish in this blockout gate. Current source charizard-hybrid-r46-union-self.blend. Original editable neck/body preserved hidden. Native geometry operations only.
Discarded setup: Subsurf2 preparation was rolled back to intake per planner. Initial Union without Self Intersection dropped neck; detected in renders and restored preboolean-s1 before corrected execution. Files union-* and exact-union.blend are failed diagnostic artifacts, not candidates. Use union-self-* and whole-*/glb-*.
Visible lower chest seam substantially reduced; some shading patches remain. Jaw–throat, haunch shape, and tail cuff unresolved. No overall likeness/production acceptance. No textures/rig/animation added. No merge/push.

## whole-r47

### status.md

Source: `canonical/characters/charizard/whole-r47/status.md`

# R47 jaw/throat Exact Union — rejected
Native duplicates of retained R46 chest and jaw, current evaluation Convert→Join→Intersect Boolean Union Exact Self Intersection ON→Shade Smooth. Input1247 vertices, result1352 vertices1171faces, zero nonmanifold and degenerate faces. No bevel/remesh. Original sources preserved.
Root inspected side closeup and whole threequarter: projecting jaw band remains, new triangular underchin shading and interrupted mouth gap. Max planner independently opened side/front/threequarter and rejected. A small seam bevel cannot redistribute the exposed jaw shell. No more union/bevel iterations here. Restored R46.
Next: directional haunch mass shaping with upper bulk and foot/ankle protected. No production/export claim. No merge/push.

## whole-r48

### status.md

Source: `canonical/characters/charizard/whole-r48/status.md`

# R48 posterior haunch Grab — rejected by root
Preserved duplicate of R32 left leg from retained R46. One native Grab170px strength0.5 stroke370463→414463 in upright left side. Mask fully protected Z<=.16 Z>=.40 Y<=0; featherZ.16–.21,.34–.40,Y0–.06. Actual1336changed maxdelta.0255818 fullymasked0.
Actual matched left-side renders show localized posterior dent instead of broad taper. Reject, no mirror or additional Smooth. Restored R46. Independent critic requested. Mask preservation alone is not a form gate.

## whole-r49

### comparison.json

Source: `canonical/characters/charizard/whole-r49/comparison.json`

{
  "home-r09": {
    "source": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r09/charizard-home-native-r09-horn-isolated.glb",
    "bounds": [
      [
        -0.9973098039627075,
        -0.7971712946891785,
        -0.6900485754013062
      ],
      [
        0.9915444254875183,
        0.798997700214386,
        0.6609073877334595
      ]
    ],
    "center": [
      -0.0028826892375946045,
      0.0009132027626037598,
      -0.01457059383392334
    ],
    "orthoScale": 2.307070837020874,
    "cameraRotations": {
      "front": [
        0.7071066498756409,
        0.70710688829422,
        0.0,
        0.0
      ],
      "side": [
        0.5,
        0.5,
        0.5,
        0.5
      ],
      "rear": [
        5.338508302088485e-08,
        -5.338507591545749e-08,
        0.7071067690849304,
        0.7071067690849304
      ],
      "threequarter": [
        0.7842421531677246,
        0.5600988268852234,
        0.15513846278190613,
        0.21722248196601868
      ]
    }
  },
  "manual-r46": {
    "source": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r46/charizard-blockout-r46.glb",
    "bounds": [
      [
        -1.2489609718322754,
        -0.5,
        0.0006508231163024902
      ],
      [
        1.2489609718322754,
        0.782543957233429,
        1.7148325443267822
      ]
    ],
    "center": [
      0.0,
      0.14127197861671448,
      0.8577417135238647
    ],
    "orthoScale": 2.8975894546508787,
    "cameraRotations": {
      "front": [
        0.7071066498756409,
        0.70710688829422,
        0.0

### decision.md

Source: `canonical/characters/charizard/whole-r49/decision.md`

Root and xhigh critic choose existing physical HOME-derived R09 as the stronger next form source. Critic inspected all eight R49 renders and official HOME: compact raised muzzle with chin/curved throat; diagonal haunch descent into short planted feet; bowed leading wing contour with varied scallops. R46 smoother surfaces do not compensate for weaker whole-form relationships.
Preserve R46 rollback/component reference. Do not automatically transplant its proportions. R09 still needs major tail-loop correction, separated components, hands/claws and surface cleanup. No finished blockout/production gate passed. Next create isolated checkpoint from preserved physical R09 and address components/large tail defect, keeping flame socket-only. No new generation required by this evidence.

### status.md

Source: `canonical/characters/charizard/whole-r49/status.md`

Eight fresh Blender renders from actual reopened physical GLBs: HOME-derived retained R09 horn-isolated vs manual retained R46. Same camera quaternions, same scene settings; each centered and framed by max bounding-box dimension times1.16. This is normalized framing, not calibrated reference registration. R09 is an edited HOME source, not the untouched raw61061. Its baked flame was already removed. No geometry altered, source restored.
Root inspected all eight views. HOME has better connected head–neck and directional haunches, but inflated jaw, lumpy wings, mitten hands and severely oversized distorted tail. R46 has cleaner surfaces/components but projecting jaw shelf, spherical haunches, abrupt tail cuff and angular wing construction. Neither is production-ready. Independent review complete: HOME-derived R09 selected as next form source; see decision.md. Do not choose by surface smoothness or sunk effort.
No new generation, no source replacement yet, no merge/push. R46 remains live retained checkpoint until next documented source decision.

## whole-r50

### status.md

Source: `canonical/characters/charizard/whole-r50/status.md`

Compared with actual imported R09 physical GLB: same vertex count, maximum nearest-world-vertex distance0 and socket position delta0. This verifies extraction did not move the source surface. Four neutral renders created; studio lighting differs from R49, do not interpret as visual improvement. Initial clean-* renders used shadows causing patches; use neutral-* for intake.
No new runtime export, topology/rig/texture acceptance or completed blockout. Next tail decomposition in native UI, preserving pelvic root and socket world pose. Tail is physical only; original baked flame not included.

## whole-r51

### status.md

Source: `canonical/characters/charizard/whole-r51/status.md`

Rendered four views, root inspected side/rear. No shape gain claimed; decomposition enables controlled correction of the oversized distal loop. Keep matching borders fixed. No runtime/production acceptance or export, no merge/push.

## whole-r52

### status.md

Source: `canonical/characters/charizard/whole-r52/status.md`

# R52 broad negative Inflate filter — rejected
Root inspected side/rear rendered output: severe speckled/rippled surface artifacts along broad tail, unusable. Negative normal displacement on noisy dense source is rejected; no strength series. Restored R51. Exact intersection/inversion cause not certified; visual failure sufficient to reject. Original source, border, socket preserved.
Next requires coarse deformation controls or clean component reconstruction, not another normal-offset filter. No production/export claim.

## whole-r53

### status.md

Source: `canonical/characters/charizard/whole-r53/status.md`

# R53 — retained regional reach improvement
Root and xhigh critic inspected four R53 views against R51 and official HOME. Retain only the shorter posterior reach: side and three-quarter improve without a new visible root kink or dent. Rear remains an oversized flattened tail band. Tail and whole-character fidelity gates still fail.
Retained source: private whole-r53/charizard-home-r53-retained.blend. FlameSocket moved to the evaluated mean of the same 108 tip-cap vertices used by the previous socket; original mean matches old socket within 1e-6. Parent is the visible study tail, EMPTY with no children, energyBaked=false. This is a sampled checkpoint position, not automatic lattice following; recompute after further deformation.
No new GLB, topology acceptance, textures, rig or animation. Open construction borders remain. Next bounded target: swollen loop cross-section, not more posterior displacement. Telegram before/after preview confirmed message 17332. No merge/push.

## whole-r54

### status.md

Source: `canonical/characters/charizard/whole-r54/status.md`

# R54 retained regional taper improvement
Root and xhigh retain the slimmer middle return band, supported by rear/threequarter. No visible new kink or root detachment. Large proximal bulge remains; overall tail form fails. Stop this amplitude series. Retained source charizard-home-r54-retained.blend. FlameSocket now parented to visible R54 tail and aligned to evaluated108vertex cap mean; EMPTY, no children, energyBaked=false. Sampled binding must be recomputed after future edits.
Native Add Lattice, U6 V2 W2; native scale/translate fits box X[-.4,.85],Y[.25,.8],Z[-.7,-.33]. Native S Shift-X station factors 1,.85,.75,.75,.85,1, cursor pivots measured from original section YZ bounds. Mechanical modifier/group binding only. Four renders complete. Root inspected top, rear, side, threequarter: subtle thinner return band; large proximal bulge remains. No acceptance yet.
Audit: 44859 vertices changed; maxdelta .0237822096; root border and X>=.8 tip displacement0; control target error8.43e-8. R53 preserved. Socket still R53 parent; needs cap check if retained. No GLB/production approval.
Telegram preview confirmed message 17335. Additional cap check: the full108vertex tip-cap mean moved0.0001039874 (only X>=.8 was protected, not every cap vertex). Realign socket if retained. Root inspected front as well.

## whole-r55

### status.md

Source: `canonical/characters/charizard/whole-r55/status.md`

# R55 rejected — no meaningful broad form improvement
Root inspected front/rear masks and rendered front/rear. One native SurfaceSmooth stroke395,380→435,380, strength.5/default.5shape and pervertex, iteration1. Polygon positiveX outerbay 5077affected mask vertices; protected geometry unchanged. Actual4062vertices changed, maxdelta0.0000444622. Insufficient change to broad membrane dents; reject and close smoothing series. Restored R54 retained.blend via MCP. Trial preserved. No topology/rig/material acceptance.
Rejected test preview delivered via Telegram message17339.

## whole-r56

### status.md

Source: `canonical/characters/charizard/whole-r56/status.md`

Inspected current R54 positive-X wing closeup from front and rear. Leading rim is substantial, but internal spar is mostly a shallow crease and the free scallop edge is thin. A separate inset patch cannot be assumed to hide its perimeter underneath this frame. Do not separate old bay skin under an unsupported hidden-collar assumption. Planner revising construction toward continuous boundary or whole membrane replacement. R54 remains live retained source. No R56 anatomy created.

## whole-r57

### status.md

Source: `canonical/characters/charizard/whole-r57/status.md`

Native plane, rotateX90, scale.4 and translate(.55,-.2,.2); Subdivide twice gives5x5. Select rightedge5vertices, native ExtrudeX.2 fourtimes gives9x5:45vertices32quads with shared center column. Not fitted or accepted. Hiddenrender/wire display. R56 original wing remains guide; all original character geometry preserved. Current charizard-home-r57-shared-grid.blend. Boundary fitting next.
Native scaleX.5 about cursorX.15 brought the9columns into X.15..95 spacing.1. Saved width-fit.blend; row/column index map captured for native fitting. Still rectangular/unfitted, not an accepted membrane.
All45controls now fitted through native individual GXYZ moves. Grouped columntransform attempt changed unintended controls and was reverted to root-column.blend. Explicit clearface/edge selection fixed execution. Final targeterror8.43e-8. Saved fitted-cage.blend. Front overlay inspected; reverse/side and standalone sheet review still pending. No modifiers or surface acceptance.
Inspected side/rear cageoverlay, then wholeguidehidden standalone sheet fourrenders. Rootgap and missing leadingrim/knuckle explicit. Native Ctrl1 + ShadeSmooth preview, renderlevel mechanically matched1; four subdiv renders. Frontpreview smoother but plainSubsurf rounds trailingtips; notaccepted. Current subdiv-preview.blend. Need supported corners and originalrim extraction/attachment. Originalguide intacthidden.
NativeShiftE.8 on edges1,46,70,74 (boundary edges adjacent central/outer tips), verified all.80000001. tip-support.blend and supported4renders. Rootfront sees lessrounded outertip. Leadingrim/root remain missing; no acceptance. Telegram constructionpreview in flight session10091; do not resend.

## whole-r58

### status.md

Source: `canonical/characters/charizard/whole-r58/status.md`

Native guide duplicate exactsource; structural face selection inspected front; nativeP Selection extracts14579vertices28003faces. 1155boundaryedges (207originalroot+948innercut expected), coordinate delta0. Originalguide and oldskin preservedhidden. Frame plus R57supported sheet fourrenders. Root front/3q inspection: leadingrim/knuckle recovered, visible root/upperjunction gaps, jaggedinnercut. No sealedjunction, topology or visual acceptance. Current frame-sheet.blend.

## whole-r59

### status.md

Source: `canonical/characters/charizard/whole-r59/status.md`

Root visual verdict: central point sharper, but broad membrane still looks flat/papery. Insufficient evidence of meaningful broad form gain. No joining, retopology, material or rig gate passed. Independent critic verdict pending. R58 and all earlier source checkpoints preserved.
## Final decision: rejected
Root and independent XHIGH critic agree: insufficient broad-form gain. The two tensioned bays were not established; scallop arcs remain polygonal. Root/knuckle gaps are separate defects. Restore R54 retained source, preserve R56–R59 studies, stop this amplitude series, and do not join the replacement sheet. Largest overall silhouette discrepancy remains the swollen proximal tail loop.

## whole-r60

### status.md

Source: `canonical/characters/charizard/whole-r60/status.md`

Next bounded form candidate: rounded hand ends versus HOME narrow pointed claws, preserving palm size and digit splay. Independent target review requested. No hand geometry change yet. Physical FlameSocket remains empty. No textures/rig/production gate passed.

## whole-r61

### status.md

Source: `canonical/characters/charizard/whole-r61/status.md`

# R61 rejected cap taper
Front closeup and 512 whole view inspected: abrupt shoulder/pinched nub, not a compact clean claw. Root rejects immediately; no further views necessary to establish rejection. Restored intake checkpoint with duplicate coordinates unchanged from retained R54. Do not repeat a cap-only scaling amplitude series. Further claw construction needs a continuous transition or separate authored claw component, not truncation taper.

## whole-r62

### status.md

Source: `canonical/characters/charizard/whole-r62/status.md`

Original rounded cap still present and occludes the new component. Front render inspected; no visual gain claimed. Next: localized native cap trim with filled cut, smooth claw shading, front/threequarter/whole review. Intake rollback preserved. Do not promote staged geometry to retained source or export it.
Selected311 local distal vertices, native Bisect mouse stroke; F9 set plane Z -.11630, Fill and Clear Inner. Body now276578 vertices,236 boundary edges (same existing tail boundary count). Native Shade Smooth on separate claw. Saved trim and trim-smooth checkpoints. Inspected front/threequarter/512 whole: flat version shows compact point but visible attachment lip; all-face smooth shading looks blunt and exposes collar. Independent critic reviewing. Not retained or production-ready.
Native ShadeFlat on base ngon index30 only, smooth sides retained. Verified only face30 flat. Threequarter render removes erroneous rounded highlight; attachment lip persists. Saved base-flat checkpoint, critic informed. No geometry change from trim.
Measured cut47vertices: X[-.4549544,-.4258053],Y[-.5445309,-.5121869],Z~-.11630. Native32basevertices SX1.041 GX.00003 GY-.00302. Apex unchanged (-.43809697,-.51155514,-.13484630). Front/threequarter lip reduced; exposed profile shows abrupt triangular transition. All four fit views rendered; root inspected closeups, independent final verdict requested. No further amplitude series.
## Final verdict: rejected
XHIGH and root reject fitted R62. Exposed profile shows broad straight wedge at flat cut; fitting the footprint did not fit curvature/tangent transition. Whole-view gain insufficient. Restore R54 retained source, preserve R62 studies. No more base scaling/translation series. Protected-body audit remains valid but does not establish visual quality.

## whole-r63

### status.md

Source: `canonical/characters/charizard/whole-r63/status.md`

Native body duplicate from retained R54. Selected ellipse (x/.18)^2+((z+.30)/.20)^2<1, y<-.25;6770vertices. Native Smooth Vertices, F9 factor.5 repeat30 XYZ. This was executed before MAX planner recommended a different40repeat Y-only patch; do not claim that recommendation was executed and do not rerun as amplitude series.
Initial audit read stale object data while EDIT_MESH and incorrectly reported zero; overwritten after settled ObjectMode read. Actual6770changed,maxdelta.005563259,protected0. Saved final ObjectMode checkpoint. Root inspected four views: central bands calmer, lower perimeter bands remain. No obvious whole silhouette loss observed; critic reviewing for patch rim/dent/shrink. Not retained yet. No textures/rig gate.
Final: RETAIN regional central-abdomen cleanup. XHIGH independently compared all4 against R54: materially calmer bands, convex belly preserved, no apparent dent or new elliptical rim, rear no regression. Lower/lateral bands remain; whole-torso gate open. Close pass without more amplitude changes.

## whole-r64

### status.md

Source: `canonical/characters/charizard/whole-r64/status.md`

# R64 rejected: axis setup failed and underside artifacts
Attempted native SmoothVertices .5 repeat30 with X/Z disabled via F9. Audit proves actual YZ movement (X0,Y.00380853,Z.00300929); intended depth-only constraint NOT achieved. Render shows lower strip stippling/artifacts. Reject and restore R63 retained. Do not call this a valid Y-only experiment or continue this bottom-reaching selection.

## whole-r65

### status.md

Source: `canonical/characters/charizard/whole-r65/status.md`

Executed planner selection (X/.235)^2+((Z+.30)/.235)^2<1,-.53<Z<-.30,Y<-.45 excludingallR63IDs. Native SmoothVertices .5repeat30XYZ verified screenshot before closing F9.2524changed,maxdelta.00544861,protected0. Selection visually excluded lowestcontour/hipjoins. All4renders inspected; root sees lower/lateralbands softer,no obviousdepthloss; lowestbandsremain. Critic reviewing. Noamplitudeseries. R63retained untilverdict.
Final: retain bounded lower-abdomen cleanup. Root and XHIGH agree lower/lateral bands soften and center transition less stepped; side convex belly preserved, no apparent dent/newrim/narrowedmass, rear no regression. Lowest bands remain. Close pass, no amplitude correction; whole-torso acceptance open.

## whole-r66

### cumulative-comparison.json

Source: `canonical/characters/charizard/whole-r66/cumulative-comparison.json`

"before": "R54 body and retained tail",
"after": "R66 body and same retained tail",
"purpose": "Cumulative regional cleanup, not whole-asset acceptance",

### status.md

Source: `canonical/characters/charizard/whole-r66/status.md`

Native duplicate of retained R65. Selected (X/.15)^2 + ((Z+.04)/.17)^2 < 1, Y < -.50, excluding all R63/R65 IDs. Inspected selection; shoulder roots and neck side contours excluded. Applied native Smooth Vertices, factor .5, repeat 30, XYZ; F9 settings visually verified.
4,995 vertices changed; maximum displacement .00682651; all unselected vertices unchanged. Root inspected front, side, rear and three-quarter: streaks calmer, rounded side projection appears preserved. Independent critic reviewing patch boundary and volume. No further amplitude pass; R65 remains retained until verdict.
Final: retain limited chest/lower-throat cleanup. XHIGH compared all four views against R65: reduced streaks, rounded side projection and outer curve preserved, rear no regression. Faint curved lower patch transition remains in three-quarter; not seamless, but not a hard rim or depressed panel at whole scale. Close this pass without amplitude correction. Whole-asset gate remains open.

## whole-r67

### status.md

Source: `canonical/characters/charizard/whole-r67/status.md`

# R67 retained: limited haunch cleanup

## whole-r68

### status.md

Source: `canonical/characters/charizard/whole-r68/status.md`

# R68 rejected: broad wing form gate failed
Root and XHIGH critic inspected all four R68 views against R67 plus matched detail before/after. Fine ripple texture is reduced, but large uneven bulges and troughs still dominate front/threequarter. An angular transition remains above the trailing scallop crest. No meaningful broad-form improvement at whole-character scale. No obvious outline collapse; thickness is not reliably established by whole views.

## whole-r69

### status.md

Source: `canonical/characters/charizard/whole-r69/status.md`

# R69 REJECTED: transition crease
Root and XHIGH critic inspected all four comparisons against R67. Some outer-bay bulges are shallower, but front has a stronger near-vertical dark transition beside the shared support, ending in a pinched change above the scallop. Threequarter retains irregular billows; rear retains an abrupt support transition. Fails no-crease gate despite sampled thickness ratios >=.65. R67 restored. Close compression trial; no amplitude series.
Eight control coordinates audited; protected vertex displacement zero; max evaluated displacement .01009805. 21 valid paired normal-ray thickness samples from25 grid positions, min after/before .6500004; sampled evidence only, not a global intersection proof. Four renders inspected. Root sees some reduced bulge amplitude but a stronger vertical transition near shared support; critic pending. No promotion. R67 remains retained baseline.

## whole-r70

### status.md

Source: `canonical/characters/charizard/whole-r70/status.md`

# R70 REJECTED: negligible visible gain
Root and XHIGH critic inspected four corrected views against R67. Hollow and surrounding billows read essentially unchanged at whole scale. No apparent pad or outline/back damage, but no meaningful improvement. Restore R67; close Fill trial without additional strokes.
Verified Fill/Deepen AREA plane offset0 ADD, front faces only, symmetry off, strength.25. Front-only ellipse mask intersects safe bay interior. One native stroke600496 to651506. Initial101 size footprint half planned width; restored prestroke and corrected202px size, one stroke, no cumulative application. Corrected958 vertices moved max.0003102677, protected0. Four renders inspected by root: no meaningful whole-scale hollow improvement apparent; critic pending. No promotion.

## whole-r71

### form-status.md

Source: `canonical/characters/charizard/whole-r71/form-status.md`

XHIGH and root comparisons: concentrated dark pocket above scallop and sharper shoulder; no continuous shallow sweep. Reverted to reduced construction checkpoint, not R67 promotion. No stacked smoothing/counter-move. Renders do not prove wrong sign or folded geometry. Need broader coherent form control before acceptance.
# R71 broad-form midpoint, not retained
25 paired normal-ray thickness samples after/before .9940–1.00953; sampled only. Four form renders produced. Root front/threequarter sees stronger dark transition above scallop; visual critique pending. No quality promotion, no thickness-based acceptance. Reduced and R67 checkpoints preserved.

### section-status.md

Source: `canonical/characters/charizard/whole-r71/section-status.md`

Planner receives profiles to constrain complete-section placement, including endpoint tangents. Need identify actual fixed membrane/support transition inside crop; do not mistake cropped endpoints for anatomical boundaries. R67 remains retained; R71 remains construction only.

### sectionfit-review.md

Source: `canonical/characters/charizard/whole-r71/sectionfit-review.md`

Root inspected actual front, side, rear and three-quarter PNGs, comparing the three-quarter baseline. Broad membrane noise remains; no convincing whole-character improvement. MAX reviewer independently reports a stronger crease above the outer scallop and a sharper three-quarter shoulder. XHIGH review pending.
The paired lattice translations used inferred fairing curves, not calibrated official HOME geometry. Successful control placement and protected-zero displacement do not prove reference fidelity. R67 remains the retained asset; this candidate is preserved separately. Do not tune another amplitude or stack smoothing onto the transition ridge.
Root rejected promotion and reopened R67 retained via Blender MCP; live file and visible body/tail object names verified.
XHIGH independently inspected all four candidate, reduced, retained R67 views and official HOME: REJECT. Slight central calming does not offset sharper dark crease/ledge above outer scallop, pinched transition, and remaining billows. Rear offers no compensating gain. HOME dark membrane does not establish exact camber.

### status.md

Source: `canonical/characters/charizard/whole-r71/status.md`

Four views rendered; root front/threequarter inspected. Broad form unchanged and tiny upper-bay highlight artifacts visible. No quality retention. Keep as construction source for coherent broad-form editing; R67 remains accepted working baseline. Next: paired front/back coarse controls, then complete surface refinement and multiview gate.

## whole-r72

### scaled-remesh-review.md

Source: `canonical/characters/charizard/whole-r72/scaled-remesh-review.md`

# R72 scale-aware QuadriFlow — produced and rejected
MAX source review found Blender rejects componentwise-near endpoints at local-coordinate tolerance1e-4, in addition to manifold/winding checks. Open boundaries are allowed; the temporary cap was unnecessary. Source: https://github.com/blender/blender/blob/main/source/blender/editors/object/object_remesh.cc#L681-L737
Output1635vertices1614faces42boundaryedges,0overconnected. This is not a faithful root loop replacement (original207). Root inspected actual front/side/rear/threequarter renders. REJECT: heavily angular/torn scallop outline, changed outerrim shape, root seam. No resolution series or refinement of distorted cage. R67 reopened and verified. This establishes a reproducible input workaround but no asset-quality improvement.
XHIGH independently opened all4: unequivocal rejection. Ragged stepped cutouts/blunt scallop points, kinked/thinned outer border, broken root transition and rear diagonal opening. Smoother shading does not compensate.

### status.md

Source: `canonical/characters/charizard/whole-r72/status.md`

# R72 connected-wing construction — input failure
Native Merge by Distance at .0001 removed590 vertices, leaving45294v90383f203boundary, followed by Recalculate Outside. Same QuadriFlow settings refused again. This establishes input failure, not a failed resolution/shape result.
Native temporary cap attempt (boundary selection203, F, CtrlT) generated invalid topology:20 boundary and10 overconnected edges. Saved separately, REJECTED; never sent into remesher. Root cap requires deliberate topology construction; do not assume an arbitrary triangulated cap is valid.
Reopened R67 retained and verified exact live path. All R72 sources preserved privately; nothing promoted. No merge/push.

## whole-r73

### REVIEW.md

Source: `canonical/characters/charizard/whole-r73/REVIEW.md`

Visual review: cleaner continuous leading rim, but a small upper root opening remains in the rear view. The sheet is flat and lacks thickness; the intermediate scallop is soft. Retained root flap and new sheet are not yet one physical surface. Continue construction with root closure, membrane thickness, then controlled camber. Do not promote as production geometry.
R73 inherits the older R58 body scaffold. R67 remains the canonical retained character. Any accepted wing must be transferred without losing R67 body improvements. Flame remains runtime-only with an empty socket. No UV, texture, rig or animation gate has passed. No merge or push.

### blend-review.json

Source: `canonical/characters/charizard/whole-r73/blend-review.json`

"status": "construction-review-pending",
"review": "Root and all4views inspected. Smoother diagonal seam, but thickroot flap still visible side and sparcap junction remains. R67 retained; no production pass.",

### contour-blend-review.json

Source: `canonical/characters/charizard/whole-r73/contour-blend-review.json`

"status": "retained-local-contour-improvement-only",
"canonicalRetainedAsset": "r67",

### descending-review.json

Source: `canonical/characters/charizard/whole-r73/descending-review.json`

"status": "construction-in-progress-not-promoted",

### junction-diagnostic.json

Source: `canonical/characters/charizard/whole-r73/junction-diagnostic.json`

"finding": "Closeup shows new sheet meeting one jagged diagonal cut while retained rear skin rises separately. Upper wedge and unjoined diagonal remain.",
"next": "Construction copy: thin two-sided membrane, open root sidewall, explicitly bridge its loop to original paired-skin cut; inspect correspondence and crossings. No camber until join gate.",
"retained": "r67"

### matched-review.json

Source: `canonical/characters/charizard/whole-r73/matched-review.json`

"status": "construction-in-progress",
"review": "Native dissolve165boundary vertices kept42 anchored arc samples. Native42to42bridge reduces sawtooth in inspected matched-root.png, but diagonal thickness crease remains. Wider collar and full multiview validation pending. R67 retained.",

### refine-review.md

Source: `canonical/characters/charizard/whole-r73/refine-review.md`

A single native Smooth Vertices operation (factor .5, repeat 1, XYZ) changed 249 selected vertices, maximum displacement .01571958, zero changes outside selection. The inspected refine-root.png still shows the sawtooth join. Trial saved privately as charizard-home-r73-refine.blend and reverted to charizard-home-r73-bridge.blend. Do not repeat smoothing. Repair root strip spacing/correspondence; transition has not passed. R67 remains retained.

### ring-review.json

Source: `canonical/characters/charizard/whole-r73/ring-review.json`

"status": "not-retained",
"review": "Native subdivide42crossedges added42vertices. Closeup shows persistent seam; single native Smooth Vertices on new ring only did not resolve it. Restored matched bridge. Broader transition required; no further narrow-ring smoothing. R67 retained.",

### root-target-diagnostic.json

Source: `canonical/characters/charizard/whole-r73/root-target-diagnostic.json`

[
  {
    "id": 45,
    "original": [
      0.18000002205371857,
      -0.3352299928665161,
      0.16999997198581696
    ],
    "nearestCut": [
      0.1601610630750656,
      -0.3326733112335205,
      0.1616612672805786
    ],
    "delta": [
      -0.019838958978652954,
      0.0025566816329956055,
      -0.008338704705238342
    ],
    "distance": 0.021671522860647822
  },
  {
    "id": 2,
    "original": [
      0.18000002205371857,
      -0.3352299928665161,
      0.1499999761581421
    ],
    "nearestCut": [
      0.1601572036743164,
      -0.3401876389980316,
      0.15680021047592163
    ],
    "delta": [
      -0.01984281837940216,
      -0.004957646131515503,
      0.006800234317779541
    ],
    "distance": 0.021553627740379038
  },
  {
    "id": 13,
    "original": [
      0.2183000147342682,
      -0.2964025139808655,
      0.11370998620986938
    ],
    "nearestCut": [
      0.20205390453338623,
      -0.2978310286998749,
      0.07608899474143982
    ],
    "delta": [
      -0.016246110200881958,
      -0.0014285147190093994,
      -0.037620991468429565
    ],
    "distance": 0.04100384974314892
  },
  {
    "id": 4,
    "original": [
      0.256600022315979,
      -0.25757500529289246,
      0.07741998881101608
    ],
    "nearestCut": [
      0.2440120279788971,
      -0.26773566007614136,
      0.05509870871901512
    ],
    "delta": [
      -0.01258799433708191,
      -0.010160654783248901,
      -0.02232128009200096
    ],
    "distance": 0.027566937305571578
  },
  {
    "id": 9,
    "original": [
      0.29490000009536743,
      -0.21874749660491943,


### slide-review.md

Source: `canonical/characters/charizard/whole-r73/slide-review.md`

Native partial edge-slide trials on eight near-side seam edges, +.35 then -.35 from matched rollback. Root closeups inspected; neither resolved the visible crease. Both saved privately; restored matched bridge. No additional slide amplitude series. A broader finite transition with an intermediate ring remains necessary. R67 retained.

### union-final-review.json

Source: `canonical/characters/charizard/whole-r73/union-final-review.json`

"status": "rejected",

### union-preview-review.json

Source: `canonical/characters/charizard/whole-r73/union-preview-review.json`

"status": "unretained-preview",
"review": "Root closeup inspected: joined surfaces but rim pinching remains. Geometry and multiview checks pending. R67 canonical, blend collar retained construction.",

## whole-r74

### graft-review.json

Source: `canonical/characters/charizard/whole-r74/graft-review.json`

"status": "retained-construction-candidate",
"criticReview": "XHIGH critic inspected all12 R74/R67/R73 views. Retain: cleaned torso and wing contour preserved, no new graft seam, gap or silhouette break. Existing root, membrane and opposite-wing limitations remain."

### status.md

Source: `canonical/characters/charizard/whole-r74/status.md`

R74 consolidation in progress. Both planner and critic retained the R73 contour as a limited construction improvement. Native P Selection extracted membrane+collar:1470vertices1448faces. All42 attachment anchors exactly match R67 coordinates. All45884 original R56 wing coordinates also exactly match R67, enabling a repeatable cut without guessing. Saved private charizard-home-r74-separated-patch.blend. No graft yet. Next: duplicate R67, select original wing via whole-r73/r67-wing-selection.json, native separate; repeat original165 boundary dissolves; append patch+spar and merge only42 matching anchors. Audit surviving R67 and patch coordinates, then all4 rendered views. Canonical R67 unchanged; no production approval.
Graft completed using native Separate, Dissolve Vertices, Join and Merge by Distance. Both root and critic inspected all4 views against R67/R73. Retained as construction candidate, current-asset now R74.230798 R67 coordinates and1470 patch coordinates preserved exactly,0outside sources;232226vertices462602faces,236tailboundaryedges,0overconnected/wire. Private charizard-home-r74-grafted.blend. No production approval.

## whole-r75

### bridge-trial-review.json

Source: `canonical/characters/charizard/whole-r75/bridge-trial-review.json`

"status": "rejected-initial-bridge",
"reason": "Rear shaded render shows projecting root transition/dark seam. Native initial bridge has0cuts; planned2cut surface bridge and pairing checks remain. No visual acceptance."

### corrected-bridge-review.json

Source: `canonical/characters/charizard/whole-r75/corrected-bridge-review.json`

"status": "winding-fixed-shape-still-rejected",
"visual": "Rear shaded render still has folded root shelf. Correct orientation is necessary but did not resolve interpolation/shape failure.",
"next": "Inspect bridge cross-section and tangent overshoot; preserve source loops and accepted wing pose. No repeated smoothing."

### depth-review.json

Source: `canonical/characters/charizard/whole-r75/depth-review.json`

"status": "reverted-depth-rotation",
"reason": "Improved wrist depth but displaced outertip away from original. RY10 remains fitting baseline. Broad coordinated wrist/upper-wing adjustment needed with outertip/root held.",
"/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r75/rejected-depth8-overlay.png"

### fit-review.json

Source: `canonical/characters/charizard/whole-r75/fit-review.json`

"status": "pose-scaffold-sufficient-for-root-fit",
"critic": "All6 overlays inspected. Wrist neighborhood improved in front/left; broad2bayfan preserved. Root mismatch remains. Fit interface with wrist/span/trailingpoints held. Overlays do not approve shaded surface or final silhouette.",

### interface-trials-review.json

Source: `canonical/characters/charizard/whole-r75/interface-trials-review.json`

"status": "rejected-restored-root-lowered",
"result": "No meaningful visible interface improvement; reverted"
"result": "Front rear oblique inspected. Cap buried but collar shelf/layer persists and front underside bead remains. Fails planner gate; reverted. No amplitude series."
"retainedSource": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r75/charizard-home-r75-root-lowered-trial.blend",
"next": "Local interface reconstruction required; smooth flags and independent endpoint placement do not resolve the collar geometry."

### interface-triangulation-review.json

Source: `canonical/characters/charizard/whole-r75/interface-triangulation-review.json`

"result": "Explicit native triangulation of42 adjacent ngons does not visibly remove shelf in inspected oblique closeup. Diagnostic only; restore retained source."

### joint-relax-review.json

Source: `canonical/characters/charizard/whole-r75/joint-relax-review.json`

"status": "rejected-restored-root-lowered",

### linear-attempt-invalid.json

Source: `canonical/characters/charizard/whole-r75/linear-attempt-invalid.json`

"status": "invalid-linear-comparison",
"reason": "Native dropdown selection did not yield requested LINEAR. Saved filename linear-bridge is attempt label only, not proof of interpolation. Render remains rejected.",
"next": "Inspect expanded menu and actual operator properties before render."

### linear-verified-review.json

Source: `canonical/characters/charizard/whole-r75/linear-verified-review.json`

"status": "candidate-multiview-pending",

### root-detail-review.json

Source: `canonical/characters/charizard/whole-r75/root-detail-review.json`

"status": "attachment-detail-needs-work",
"inspection": "Front and rear closeups opened. Residual collar shelf and rounded separate spar cap are clear; lower bridge edge has serrated shading and a thin layered appearance. These details are not resolved by whole-view acceptance. Next correction must preserve retained shoulder height and wing outline.",

### root-join-status.json

Source: `canonical/characters/charizard/whole-r75/root-join-status.json`

"status": "unjoined-interface",
"visualFinding": "Original guide hidden in rear reveals upper body boundary above newroot, lower collar overlap. Must resolve before join acceptance.",
"next": "Planner reviewing coherent interface fit/bridge; wrist and outer span held."

### status.md

Source: `canonical/characters/charizard/whole-r75/status.md`

Native world-X mirror of appended clean membrane/collar and spar, both wire-display and hidden from render. Original wing intact. Saved charizard-home-r75-mirrored-fit-scaffold.blend. Root inspected intake-view.png: wrist is too far outward, outertip too low, root offset; blind mirror is not accepted. Next shared pose fit and broad landmark adaptation in front/side/rear before any cut. R74 remains retained construction. Negative object scale expected in temporary scaffold; resolve normals/transforms before graft/export.
Shared native RY10 around mirrored upper root improves front leading rim and trailing-tip placement compared with blind mirror. Front and side overlays inspected. Wrist remains offset; side overlap includes original far wing so depth fit remains unverified. Saved pose10 rollback. No original geometry cut.
Original wing separated natively after connected-component selection inspection. Initial spatial selection included head/arm and was rejected; largest connected induced region excluded those. Original wing preserved as GEO-original-opposite-wing-guide-r75:48689v97111faces263boundary. Saved before-wing-cut and original-wing-separated. New263 root boundary now available for fitting; not grafted.

### surface-bridge-review.json

Source: `canonical/characters/charizard/whole-r75/surface-bridge-review.json`

"status": "rejected-folded-bridge",
"visualFailure": "Actual rear shaded render shows crossing/folded root. Pairing investigation needed; no smoothing or acceptance.",

## whole-r76

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r77

### cap-round-review.json

Source: `canonical/characters/charizard/whole-r77/cap-round-review.json`

"status": "rejected-restored-R76",
"next": "Cross-section-wide controlled reshape; do not repeat cap spherization or corner displacement"

### lobe-selection-review.json

Source: `canonical/characters/charizard/whole-r77/lobe-selection-review.json`

{
  "source": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r76/charizard-home-r76-surface-relax.blend",
  "candidate": "largest connected body vertex region x<-.50,z<-.30, no Y restriction",
  "componentSizes": [
    19134
  ],
  "bounds": [
    [
      -0.8312171101570129,
      -0.5000461339950562
    ],
    [
      -0.2559434771537781,
      0.2544679343700409
    ],
    [
      -0.6741006374359131,
      -0.3607553541660309
    ]
  ],
  "review": "Front selection opened: blunt body lobe selected, haunch unselected. Rear screenshot is occluded by separate return tail, so it does not establish far-surface coverage; hide return tail before further visual confirmation. Bounds confirm no Y cutoff.",
  "checkpoint": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r77/charizard-home-r77-lobe-selected.blend"
}


### review-export.json

Source: `canonical/characters/charizard/whole-r77/review-export.json`

{
  "path": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r77/charizard-home-r77-cleanup-review.glb",
  "sha256": "df2a6ea458883fd909880b9503b933b1a90985dc6a4cf78a23251e5b4fbb7cd4",
  "bytes": 13932560,
  "validHeader": true,
  "meshes": 4,
  "nodes": [
    "GEO-home-body-wing-r74",
    "FlameSocket",
    "GEO-home-tail-crosssection-r54",
    "GEO-wing-opposite-fit-spar-r75",
    "GEO-wing-spar-control-r73"
  ],
  "animations": 0,
  "scope": "Static review export, not production ready; reopened geometry/node audit and three-quarter visual comparison recorded"
}


## whole-r78

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r79

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r80

### review.json

Source: `canonical/characters/charizard/whole-r80/review.json`

"status": "retained regional improvement",

## whole-r81

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r82

### review.json

Source: `canonical/characters/charizard/whole-r82/review.json`

"status": "rejected by root and independent critic; R80 restored",
"rootReview": "Little whole-head silhouette benefit; suspected sharper mouthcorner crease. Fails useful gain/protected-mouth gate; no amplitude series.",
"retained": "R80 remains registry source",
"critic": "All10images inspected. Cap remains rounded knob, no convincing whole-threequarter improvement, more pinched dark crease at forwardmouthjunction. No amplitude retry."

## whole-r83

### review.json

Source: `canonical/characters/charizard/whole-r83/review.json`

"status": "rejected by root and independent critic; R80 retained",
"retained": "R80",
"critic": "All six R83 views compared with corresponding R80/R81 and HOME. Shallower nose cap but same rounded knob ahead of orbital mass. Whole front/threequarter likeness gain fails. More dark tiering near mouth/chin is visible but physical fold unproven. No clear throat regression. No amplitude retry."

## whole-r84

### correction-review.json

Source: `canonical/characters/charizard/whole-r84/correction-review.json`

"status": "fails early form gate; unpromoted",
"retained": "R80",

## whole-r85

### jaw-wedge-review.json

Source: `canonical/characters/charizard/whole-r85/jaw-wedge-review.json`

"status": "rejected by root and independent critic",
"retained": "R80",

### review.json

Source: `canonical/characters/charizard/whole-r85/review.json`

"status": "upper construction gate cleared; coarse chin added; neck fit and likeness pending",
"retained": "R80",

## whole-r86

### review.json

Source: `canonical/characters/charizard/whole-r86/review.json`

"status": "retained construction study by root and critic; R80 remains asset registry",
"retained": "R80",
"critic": "Jaw now continues into cheek; intelligible rear-tapering mouth. Next retained-neck fit, side/low-front/whole view. Interior unfinished, chin projects slightly ahead and lowerrear deep; proportions provisional. No production or likeness pass."

## whole-r87

### review.json

Source: `canonical/characters/charizard/whole-r87/review.json`

"status": "placement study only; neck gate unproven",
"retained": "R80",

## whole-r88

### review.json

Source: `canonical/characters/charizard/whole-r88/review.json`

"status": "construction study; no production approval",
"retained": "R80",

## whole-r89

### review.json

Source: `canonical/characters/charizard/whole-r89/review.json`

"status": "construction study; no production approval",
"retained": "R80",
"critic": "Reject collar as interface. Replace temporary tube with short bent throat patch from original neckcut to deliberate posterior underside/back opening in head. Preserve muzzle/mouth/crown, correspond boundaries; continuous throat/nape and no openrim or waist."

## whole-r90

### review.json

Source: `canonical/characters/charizard/whole-r90/review.json`

"status": "upper-connected direction useful; coarse throat fails bridge gate",
"retained": "R80",

## whole-r91

### review.json

Source: `canonical/characters/charizard/whole-r91/review.json`

"status": "coarse-fit prerequisite cleared by critic; graded bridge trial next",
"retained": "R80",
"rootReview": "All6renders opened. Lowfront alignment improves, funnel reduced; side interface ledge persists. No watertight join claim. Coarse bridge gate pending.",

## whole-r92

### review.json

Source: `canonical/characters/charizard/whole-r92/review.json`

"status": "rejected joined surface by root and critic",
"retained": "R80",

## whole-r93

### review.json

Source: `canonical/characters/charizard/whole-r93/review.json`

"status": "retained-construction-progress; no HOME likeness acceptance; registry R80 unchanged",
"Separate failed band as hidden GUIDE-rejected-neck-band-r93",
"root_review": "Opened all four linear and all four curved renders. Broad curve substantially reduces R92 cuff and inward pinch. Longitudinal streaks and upper boundary remain visible. Full head likeness and production topology are not accepted.",
"critic": "Opened R93 four views, R92 counterparts and HOME. Substantial cuff/pinch reduction and continuous bend. Retain construction checkpoint. Upper boundary/banding unresolved; do not infer folds from bands or geometry-smooth blindly.",

### topology-diagnostic.json

Source: `canonical/characters/charizard/whole-r93/topology-diagnostic.json`

{
  "bridge_polygon_sizes": {
    "4": 1140
  },
  "upper_contact_ngons": 38,
  "upper_ngon_sizes": {
    "8": 6,
    "10": 6,
    "9": 26
  },
  "longitudinal_dihedral_degrees": {
    "count": 1140,
    "max": 32.19863872865316,
    "mean": 2.901177110934992
  },
  "zero_area_bridge_faces": 0
}


## whole-r94

### review.json

Source: `canonical/characters/charizard/whole-r94/review.json`

"status": "rejected; R93 restored",
"visual_review": "Root opened matched side and low-front; no meaningful upper-boundary improvement, upper dimples remain. Closed tessellation test; no blanket triangulation or smoothing follow-up.",

## whole-r95

### review.json

Source: `canonical/characters/charizard/whole-r95/review.json`

"status": "retained bounded nasal-form improvement; overall likeness unaccepted; registry R80 unchanged",
"critic": "Opened three R95 views, three R93 counterparts, HOME and art. Retain lifted blunt cap and continuous rear transition. Low-front remains heavy/rounded but spans muzzle without isolated button, pinched bridge, beak or mouth misalignment. No height reduction justified by unmatched reference cameras. Close cap-height loop. Coarse cranial/cheek form still generic."

## whole-r96

### review.json

Source: `canonical/characters/charizard/whole-r96/review.json`

"status": "retained coarse horn landmarks; not attachment finish or head acceptance",
"ui_failure": "First attempted first-horn.blend/first-horn-side.png contain corrupted transform from popup close selecting body; immediately restored horn-intake. Do NOT reuse those two failed artifacts. Corrected first-horn-corrected and subsequent pair sources passed body audit.",

## whole-r97

### review.json

Source: `canonical/characters/charizard/whole-r97/review.json`

"status": "rejected; R96 restored",
"root_review": "Opened side/low-front. Cap polygon smaller but still visible; narrowed root not a sufficient repair. Rejected and restored R96. Planner advised against arbitrary radius shrink and against changing positivehorn without evidence. No claim that translation-only trim was tested.",
"next": "Preserve diagnosed cap defect; coarse eye/brow assembly remains next head-fidelity study. Final head acceptance requires proper root continuity and mouth interior.",

## whole-r98

### review.json

Source: `canonical/characters/charizard/whole-r98/review.json`

"status": "rejected; R96 restored",
"root_review": "Opened firsteye,module and fourpair renders. Narrow eye in side,raisedpad/brow lowfront; internaleye surfaces show through unfinishedmouth. No iris/texture or headacceptance.",
"critic": "Four views plus R96 and officialreferences: side landmark but sleepy slit whole; low-front/rear raised rounded pads and separate thin brow rather than eye opening in sloped orbital mass. Seating/form failure independent of iris. Proper rim-derived mouth interior is critical next before more assembly fitting. Preserve lips/gap/chin/skull; no more eye-scale/brow-amplitude pass."

## whole-r99

### review.json

Source: `canonical/characters/charizard/whole-r99/review.json`

"status": "retained mouth-cavity construction; head likeness unaccepted",
"root_review": "Opened side,low-front,whole,rear. Recessed mouth visible; horncap no longer shows through knownarea. Outer lip/skull sourcevertices fixed. EyesR98 absent/rejected.",

## whole-r100

### review.json

Source: `canonical/characters/charizard/whole-r100/review.json`

"status": "complete-taper rejected; unshaped socket mechanism only retained as construction",
"diagnostic": "All10 eye boundary vertices exactly coincide with body rim vertices. No zero-area face incident to new orbital vertices. These checks do not certify absence of folds or intersections. Ray at side pixel450,392 hits backside of face329748; contour fails regardless.",

## whole-r101

### review.json

Source: `canonical/characters/charizard/whole-r101/review.json`

"status": "independent insert retained construction; orbital contour and pairing unaccepted",
"root_review": "Opened side,low-front,whole. Less chipped outer surround than R100, but inner patch uneven and lowfront dark wedge. Not accepted, not paired.",
"critic_review": "Outline more coherent than R100, but interior cushion and dark anterior pocket fail side/low-front/whole eye read. One bounded interior-only correction permitted; no separation or pairing.",
"interior_trial": "Topology-derived two interior vertices only; native Smooth Vertices once. Opened relax-side and relax-low-front; no meaningful improvement, not retained.",
"normal_diagnostic": "Temporary flat shading on six inner faces greatly reduces cushion without geometry edits; flags restored. Native P Selection separates those6faces as12vertex GEO-eye-positive-r101 with no transforms. Opened independent side/low-front/whole: much reduced cushion. Critic withdrew categorical claim separation cannot help after flat diagnostic; independent result pending.",
"independent_critic_review": "Opened three independent views. Cushion and dark/bright pocket greatly reduced; retain independent insert construction. No new raised pad or conspicuous gap. No more interior relaxation or depth changes supported. Residual clipped quadrilateral, short nasalpoint and blunt boxy rear; angular expression gate open.",

## whole-r102

### review.json

Source: `canonical/characters/charizard/whole-r102/review.json`

"status": "retained coarse eye pair; final expression and likeness unaccepted",

## whole-r103

### review.json

Source: `canonical/characters/charizard/whole-r103/review.json`

"status": "retained limited jaw-pose improvement; likeness unaccepted",
"root_review": "Opened side/low-front/whole. Smaller nonzero opening, more compact neutral mouth. No obvious notch at this scale; unaccepted pending critic and audit.",

## whole-r104

### rejection-review.json

Source: `canonical/characters/charizard/whole-r104/rejection-review.json`

"status": "rejected active candidate; preserved for comparison",
"critic": "With original guide hidden and smooth shading, loft projects beyond haunch without demonstrably better tail-turn profile. Excess bulge and unresolved upper/return trajectory remain. HOME supports substantial proximal tail mass; rejection is not justification for shrinking original globally.",
"next_gate": "Refit outboard section shape and path, preserving reference mass. Require improved isolated front/oblique/rear shape and return alignment before topology work.",
"native_expansion_test": "Not executed: critic evidence changed next action before mutation.",

### smooth-diagnostic.json

Source: `canonical/characters/charizard/whole-r104/smooth-diagnostic.json`

"status": "diagnostic only; not retained replacement",
"root_review": "Smooth shading removes facets but does not solve open interface or establish improved tail silhouette. Defer graded topology work until silhouette review.",
"last_retained": "R103",

## whole-r105

### corner-trial-review.json

Source: `canonical/characters/charizard/whole-r105/corner-trial-review.json`

"status": "rejected and reverted",
"lesson": "Skin-only selection deforms surface rather than full section contour. Next different-method trial must span lobe depth and protect interface and envelope landmarks; do not increase this local move amplitude.",
"planner_next": "One full-depth lower shoulder selection, broad falloff, inward/up direction; exact selection preview required."

## whole-r106

### review.json

Source: `canonical/characters/charizard/whole-r106/review.json`

"status": "rejected; R103 geometry restored via R105 inspection source",
"decision": "Close this proportional-translation approach. No amplitude continuation. Retain failed blend/render evidence privately.",
"next": "Reassess higher-impact whole-character silhouette priorities before spending more tail iterations.",

## whole-r107

### retention.json

Source: `canonical/characters/charizard/whole-r107/retention.json`

"status": "retain limited middle digit; whole character needs work",
"critic": "Matched side confirms bend and volume, continuous narrowing; no collar or waist. Front/whole improvement retained. Close amplitude loop.",

## whole-r108

### retention.json

Source: `canonical/characters/charizard/whole-r108/retention.json`

"status": "retained limited digit taper improvement",
"source": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r108/charizard-home-r108-retained-hand.blend",

## whole-r109

### retention.json

Source: `canonical/characters/charizard/whole-r109/retention.json`

"status": "retained limited finger-form improvement",
"source": "/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r109/charizard-home-r109-retained-digits.blend",
"critic": "Corrected short digit retained side/opposite: longer more even taper, mild residual contour break.",

## whole-r110

### camera-review.json

Source: `canonical/characters/charizard/whole-r110/camera-review.json`

"status": "camera diagnostic; no geometry edit",

## whole-r111

### rejection.json

Source: `canonical/characters/charizard/whole-r111/rejection.json`

"status": "rejected and restored R109 anatomy via R110 camera source",
"next": "Larger reference-supported head form target; no more saddle lift amplitudes."

## whole-r112

### invalid-trial.json

Source: `canonical/characters/charizard/whole-r112/invalid-trial.json`

"status": "invalid selection; reverted",
"next": "Use headlocal transverse bound plus world head region and connected component; preview and audit selected bounds before native action. Preserve anterior chin; target central/posterior pouch rather than entire jaw."

## whole-r113

### rejection.json

Source: `canonical/characters/charizard/whole-r113/rejection.json`

"status": "rejected restored R109 anatomy",

## whole-r114

### retention.json

Source: `canonical/characters/charizard/whole-r114/retention.json`

"status": "retained for limited central-jaw relief only",
"root_review": "Head, side and whole opened. No new underside notch apparent; regional relief subtle. Overall head likeness remains unaccepted.",

## whole-r115

### review.json

Source: `canonical/characters/charizard/whole-r115/review.json`

"status": "rejected",
"reason": "Fine stripes quieter, broad ribbed planes and upper contact band still dominate. No convincing whole-view form improvement. Insufficient gain, not damage.",

## whole-r116

### rejection.json

Source: `canonical/characters/charizard/whole-r116/rejection.json`

"status": "rejected by root visual gate",
"visual_failure": "Direct front shows central raised plateau between depressed side panels; fails continuous sloped-plane target. Low-head opened also.",

## whole-r117

### review.json

Source: `canonical/characters/charizard/whole-r117/review.json`

"status": "rejected for likeness",
"reason": "Lower crown makes unchanged rounded nasal cap more dominant. No stronger brow-cheek plane or characteristic profile; whole improvement unconvincing.",

## whole-r118

### comparison.json

Source: `canonical/characters/charizard/whole-r118/comparison.json`

"status": "comparison only; current R114 geometry unchanged",

## whole-r119

### retention.json

Source: `canonical/characters/charizard/whole-r119/retention.json`

"status": "retained limited aperture proportion improvement",
"Whole-head and whole-character likeness unaccepted",

## whole-r120

### diagnostic.json

Source: `canonical/characters/charizard/whole-r120/diagnostic.json`

"status": "diagnostic complete; flat wall shading rejected",
"next": "Inspect corner face tessellation or ray hit; no aperture length changes"

## whole-r121

### review.json

Source: `canonical/characters/charizard/whole-r121/review.json`

"status": "rejected",
"root_review": "Opened opposite render; anterior dark mark larger, no improvement",

## whole-r122

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r123

### review.json

Source: `canonical/characters/charizard/whole-r123/review.json`

"status": "rejected",
"root_review": "Foot closeup shows sharp foldedcrease afterpointretraction. Fails smoothpad and3terminalgate.",

## whole-r124

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r125

### review.json

Source: `canonical/characters/charizard/whole-r125/review.json`

"status": "rejected; intake restored",
"finding": "Extra point removed, but cut/cap intrudes into adjacent toe transition. Fails preserved toe-root gate.",
"next": "Do not repeat this spatial cut. Need topological isolation of medial lobe before any further removal."

## whole-r126

No top-level decision-named receipt found; inspect manifest and nested receipts before inferring a verdict.

## whole-r127

### review.json

Source: `canonical/characters/charizard/whole-r127/review.json`

"status": "rejected-restored-r119-anatomy",
"finding": "Surface softened but false fourth terminal persists and pad scallops. No retained visual gain. Close deformation/cut trials on this patch; next clean separate foot component blockout preserving source.",

## whole-r128

### review.json

Source: `canonical/characters/charizard/whole-r128/review.json`

"status": "construction-only-not-retained",
"preservation": "Original body retained, temporary visibility mask removed; candidate hidden in CANDIDATE-foot-r128-unapproved. Registry unchanged.",

## whole-r129

### review.json

Source: `canonical/characters/charizard/whole-r129/review.json`

"status": "candidate-not-retained",
"next": "Prefer native duplicate/separate of opposite foot as a reuse candidate before additional primitive refinement. Keep original intact.",

## whole-r130

### review.json

Source: `canonical/characters/charizard/whole-r130/review.json`

"status": "reuse-candidate-not-integrated",
"next": "Fit and rebuild candidate ankle boundary; do not return to primitive pad or false-lobe smoothing.",

## whole-r131

### review.json

Source: `canonical/characters/charizard/whole-r131/review.json`

"status": "construction-not-integrated",
"review": "Inspected closeup/front/side/rear/threequarter. Collar reaches leg but jagged XY rim causes visible fluting and cuff silhouette. Not acceptable for integration. Next regularize rim rather than more whole-foot transforms. Candidate hidden, original body preserved.",

## whole-r132

### review.json

Source: `canonical/characters/charizard/whole-r132/review.json`

"status": "rejected-restored-r131",
"next": "Use rollback R130 foot and working body copy for volume union experiment. Original retained anatomy stays intact."

## whole-r133

### review.json

Source: `canonical/characters/charizard/whole-r133/review.json`

"status": "watertight-construction-operand-not-integrated",
"visual": "Overlap collar is intentionally oversized, fluted and unfinished. Must fit/fuse and locally sculpt before acceptance. Original retained, candidate hidden.",
"next": "Prepare closed body working copy with original foot removed, union with fitted closed candidate, inspect and locally sculpt."

## whole-r134

### review.json

Source: `canonical/characters/charizard/whole-r134/review.json`

"status": "union-operands-prepared-not-unioned",
"nativeWork": "Duplicate retained body; delete8522original-foot vertices; select157ankle boundary edges only; flatten Z=-.57 and cap.",
"next": "Native mesh Intersect Boolean available; object BoolTool absent. Test union on copies, audit outside ankle due preexisting body boundaries.",

## whole-r135

### review.json

Source: `canonical/characters/charizard/whole-r135/review.json`

"status": "rejected-restored-r134",
"next": "Isolate/cap lower-leg operand into closed volume before union; do not repeat union on open full body."

## whole-r136

### review.json

Source: `canonical/characters/charizard/whole-r136/review.json`

"status": "closed-operands-preserved-union-rejected",
"finding": "Exact union failure persists with closed outward-oriented operands and proper selected split. Cause unresolved; watertightness alone does not establish Boolean suitability. No further setting retries. Original visible, operands hidden; no integration.",
"next": "Inspect cap tessellation/self-intersections before any additional Boolean; do not attribute failure to open full body alone."

## whole-r137

### review.json

Source: `canonical/characters/charizard/whole-r137/review.json`

"status": "diagnosis-planar-cap-trial-rejected-restored",
"next": "Do not repeat cap/Boolean settings. Need replacement connector topology or bounded local volumetric reconstruction with visual verification. Original retained geometry unchanged."

## whole-r138

### review.json

Source: `canonical/characters/charizard/whole-r138/review.json`

"status": "usable-construction-candidate-not-integrated",
"next": "Mask outside ankle band, native Shift-smooth strokes to remove collar while preserving toes/sole. Inspect multiangle before integration.",
