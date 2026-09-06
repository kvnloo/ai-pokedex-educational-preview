# Charizard whole-character sculpt

Kevin authorized broad edits after r18. The old protected-vertex constraints slowed visible improvement and preserved weak forms. R18 remains the immutable rollback source. This pass uses actual Blender GUI sculpting, with MCP for scene setup, brush parameters, visibility, export and matched capture. Root/Astra is the sole Blender author.

## Current checkpoint: r03, still a working sculpt

The retained source is `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r03/charizard-whole-r03.blend`, with a sibling GLB. It keeps r02's shorter, reposed tail and triangulation cleanup while restoring the entire r01 face. R02 remains selectable as a failed facial trial. Neither is a final character or a runtime promotion.

Actual GUI work used a masked Pose/Grab/Smooth sequence, a broad Elastic Grab, then native proportional cross-section scales, terminal shortening/rotation, and a 30% reduction of the rear/lateral tail sweep. The late downward Pose and strong Deflate trial produced a hook and folds; their source was preserved and coordinates rolled back before the retained transforms. The tail path now reads more clearly, though its terminal bend is abrupt and the stem/flame still need rebuilding.

Matched front and side renders rejected r02's facial edits: the muzzle narrowed but developed pinching, radial wrinkles and uneven jaw thickness. R03 restores 16,799 selected face rows exactly to r01; 16,798 changed and one was already at its target. This is an explicit rollback, not a successful new face sculpt. Next work should establish a clean wedge-shaped muzzle, mouth and jaw using deliberate topology and the official references, before hands/feet/wings or surface detail. Repeating broad compression of the inherited lip failed this comparison.

Native GUI Triangulate Faces corrected 33 subdivision-boundary quads without moving vertices. Both exports have 169,915 vertices and 339,818 triangles across four finite, closed, consistently wound single-component meshes, with zero zero-area triangles. A bounded 85,611-triangle tail test found no confirmed tail self-crossings or tail-to-body contact pairs. Four detector candidates had positive gaps of 0.000015–0.000030. Shared-vertex foldovers and other body regions are outside that check. The exact tail test region transfers from r02 to r03; the face rollback did not alter it. Earlier shallow eye/body overlaps are not certified away by this tail check.

Both `.blend` sources were loaded again and both GLBs imported in isolated Blender scenes. Mesh counts, finite coordinates and world bounds matched; imported three-quarter renders were inspected. The initial reopen check read an unevaluated library scene's flame transform; activating and evaluating that scene corrected the measurement, without editing the files. Each comparison video is H.264, 640×1280, 12 fps, 72 frames/six seconds. Root inspected 12 decoded frames from each actual MP4, not continuous real-time playback. These are camera turntables, not character animation clips.

There are no UV layers, authored PBR materials, texture images, rig bones or animation clips. The source remains dense sculpt geometry. The official-source ancestry is unchanged; no new image or mesh generation was used. Source, GLB, intermediate/failed scenes, coordinates, images and videos stay in the private asset tree. Git retains the scripts, gesture journal, audit evidence and hash manifests under `canonical/characters/charizard/whole-r02` and `whole-r03`.

The experiment inspector contains `charizard-whole-r02`, `charizard-whole-r03`, and `charizard-whole-r03-match-r01`. All eight shared views decoded for both candidates; the served r03 MP4 matches local bytes. Phone image availability was checked at 412×915, without claiming layout or real-device acceptance. Direct video is the better phone preview. The registrar serializes its own writes, uses unique temporary files and checks for unrelated registry changes before replacement. Human reviews and the repaired Field OS deployment on 8469 were not changed. No merge or push.

Use `capture_revision='r02'` or `'r03'` with `capture.py`, `encode_comparison.py --revision r03`, `verify_reopen.py`, `register_tail_candidates.py`, and `verify_tail_inspector.mjs`. Frozen source creation refuses existing checkpoint paths. R03 compares against r01 while recording r02 as its source parent.

## Earlier r01 pass

Private artifacts live in `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r01`.

The GUI work reshapes the jaw underside, removes inherited muzzle relief, establishes a closed lip groove, adds modest orbital rims and nostril recesses, broadens paws and shoulders, and adjusts the tail profile. Native Edit Mode subdivision adds local head resolution. The rest of the character was temporarily hidden during close work and revealed before source/export capture.

This is a working sculpt. It has no oral cavity or teeth, articulated eyelids, deformation retopology, UVs, authored PBR materials, rig or animation. The eyes retain r18's provisional vertex colors. The tail pose, hands and feet still need substantial work. A numerical pass cannot approve these forms.

`charizard-whole-r01.blend` is the authoritative editable checkpoint. The earlier `start`, `shape-a/b/c`, `before-mouth`, `before-subdivision` and `face-e` sources remain available. The source derives directly from r18, not the rejected r19 or unreviewed r20 mouth experiments.

## Authoring and capture

`tools/charizard-whole/cua_stroke.py` sends a mouse stroke only when the owned Blender process and window are focused. Its journal records screen coordinates and the stated brush/view. It is a gesture driver, not a geometry generator or a claim of deterministic sculpt replay. Blender timing, view state and brush state affect replay; use the versioned source for exact recovery.

The session used Grab, Smooth, Crease Sharp and Draw brushes. One Elastic Grab trial affected distant vertices and was undone. An overly strong temporary Shift-Smooth lip pass was also undone. Explicit Smooth brush strength gave better control. The first display-focus attempt targeted the wrong visible window before any sculpt stroke; compositor focus and a pointer-window guard now precede sculpt input.

`tools/charizard-whole/capture.py` runs inside Blender. `capture_mode='prepare'` reveals the complete model, saves the source and exports GLB. For r01, `stills` and `turntable` load an independent copy of the frozen r18 source and use identical framing, clay lighting and exposure for both versions. Supplementary face views clip foreground wings for inspection; whole-body views remain unclipped. The capture does not overwrite r18 or update a game deployment.

Pstack's experience-first principle moved this pass from narrow numerical patches to visible form edits. Verification follows the actual sculpt, export and matched views. No merge or push is authorized.

## Review verdict: needs substantial correction

Root inspected the front, side, rear, three-quarter, both face sides and face-front renders. Twelve frames decoded from the actual six-second, 72-frame H.264 turntable were inspected as a contact sheet. This is sampled video inspection, not real-time playback or an animation acceptance claim.

The head surface is smoother and the side mouth separation is clearer. However, the front muzzle is too broad, the lip is swollen and the seam wraps into an exaggerated smile. The rear jaw loses volume too quickly. The whole-character changes are visually minor; the heavy horizontal tail loop remains the largest silhouette problem. Hands, feet, wing roots and neck still need deliberate forms. This candidate is not accepted or deployed.

The export contains 169,915 vertices and 339,818 triangles across four closed, consistently wound meshes. A bounded CPU reopen found 40 exact zero-area body triangles from local subdivision triangulation. The sculpted rims cross the unchanged eyes in 312 and 30 confirmed triangle pairs, with sampled penetrations of 0.000420 and 0.000318. No self-crossings were found in the tested orbital regions. This does not certify the whole body. Geometry cleanup and visual correction remain required.

The two historical `face-wire.png` files are clay renders: Workbench ignored the viewport wire flags. They remain preserved as failed capture evidence and must not be described as wireframes. `gui-face-wire-actual.png` is the inspected actual Blender Edit Mode topology screenshot. A matched baseline topology capture remains outstanding.

The subsequent r02 pass attempted muzzle narrowing, lip flattening, jaw-hinge changes and tail reshaping. Its face regression and the retained tail work are documented above. Retopology, UVs, materials, rigging and playable integration remain open.

The inspector now contains `charizard-whole-r01` and `charizard-whole-r01-match-r18`, a camera-matched capture of the unchanged rollback mesh. Human verdict storage was not modified. Phone selection and image decoding work, but a rapid view change can leave the image partly below the dock until scrolling. The strict automatic-visibility check failed and its reports are preserved. Full-size image/video links bypass this inspector limitation. This is separate from the repaired Field OS on 8469, whose deployment remains unchanged.
