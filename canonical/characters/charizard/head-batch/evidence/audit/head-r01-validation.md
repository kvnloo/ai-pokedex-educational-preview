# Head pruning export validation

All stated numerical gates pass.

The candidate has 121,305 body vertices and 242,610 triangles. Export coordinates map bijectively and exactly to the audit arrays. All 121,303 retained source coordinates remain exact. The 113,062 protected vertices have 0.0 maximum displacement; protected oriented triangles total 226,039 before and 226,039 after, with 0 missing and 0 added. The flame's world coordinates and triangle arrays are exact.

Canonical comparison finds 2,217 removed and 155 added triangles. The receipt's 155 new cap triangles are checked with orientation against the actual export. Its two fan patches have 66 and 89 boundary vertices. Their exact boundary membership and Euler characteristics are recorded in JSON. Body component count is 1, boundary-edge count 0, excess-incidence edge count 0, inconsistent interior-edge winding count 0, and tested degenerate triangle count 0.

The common expanded head AABB is [[-0.28422906875610354, -1.0176829981803894, 0.2710274767875671], [0.19351063549518585, -0.43377786993980405, 0.6325716662406922]]. Open3D finds 1 source pairs and 1 candidate pairs, including 0 new and 1 retained source pairs. Exact export face IDs, stable triangle triples and triangle bounds are in JSON. An additional shared-center test covers 6061 fan-triangle pairs skipped by Open3D and reports 0 overlaps. Other shared-vertex configurations, the remainder of the body and separate flame/body intersections are outside these gates. This does not certify whole-model intersection freedom.

Signed volume changes -0.161460479 percent; surface area changes -0.408568626 percent. These describe the removed geometry and caps, not anatomical correctness.

| Y plane | Source closed loops | Candidate closed loops | Source graph components | Candidate graph components |
| --- | ---: | ---: | ---: | ---: |
| -0.60 | 3 | 2 | 4 | 3 |
| -0.59 | 4 | 2 | 5 | 3 |
| -0.58 | 5 | 2 | 6 | 3 |
| -0.57 | 5 | 2 | 6 | 3 |
| -0.56 | 5 | 2 | 6 | 3 |
| -0.55 | 2 | 2 | 3 | 3 |
| -0.54 | 1 | 1 | 2 | 2 |
| -0.47 | 1 | 1 | 1 | 1 |
| -0.46 | 0 | 0 | 0 | 0 |
| -0.35 | 0 | 0 | 0 | 0 |

The extra graph component is the neck remainder. Five-to-two closed loops at -.58, -.57 and -.56 test geometric branch reduction only.

Rerun `validate_head_prune.py` with the Hunyuan Python environment. It accepts `--candidate-dir`, `--candidate-file` and `--output-prefix`, reads existing GLB/NPZ/JSON files, and writes only audit JSON/Markdown. It imports existing measurement helpers from `inspect_head.py`. No Blender calls or geometry authoring occur.
