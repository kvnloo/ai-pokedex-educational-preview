# Kanto and Johto: reference decisions before Blender

Root inspected the four original first-pair images and four additional images. The complete manifest now pins 21 private images across the eight families. Kanto has a rough r03 study and an unapproved r24 mechanics candidate with a reopened runtime GLB and rendered opening clip. Johto has no Blender source yet. Concept V2/V3 remain distinct families and are not starting shells for the anime devices.

## Kanto

Primary identity is `kanto-open`, the actual Ash anime frame. Preserve its tall left body, blue sensor in a raised red header, three small status lights, stepped header seam, vertical right hinge, white screen surround, lower green display and two thin controls. The right leaf carries the black upper readout, a two-by-five blue keypad, two white keys, lower dark controls and yellow circular key. Four small speaker slots belong in the lower-right white bezel. Do not transfer the newer concepts' central cyan ring or four-button cluster.

The game-style supplemental illustration shows how a stepped right leaf can close below the exposed sensor header. It also adds a D-pad and a large main-body round button that are not present in the visible Ash frame. Those added controls are excluded. The supplemental illustration is an engineering hint, not the primary Ash reference or a verified official asset-generation input.

Use one real vertical book hinge. The right leaf's inner controls must clear the raised screen bezel when closed. The lens/header remains exposed above the stepped leaf. Rear panel relief, clasp, wall thickness, fasteners and unseen bearing internals are not verified by the Ash still; choose conservative construction and label those decisions as authored engineering. Do not borrow the later second-Kanto/AG133 device as rear evidence for the original.

## Johto

`johto-no-data` supplies the missing wider Ash view. It shows the upper lid, stationary LCD, lower control deck, exposed bottom lens and right-opening control flap together. The handbook open/closed artwork corroborates the complete parts arrangement. Archive attribution identifies *The Official Pokémon Handbook 3*; these handbook images are distinct from the anime frames.

Resolve the device as a stationary red body with two moving covers:

- The upper screen protector pivots at the top edge. Its circular tongue projects from the free edge and becomes the large center of the closed Poké Ball motif.
- The lower control flap pivots at the right edge. Its upper semicircular notch accommodates that tongue when closed. The lower arc of the large motif belongs to this flap.
- The bottom blue lens stays visible in both closed and open states. The screen, D-pad, two narrow center controls and two round action keys remain on the stationary body.

The split closed motif, notched flap and protruding upper-lid tongue are visible evidence. The exact pins, latch, cable routing and opening order are engineering inferences. Start the control flap opening before the screen lid so the tongue can clear the notch, then validate the actual solid sweep. No verified video sequence has established that timing yet. The upper protector is a cover, not a second screen.

## Next implementation and evidence

Build each in a new root-authored scene and private revision directory under `devices/pokedex/eras`. Keep input frames unchanged. First render a neutral open/closed silhouette and panel-layout study beside its own source. Record camera parameters and hand/crop occlusion limits; a screenshot's hand is not part of the target silhouette. Reject wrong proportions or control counts before adding surface finish.

Then validate actual wall sections, supported components, hinge clearances and closure. Continue to swappable display materials, authored PBR, the appropriate physical clips, GLB reopening, matched overlays and inspected animation video. Unseen construction can be deliberate and believable without being mislabeled as verified anime detail. Both remain unapproved candidates until Kevin chooses.

## Kanto blockout checkpoint · 2026-09-16

`canonical/devices/generations/kanto-r03-blockout.json` records the root-authored r03 source hash, reference hashes, render paths, and measured geometry. The open front and three-quarter renders were visually inspected against `kanto-open`; the closed front render confirms the leaf hides the main display while leaving the raised sensor header exposed. r01 and r02 remain private rollback iterations. r03 is a rough, color-blocked study only: its stacked panel layout is recognizable, but the shell is still slab-like, the speaker vents and two thin controls are absent, and rear/mechanical clearance has not passed a sweep audit. Do not promote it to an accepted candidate or use it as runtime content.

Reference URLs, local paths, provenance and hashes are in `canonical/devices/generations/era-reference-manifest.json`. `fetch_references.py --verify` checks the exact retained pixels without downloading or changing them.

## Kanto hinge correction · r24

The mid-swing review found the rotating hinge ears intersected the stationary shell. r24 relocates the hinge axis 0.06 units toward the front, compensates the lid children so the closed pose stays in place, reduces the rotating knuckles, and replaces oversized blocks with compact leaf-side ears. Blender's BVH sweep tested 23 rotating meshes against five stationary chassis/display targets at all 108 animation frames and found zero surface intersections. Fixed barrels are intentionally embedded at the chassis edge.

Private artifacts are under `/mnt/zer0models/pokemon-iac/devices/pokedex/eras/kanto/r24/`: `Kanto-r24.blend`, `Kanto-r24.glb`, `Kanto-opening-r24.mp4`, and `opening-storyboard.png`. The manifest records hashes and measurements. Blender reopened the GLB as 46 meshes plus the animated hinge root; the `Kanto-Opening-Z-Hinge` clip spans frames 1–108 at 24 fps. Closed and open frames, intermediate hinge close-ups, and the rendered storyboard were visually inspected. r24 remains a mechanics-review candidate, not Kevin-approved or production-ready: screen content remains placeholder geometry/material, speaker details and final shell surfacing are incomplete, and BootUp/Ready/Idle/button interaction clips and final PBR remain future work.
