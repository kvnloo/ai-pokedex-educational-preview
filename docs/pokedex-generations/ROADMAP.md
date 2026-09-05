# Blender roadmap and review batches

- [x] Read pstack principles; separate shared state and model the actual domain.
- [x] Consume Kevin's addendum; establish root-only Blender ownership.
- [x] Preserve and inspect stopped v2/v3 work, original boards and rejected v001.
- [x] Rebuild v2 and v3 independently from their respective board layouts; replace invalid geometry and mechanical shortcuts. Root r08 is a review candidate, not final approval.
- [x] Render matched closed/open comparisons and transparent overlays, then inspect identity and proportions before polish. See R08-REVIEW.md for remaining differences.
- [x] Author six clips for each concept, export/reopen actual GLBs, inspect both animation videos and all required stills, commit evidence and send the first two-candidate motion review batch.
- [x] Add both inspected candidates to the existing interactive viewer, with live display replacement, physical A interaction, detail comparison and phone landscape framing. Record actual browser, HTTP and compiled-bundle checks.
- [ ] Research and produce Kanto + Johto anime devices.
- [ ] Research and produce Hoenn + Sinnoh anime devices.
- [ ] Research and produce Unova + Kalos anime devices; track the Kalos upgrade separately if selected for scope.
- [ ] Produce Alola Rotom Dex + Journeys Rotom Phone, with expressive/wake/interaction animation instead of invented hinges.
- [ ] Integrate accepted assets into one game collection, era-grant events and candidate selection. Preserve prior unlocks and Kevin's candidate choices.

Each batch ends with a choice-ready comparison on the phone and a Telegram preview. Root continues implementation after delivering a batch, while leaving visual choice with Kevin. No candidate is called approved or perfect from a numeric check alone.

## Required artifact contract, per candidate

Versioned .blend, runtime GLB and optional LODs; exact reference identity and hash; native-crop matched camera parameters; unwarped rendered comparisons/overlays; opening/boot/ready/idle/button clips where physically applicable; rendered and visually played animation video; UV/material/geometry/bounds/clip/GLB-reopen reports; measured triangle/texture/file-size budget; source and artifact hashes; explicit visual differences and status. Put private binaries under `/mnt/zer0models`, with source scripts and manifests/receipts in Git.

## Fidelity gates

1. Match the reference's outline, panel hierarchy, camera aperture placement, screen-to-body ratio, control count, hinge/spine silhouette and color blocking. Resolve contradictory concept views with one coherent mechanism; record the deviation rather than bending the mesh for each camera.
2. Check actual solids and clearances throughout motion. Decorative side rails may preserve the board silhouette but must not masquerade as a second incompatible opening axis. Use one deliberate transverse hinge for these two concepts, with proper bearings and attachment paths.
3. Inspect neutral matched views before adding finish. Keep same-camera snapshots per revision. Worker trace IoU is diagnostic only; it does not measure panel identity, shading or mechanical correctness.
4. Reopen exported GLBs and sample every clip's start, midpoint and endpoint. Verify dimensions, finite transforms, expected rest pose, named controls and power bindings. Do not silently drop a hold clip.
5. Watch the actual rendered sequence. Use emission for breathing, not expansion of solid rings. Phone-shaped props wake and scan; they do not receive fake clamshell animation.

## Progression contract

Ordered eras: Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Journeys. Entering the next era grants its distinct device family; grant events are idempotent. Previously granted families remain in the collection. Kevin's chosen candidate is recorded per family. A new region does not erase previous choices, inventory or research progress. Candidates can be previewed for review without being marked story-unlocked or visually accepted.

The first implementation batch is the two strict concept candidates because their references are already supplied. Era designs require anime-specific images; game Pokédex descriptions must not substitute for Ash's props. Acquisition scenes that cannot be sourced remain an explicit story-design choice until verified.

The eight-family reference baseline is committed in `era-families.json`, `era-reference-manifest.json` and `report-source.md`. None of those era families has a finished Blender asset yet. The next pair is Kanto/Johto. `FIRST-PAIR-MECHANICS.md` records the additional full-cover references, the two-cover Johto mechanism and the remaining authored engineering choices before modeling.
