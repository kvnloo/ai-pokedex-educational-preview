All stated numerical gates pass.

The actual r15 export has 121,603 body vertices and 243,206 triangles. All three export/NPZ mappings are bijective. Fairing moves 289 declared new grid vertices; maximum displacement is 0.0245344278. Every retained r07 coordinate, the 72 fixed boundary vertices, and all 242,558 exterior oriented triangles remain exact. The r07→r14→r15 receipt chain is checked independently.

All 113,062 frozen tail-r02e protected vertices and 226,039 oriented protected triangles are compared directly with the frozen GLB. Both horns, root rings, all their incident triangles, and the flame remain exact.

The replacement is a 361-vertex, 648-triangle disk with 289 interior vertices and one 72-edge boundary. One boundary-only triangle is recreated exactly from r07; patch selection cuts the actual 72 boundary edges and flood-fills the interior, so this triangle remains included. Triangle-set difference alone would incorrectly describe 647 new triangles and a 71-edge boundary. R15 preserves r14's oriented topology. The body remains one closed, consistently wound component with no repeated-index or duplicate oriented triangles, no triangle area at or below 1e-14, and no edges with more than two incident faces.

| Patch quality | r14 | r15 |
| --- | ---: | ---: |
| Minimum triangle area | 5.32068176e-06 | 3.10692914e-06 |
| Minimum triangle angle | 9.25022° | 4.93197° |
| Interior adjacent-normal angle p90 | 20.121° | 9.16558° |
| Boundary adjacent-normal angle p90 | 44.8739° | 6.10913° |

The common expanded head test finds 0 / 0 / 0 Open3D pairs in r07/r14/r15. The supplement testing triangle pairs sharing patch vertices finds 0 r15 overlaps. Signed body volume changes 0.00490993328% against r07.

These are local numerical checks, without whole-model intersection or anatomical certification. Stable vertex IDs in JSON are r07 audit rows, with distinct diagnostic IDs for new grid vertices; face indices identify actual export triangles, never native Blender polygon IDs. Rerun `validate_divot_fairing.py` with the Hunyuan Python environment. Optional `--grid-dir` and `--candidate-dir` allow fresh replay inputs; reports stay in this private audit folder.
