# r10 component intake and native jaw comparison

Kevin's operating law is recorded in ../OPERATING-LAW.md. Default requested effort is xhigh, with max reserved for the bounded final audit. The app accepted an xhigh continuation request; this does not prove that the already-running turn changed effort.

## Source and result

Private binaries are under `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r10`.

- `charizard-components-r10-intake.blend` and `.glb`: frozen component intake, unchanged r09 form.
- `charizard-components-r10-jaw-trial.blend`: two native Grab strokes, preserved for comparison.
- `charizard-components-r10-jaw-smooth-trial.blend` and `.glb`: subsequent native smoothing, unapproved comparison candidate.
- `charizard-components-r10-recovery-full.blend`: full recovery checkpoint before historical scene copies were stripped from the working copy. Historical source files remain intact.

The compact source is about 17 MB. Head/neck has 25,671 vertices and 50,998 triangles. Body remainder has 320,190 vertices and 640,036 triangles. Total is 691,034 triangles, a dense form study, not an optimized runtime asset. Each component has 342 deliberately open, exactly matching neck boundary edges. No other non-manifold edges were found. The neck ring must be joined during deformation topology work. Wing membranes and spars are not separated yet.

The split preserved every original coordinate and introduced only the 342 cut-ring points. Native jaw work moved 4,857 head vertices after smoothing, with maximum displacement 0.05220091 scene units and zero neck-ring displacement. No scripted anatomy edits were used. The lower jaw is less swollen, but the cheek/throat transition and mouth expression need further work. The candidate does not pass likeness or production gates.

## Verification and limits

Both compact intake and smoothed candidate sources were reopened in owned Blender. Their GLBs were exported with active-scene selection and reopened. Mesh counts, triangle counts, dimensions, intentional boundaries, socket parent/position/orientation and `energyBaked=false` were checked. `FlameSocket` remains a runtime effect anchor; no flame geometry was added. There are no UVs, materials, textures, rigs or animation clips.

Root inspected fixed front/side/three-quarter head comparisons and four whole-body views, plus the actual GUI with official HOME reference. Fixed mesh comparison cameras are not calibrated official-art overlays. No S+ claim. No publication, merge or push. Kevin's visual acceptance remains required before production textures, rigging or animation.

Blender crashed during a component-only `libraries.write`. The cause is not established. The r09 source hash remained unchanged; one replacement owned Blender recovered the split and saved with `wm.save_as_mainfile`. The compact sources and GLBs subsequently reopened successfully. See manifest and receipts for exact files and hashes.
