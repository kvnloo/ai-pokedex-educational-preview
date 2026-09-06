# Charizard r12 native form pass

Kevin's latest hybrid steer supersedes r11 scripted anatomy. All r12 form changes were native Blender Edit Mode keyboard/mouse operations. bpy handled selection/view alignment, read-only geometry inspection, checkpoints, cameras and export/reopening only.

Retained candidate: `charizard-hybrid-r12c.blend`, physical export `charizard-blockout-r12c.glb`, under `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r12`. Intake, A, B and C sources and twelve fixed-camera renders remain separate. Binary assets stay private; hashes and receipts are in this directory.

A shortens the muzzle; B tapers its vertical profile; C widens the lower neck. Each pass was rendered and visually inspected from front, side, rear and three-quarter. See critique.json for limitations. Native delta audit confirms only head (16 vertices) and neck (42 off-center vertices) changed; all 36 other source mesh coordinates stayed unchanged. The head object transform stayed unchanged.

Source and GLB reopened. Physical export: 36 meshes, 2,716 control vertices, 6,696 evaluated triangles; no per-part nonmanifold edges or degenerate triangles. Modifier application is explicit. Reimported per-part triangle counts, bounds and socket transform match. This is not a passed intersection or likeness audit. No textures, UVs or clips. FlameSocket is the sole meshless exported node, has no children, and energyBaked=false. Runtime flame still needs implementation.

One owned Blender (PID4106097), requested xhigh; no new mesh lane, max pass, website deployment, merge or push. Kevin remains the production visual gate. Coarse joins, face likeness, wing roots and stance remain unresolved.
