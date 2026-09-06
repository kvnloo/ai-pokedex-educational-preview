# Charizard r13 native head study

Current provisional candidate is `charizard-hybrid-r13i-head-turn.blend`, with `charizard-blockout-r13i.glb`, under `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r13`. F and H preserve alternative poses. This remains a coarse blockout. Likeness and production acceptance are RED.

All form and pose changes used native Blender keyboard/mouse. bpy handled view setup, read-only inspection, saving, rendering and export/reopening. One owned Blender, requested xhigh. No scripted anatomy, max checkpoint, other mesh lane, website deployment, merge or push.

Retained changes raise the nose, narrow the bridge while retaining the cheeks, and introduce a coarse inset socket around the existing eye placeholders. Two eye placements and a socket-edge collapse were rejected. The head, neck, eyes and horns remain independently editable; their group turns toward the HOME reference in H and I. I has a head yaw of -63 degrees, versus -18 in F. This is a pose study, not calibrated camera matching.

Each A–I change has front, side, rear and three-quarter source renders. The first G captures preceded completion of a native menu operation; only `r13g-ready-*` represent the completed rejected trial. G was reverted by reopening F. F, H and I have actual GLB reimports, geometry checks and four-camera reopened renders. All four I source and GLB views were visually inspected. Their silhouettes and component placement agree; images are not pixel-identical.

I exports 38 mesh components, 3,176 control vertices and 7,704 evaluated triangles. Per-part evaluated nonmanifold-edge and degenerate-triangle checks pass. Exported per-part bounds and triangle counts match reimport. Only the head mesh data changed against intake; 37 other mesh coordinate arrays remain unchanged. Eye transforms and the six-component pose group changed. Head cage is 56 vertices and 50 polygons, with subdivision level 1. See the scope audit and validation reports.

FlameSocket remains an empty parented to the physical tail, with no children or geometry, display size 0.035 and energyBaked=false. Runtime flame is not implemented. No textures, UVs, rig or animation clips. Component intersections remain intentional construction overlaps, not a passed intersection audit.

The muzzle still lacks a convincing mouth/jaw structure, the eyes lack Charizard's expression, and the neck/chest seam is visible. Wing roots, hand construction and stance remain coarse. Next work should address jaw/cheek volume and the head/neck transition before further eye nudges or detail. Kevin remains the visual gate before production texture, rig and animation work.

Official reference provenance is inherited from `../whole-r11/references.json`. HOME was open beside the model; fixed scene cameras provide consistent comparisons. Exact orthographic official side/rear references are unavailable, so no measured side/rear fidelity score is claimed. Private binary sources, rejected candidates and renders are hashed in `manifest.json`; no previous checkpoints were overwritten.
