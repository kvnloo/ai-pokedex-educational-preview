# Charizard whole-character sculpt

Kevin authorized broad edits after r18. The old protected-vertex constraints slowed visible improvement and preserved weak forms. R18 remains the immutable rollback source. This pass uses actual Blender GUI sculpting, with MCP for scene setup, brush parameters, visibility, export and matched capture. Root/Astra is the sole Blender author.

## Current pass

Private artifacts live in `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r01`.

The GUI work reshapes the jaw underside, removes inherited muzzle relief, establishes a closed lip groove, adds modest orbital rims and nostril recesses, broadens paws and shoulders, and adjusts the tail profile. Native Edit Mode subdivision adds local head resolution. The rest of the character was temporarily hidden during close work and revealed before source/export capture.

This is a working sculpt. It has no oral cavity or teeth, articulated eyelids, deformation retopology, UVs, authored PBR materials, rig or animation. The eyes retain r18's provisional vertex colors. The tail pose, hands and feet still need substantial work. A numerical pass cannot approve these forms.

`charizard-whole-r01.blend` is the authoritative editable checkpoint. The earlier `start`, `shape-a/b/c`, `before-mouth`, `before-subdivision` and `face-e` sources remain available. The source derives directly from r18, not the rejected r19 or unreviewed r20 mouth experiments.

## Authoring and capture

`tools/charizard-whole/cua_stroke.py` sends a mouse stroke only when the owned Blender process and window are focused. Its journal records screen coordinates and the stated brush/view. It is a gesture driver, not a geometry generator or a claim of deterministic sculpt replay. Blender timing, view state and brush state affect replay; use the versioned source for exact recovery.

The session used Grab, Smooth, Crease Sharp and Draw brushes. One Elastic Grab trial affected distant vertices and was undone. An overly strong temporary Shift-Smooth lip pass was also undone. Explicit Smooth brush strength gave better control. The first display-focus attempt targeted the wrong visible window before any sculpt stroke; compositor focus and a pointer-window guard now precede sculpt input.

`tools/charizard-whole/capture.py` runs inside Blender. `capture_mode='prepare'` reveals the complete model, saves the source and exports GLB. `stills` and `turntable` load an independent copy of the frozen r18 source and use identical framing, clay lighting and exposure for both versions. Supplementary face views clip foreground wings for inspection; whole-body views remain unclipped. The capture does not overwrite r18 or update a game deployment.

Pstack's experience-first principle moved this pass from narrow numerical patches to visible form edits. Verification follows the actual sculpt, export and matched views. No merge or push is authorized.

## Review verdict: needs substantial correction

Root inspected the front, side, rear, three-quarter, both face sides and face-front renders. Twelve frames decoded from the actual six-second, 72-frame H.264 turntable were inspected as a contact sheet. This is sampled video inspection, not real-time playback or an animation acceptance claim.

The head surface is smoother and the side mouth separation is clearer. However, the front muzzle is too broad, the lip is swollen and the seam wraps into an exaggerated smile. The rear jaw loses volume too quickly. The whole-character changes are visually minor; the heavy horizontal tail loop remains the largest silhouette problem. Hands, feet, wing roots and neck still need deliberate forms. This candidate is not accepted or deployed.

The export contains 169,915 vertices and 339,818 triangles across four closed, consistently wound meshes. A bounded CPU reopen found 40 exact zero-area body triangles from local subdivision triangulation. The sculpted rims cross the unchanged eyes in 312 and 30 confirmed triangle pairs, with sampled penetrations of 0.000420 and 0.000318. No self-crossings were found in the tested orbital regions. This does not certify the whole body. Geometry cleanup and visual correction remain required.

The two historical `face-wire.png` files are clay renders: Workbench ignored the viewport wire flags. They remain preserved as failed capture evidence and must not be described as wireframes. `gui-face-wire-actual.png` is the inspected actual Blender Edit Mode topology screenshot. A matched baseline topology capture remains outstanding.

Continue in a distinct whole-r02 scene and directory. Preserve r01 and r18. Narrow the muzzle sides while keeping the nose, flatten the front lip, restore jaw-hinge mass and simplify the mouth curve. Then make a substantial tail taper/pose correction and inspect the entire silhouette before detail work. Retopology, UVs, materials, rigging and playable integration remain open.

The inspector now contains `charizard-whole-r01` and `charizard-whole-r01-match-r18`, a camera-matched capture of the unchanged rollback mesh. Human verdict storage was not modified. Phone selection and image decoding work, but a rapid view change can leave the image partly below the dock until scrolling. The strict automatic-visibility check failed and its reports are preserved. Full-size image/video links bypass this inspector limitation. This is separate from the repaired Field OS on 8469, whose deployment remains unchanged.
