# Kanto and Johto: reference decisions before Blender

Root inspected the four original first-pair images and four additional images. The complete manifest now pins 21 private images across the eight families. These notes specify the next Blender pair; no Kanto or Johto source/GLB has been built yet. Concept V2/V3 remain distinct families and are not starting shells for the anime devices.

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

Reference URLs, local paths, provenance and hashes are in `canonical/devices/generations/era-reference-manifest.json`. `fetch_references.py --verify` checks the exact retained pixels without downloading or changing them.
