# r06 inherited sliver: bounded cleanup

The Open3D pair is **disjoint near-contact**, not a proper crossing. Both independent edge/triangle solves fail to find a hit. The triangles occupy opposite sides of X=-.1532684862613678; their potential contact reduces to vertex 62088 versus edge [62094,62093], separated by .000003320786542 on that plane. Minimum surface clearance is approximately .000001643223582.

All vertex IDs here are **r06 horn-audit.npz `after` row IDs**, independently verified identical to the actual r06 GLB POSITION row order. Use those audit rows or the coordinates below for authoring correspondence. Triangle IDs are **exported GLB triangle rows**, not native Blender polygon IDs.

| Interior audit/export vertex | Existing Blender-world coordinate |
| ---: | --- |
| 62088 | (-.1532684862613678,-.6956043243408203,.4676653742790222) |
| 62094 | (-.1532684862613678,-.6956031322479248,.4676684737205505) |
| 62898 | (-.1532671004533768,-.6956031322479248,.4676653742790222) |

The complete incident neighborhood of those three vertices is a **13-triangle disk**, with three interior vertices and this nine-vertex fixed boundary cycle:

`61243 → 61248 → 62092 → 62093 → 62903 → 62899 → 62894 → 62893 → 62085 → 61243`

Export triangle rows:

`123757, 123765, 123766, 123767, 123768, 125383, 125384, 125385, 125386, 125395, 125396, 125397, 125398`

The original reported pair is triangle 123767 `[62092,62088,61248]` versus triangle 125397 `[62898,62094,62093]`. Triangle 125397 has area 8.858949677e-9 and minimum altitude 1.996865460e-6. The tiny interior cluster contains edges [62088,62898], [62088,62094], and [62898,62094], with lengths 1.827990498e-6, 3.320786542e-6, and 3.395143823e-6. Each edge individually passes the triangle-mesh collapse link condition.

Recommended operation: collapse/weld only the three interior vertices, keeping all nine outer coordinates fixed. Check the complete operation afterward for manifold edge incidence, triangle quality and exact exterior geometry. A threshold near 1e-5 applies only to this explicitly selected cluster; it is not a global merge threshold. No new vertex positions or replacement triangles are proposed here.

All six vertices of the reported pair retain exact frozen tail-r02e coordinates. The posterior skull/neck crease is a separate issue and does not require enlarging this sliver cleanup region.

Rerunnable measurements: `diagnose_remaining_head.py`. Full records and existing ID arrays are in `head-r06-remaining-diagnosis.json` and `head-r06-remaining-indices.npz`.
