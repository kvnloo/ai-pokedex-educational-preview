# R07 HOME head study — unfinished

The HOME-derived upper head is a better local starting point than the two illustration-derived heads reviewed here. Its raw lower jaw is inflated. Reducing that depth and adding provisional eyes makes the expression more readable, but the muzzle, horns, lid edges and eye construction remain visibly wrong. Nothing in this milestone is approved as an AAA asset or a finished Pokémon.

Private files live in `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07`. `manifest.json` binds the source, renders, diagnostics and browser evidence by hash. Binary files stay outside Git.

## Review artifacts

- `charizard-home-head-r07-study-repaired.blend`: editable scene, with the visible repaired triangulated head and both closed eye patches. Original shape-key head and rejected trials remain hidden. The repaired head bakes its previous Smooth key.
- `charizard-home-head-r07-study-repaired.glb`: static isolated head study; 24,388 vertices and 48,764 triangles across three meshes. No UV layers, texture images, bones or animation clips.
- `home-head-r07-matched-intake.blend`: original isolated Basis with anatomy keys disabled, under matching cameras and gray material.
- `charizard-head-baseline-comparison-r07-all.blend`: imported HOME, illustration256 and illustration384 sources. All three were reopened and their counts checked.
- `matched-intake/`, `home-lids-repaired-a/`, `reopened-repaired/`: front, near, far and three-quarter material-colored clay renders. Root inspected every view plus `repaired-gui.png` in the actual Blender GUI.

[Phone study](https://0.taila30dc.ts.net:8445/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=charizard-home-head-r07-study&view=head-threequarter) · [Matching before/after](https://0.taila30dc.ts.net:8445/devtools/experiments.html?pokemon=charizard&a=charizard-home-head-r07-intake&b=charizard-home-head-r07-study&view=head-threequarter)

These are the existing developer inspector, separate from the live Field OS game at port 8469. This milestone changes experiment entries and private asset links only. It does not change the deployed game, fullscreen behavior, device shell, human reviews or main branch.

## Construction and failed trials

The earlier HOME mesh used Kevin's selected PokeAPI-hosted HOME sprite. This milestone generates no new mesh or image. Blender MCP isolated and reframed the head, adjusted jaw depth, fitted closed eye patches and lid bands, and performed Boolean operations. Native GUI sculpt strokes softened the jaw and lid joins. The GUI journal distinguishes those strokes from scripted operations.

The first Exact lid union destroyed most of the head and is rejected. The MANIFOLD union preserved the native mesh but produced folded n-gons: triangulation contained 58 identical opposite-winding face pairs. The initial GLB import deleted one face per pair and left 174 nonmanifold edges. The later weld/dissolve trial did not fix it and is also rejected.

The retained repair removes both faces of each zero-thickness pair and 58 unused vertices. It moves no surviving vertex, preserves bounds and signed volume, and leaves the head as one closed component with 42,960 triangles. Reopening the new GLB preserves every triangle with importer vertex merging both enabled and disabled. Unmerged eye primitives have expected material-seam vertex duplication; the merged import is closed. No broader self-intersection or deformation certification is implied.

The matching before/after shows several sequential edits. Eye A and B also used different intermediate head keys; their individual comparison is confounded. Iris C changes face material indices only and does not establish an optical gaze rig.

## Evidence limits and corrections

Read `study-adjudication.json` with the original receipts. It supersedes misleading pending labels while preserving those originals. The frozen failed GLB remains available and must not be confused with the `study-repaired` version.

Raw/imported triangle counts are HOME 729,692/729,684; illustration256 291,280/291,274; illustration384 656,272/656,262. “Unedited” in older records means no post-import edits; the native importer omitted 8, 6 and 10 triangles respectively. Raw source files are unchanged.

The source-density comparison is post-hoc and retains input, seed and pose differences. It is not a controlled experiment. Only Basis reprojection was numerically checked during the approximate frame conversion; the Blender API received all shape keys. The original density probe and several early inline modeling operations do not have complete executable recipe capture. Frozen checkpoints and receipts, rather than an asserted end-to-end replay, are authoritative for those steps. Original executed helper versions are archived alongside the subsequently guarded helpers.

Eight new read-only browser checks cover both comparison entries and all four phone views at 412×892, with zero page errors or write requests. Root inspected the resulting desktop and phone screenshots. These are simulated checks, not acceptance on Kevin's S25.

## Next asset gate

Correct the bulbous nasal silhouette and paired horns against the HOME reference before adding surface detail. Replace the provisional eye patches with anatomically useful eyes/lids, then validate head/body attachment and deformation. Final colors, PBR, UVs, retopology, rig, blinks, locomotion, attacks and playable integration are still outstanding. Physical Pokédex/fullscreen polish remains paused for the existing Field OS device retest.
