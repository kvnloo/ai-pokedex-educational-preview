# Head-r07 sliver cleanup validation

All stated numerical gates pass.

The actual export has 122,631 vertices and 245,262 triangles. Every retained r06 coordinate remains exact. The two removed parent rows are exactly 62094 and 62898, welded to existing row 62088. All 113,062 protected vertices and 226,039 oriented protected triangles remain exact; r06's frozen-source ancestry receipt and GLB hash are unchanged. The flame is exact.

The original 13-triangle disk becomes a 9-triangle disk. All nine boundary vertices retain their coordinates, and all 245,253 exterior oriented triangles remain exact. Actual exported replacement triangles match the declared weld precisely; their export IDs and r06 parent triples are in JSON. Minimum patch area improves from 2.95084150786e-12 to 1.62293961016e-05.

The body remains one closed, consistently wound component with no tested degenerate or duplicate triangles. The common local head test reports 1 r06 detector pair and 0 r07 pairs. The old detection was independently shown to be a disjoint near-contact/sliver; no actual-crossing repair is claimed. Signed volume changes 1.42079681353e-09%.

The skull/neck crease and unfinished face are outside this edit. Local detector coverage does not certify whole-model intersection freedom or anatomical correctness.

Rerun `validate_sliver_cleanup.py` with the Hunyuan Python environment. Optional `--candidate-dir`, `--candidate-file`, and `--output-prefix` support an exact replay. It reads existing artifacts and writes audit JSON/Markdown only.
