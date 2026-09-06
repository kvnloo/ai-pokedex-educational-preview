# charizard-head-r04 numerical validation

All stated numerical gates pass. This does not approve the remaining posterior surface issue or the anatomy. Rejected head-r03 is not used.

| Version | Body vertices | Body triangles | Local intersection pairs | New against frozen tail-r02e |
| --- | ---: | ---: | ---: | ---: |
| tail-r02e | 122,336 | 244,672 | 1 | 0 |
| head-r01 | 121,305 | 242,610 | 1 | 0 |
| candidate | 122,907 | 245,814 | 1 | 0 |

Every export maps bijectively and exactly to its audit coordinates. Candidate parent IDs preserve all 121,305 r01 vertices exactly once, with 1,602 new rows; the tail IDs match the composed r01 map. The pre-relaxation retained coordinates exactly match r01. There are 2,480 moved rows (878 retained and 1602 new), maximum displacement 0.021332233989. All moved rows are within the 2,480-row movable selection; 0 selected rows remain unchanged. No protected row is selected.

All 113,062 protected source vertices remain exact. All 226,039 oriented protected triangles match frozen tail-r02e and r01, with no missing or added triples. The flame coordinates and triangle arrays match both parents exactly.

The body has 1 component, 0 boundary edges, 0 edges with more than two incident faces, 0 inconsistent interior edges, and 0 triangles with area at most 1e-14. Common r01 triangles show 0 normal reversals, with maximum normal change 75.455046 degrees.

Intersections use exactly the common head bounds from head-r01-validation.json. The candidate has 0 new and 1 retained r01 pairs. Exact pair IDs and bounds are in JSON. Open3D skips shared-vertex pairs; the visible fold can remain despite a passing result. The rest of the model and separate flame/body intersections are not checked.

Against r01, signed volume changes -0.035573250% and surface area changes -0.140547045%. These are geometric measurements, not design acceptance.

Rerun `validate_head_refinement.py` with the Hunyuan Python environment. Optional `--candidate-dir`, `--candidate-file`, and `--output-prefix` support an exact reproduced candidate. The script imports read-only helpers from `validate_head_prune.py` and `inspect_head.py`, and writes audit JSON/Markdown only.
