# r06 connected head study

This is an unfinished geometry study. It is not promoted over the frozen r03 overall candidate and is not an AAA asset. Root/Astra authored all Blender changes. No new image or mesh generation was used.

The shortened muzzle, narrower mouth gap, small lower-lip cleanup and continuous neck connection are useful local changes. The front still reads poorly: the eyes look sideways, the nasal mass is inflated, and the jaw hangs below a long artificial mouth slit. The side horns are thick horizontal tubes. The whole-body views also expose inherited rear-head bumps, weak hands and feet, wing-edge irregularities and unfinished tail/flame construction. Do not hide these behind the close-up.

## Inputs and fair comparison

The immediate geometry input was the live r05 mouth/jaw study scene, whose frozen checkpoint is `whole-r05/charizard-whole-r05-mouth-jaw-study.blend`, SHA256 `746f0988ac4d5095bccdcd7bd281a593aefb5e258cbb743aa9c2df58953d360e`. The preparation script copied that session state, including its active jaw shape, rather than loading or hash-verifying a frozen input. The separately saved r06-start file is the authoritative intake for this delivered comparison.

The head comes from the official illustration input used by Hunyuan run `charizard-official-raw-61062-o256`. That source was selected earlier for clearer wing membranes and separated toes, not because its head had beaten the original HOME61061 head in a controlled comparison. Both the official HOME and official illustration images were inspected during r06. A dedicated HOME61061 head comparison is the next source-selection check.

The `matched-intake` renders reload the frozen `charizard-whole-r06-start.blend` with the same head cameras, vertex-color display and lighting as the reopened r06 GLB. This pair has four comparable views. Side cameras clip the foreground wings. Earlier r03/r05 renders are not part of this matched pair. Multiple sequential edits occurred between the intake and final study, so the combined comparison does not isolate one causal change. Intermediate captures record the individual steps.

## Authorship and decisions

| Step | Operation and evidence | Decision |
| --- | --- | --- |
| Muzzle | Native GUI Edit Mode `S Y 0.85`, LOCAL orientation, cursor at head-local `(0,.035,0)`. MCP selected 3,154 vertices with forward coordinate above `.035`. Maximum measured transform error `2.98e-8`; Basis unchanged. | Retain shorter profile; nasal bulb still wrong. |
| Jaw closure | Native GUI `R X 3` around head-local `(0,-.01,-.003)` on a separate key. 1,827 selected vertices, maximum transform error `3.38e-8`. | Retain narrower gap; mouth curve and hanging jaw unresolved. |
| Eye offset | Native GUI Object Mode local-X translations of `-.012` and `+.012` after rebasing lenses into the head frame. | Trial only; exposed floating corners. |
| Eye fit | MCP-native Blender BVH queries and separate shape keys place the lenses against the head, preserving front-to-back depth. Offset `.0008`; rim sampling is documented in `eye-surface-fit.json`. | Retain visibility as a study; gaze, eyelids and materials still fail. |
| Lower lip | Native GUI Smooth brush stroke from `(800,545)` through `(840,555),(885,560),(922,555)` to `(945,550)`, size90, strength.45, local-X symmetry. MCP mask protected upper jaw and neck. 258 vertices changed, maximum displacement `.0053222842`. | Retain small cleanup; folded lip remains. |
| Exact Boolean neck union | Native MCP Exact Union on an exclusive body copy produced one manifold component but a visibly torn seam. | Rejected; source and captures preserved. |
| Curved bridge | MCP trimmed body and head at head-local Up `-.19` and `-.145`. Native GUI subdivided 13 longest upper-loop edges to make both loops 199 vertices, bridged them and set three intermediate rows through F9. Default path interpolation overshot into a collar. | Rejected curvature; retain native bridge connectivity. |
| Linear bridge | MCP graph traversal of the 796 bridge quads found five rows of 199 vertices. `Bridge_Linear_r06` sets the 597 middle vertices to endpoint interpolation at row/4, keeping both boundary loops unchanged. Maximum correction `.08646571`. | Retain continuous connection; anatomical shaping remains. |
| Tessellation | Native GUI `Ctrl T` triangulated one degenerate quad, without vertex displacement. Export has zero degenerate triangles. | Retain. |

`gui-modeling.jsonl` records input delivery. Resulting geometry and captures, rather than the journal alone, establish what happened. Unequal-loop bridging initially ignored the requested cut count; native undo returned to Sculpt Mode and required explicit inspection before proceeding. A first observation after Subdivide was stale; the next observation confirmed completion without repeating the operation.

The inline linearization used adjacency restricted to the captured bridge faces and breadth-first distance from the lower boundary. Every middle vertex had one neighbor in the preceding row and one in the following row. Following those chains gave the endpoint pair used for linear interpolation. `bridge-linear-targets.json` preserves all 597 resulting coordinates. `bridge-selection.json` refers to the mesh before the final one-face triangulation; its polygon indices must not be applied blindly to the final topology.

## Saved artifact checks

The frozen `.blend` and static GLB were reopened in isolated Blender scenes. All four visible meshes matched exported vertex/triangle counts and bounds within `5e-6`; the largest observed bounds difference was `9.313e-10`. The source and reopened GLB had no boundary edges, nonmanifold edges or zero-area triangles under the implemented checks.

The GLB contains 148,364 vertices and 296,720 triangles across the connected body/head, two eyes and flame. It has no animation clips, textures, UV/PBR pass, rig, attacks or game integration. Shape-key results are baked into the static export. The editable source retains keys and hidden rejected experiments. `Bridge_Linear_r06` must remain at value1; its Basis is the rejected curved bridge.

An independent CPU import checked finite coordinates, valid indices, counts, hash and body bounds. Open3D found zero nonadjacent triangle intersections among the 3,381 triangles selected by the documented neck-region AABB test. This does not certify adjacent foldovers, coplanar contact, other body regions, eye/flame contact or deformation quality. The secondary strict-intersection routine received zero candidate pairs and therefore did not add evidence.

The original `reopen.json` scope string overstates a separate finiteness assertion. The executed reopen script checked counts, bounds, edge manifoldness and tessellation; finiteness was checked by the export and independent CPU scripts. The original receipt remains preserved, and the script's wording has been corrected for future use.

Root inspected all eight reopened GLB renders and the matched comparison in the browser. Browser checks decoded all four matched pairs and all eight individual study views at a simulated 412×892 viewport, with no JavaScript errors. Published GLB and `.blend` SHA256 values matched local files. The first check used the older `/devtools/` route and timed out; the verified URL uses `/devtools/pokedex.html`. These checks do not establish device acceptance, layout acceptance or animation playback. No r06 video was rendered.

## Review links

- [Matched head comparison](https://0.taila30dc.ts.net:8445/devtools/experiments.html?pokemon=charizard&a=charizard-whole-r06-intake&b=charizard-whole-r06&view=head-threequarter)
- [Individual study and eight views](https://0.taila30dc.ts.net:8445/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=charizard-whole-r06&view=head-threequarter)

The inspector registry labels both runs `unfinished`. Human reviews were preserved. The Field OS deployment on port8469 did not change during r06. Its restored functionality is browser-green and awaits Kevin's actual S25 acceptance; fullscreen and physical-device polish remain paused. No merge or push.
