# Head-r06 horn export validation

All stated numerical gates pass. This is not anatomical or visual approval of the remaining skull divot or unfinished face.

All 121,866 retained r05 coordinates remain exact. The export maps bijectively to all 122,633 audit rows. All 113,062 protected frozen-source vertices and 226,039 oriented protected triangles remain exact; flame coordinates and triangles match frozen tail-r02e and r05. The body has 245,266 triangles, one connected component, 0 boundary edges, 0 excess-incidence edges, 0 inconsistent interior edges, and 0 tested degenerate triangles.

| Horn | Root vertices | Rings including root | New vertices | Patch triangles | Tip audit row | Tip valence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| negative-x | 25 | 16 | 376 | 775 | 83302 | 25 |
| positive-x | 26 | 16 | 391 | 806 | 68682 | 26 |

For each horn, the root's parent IDs and coordinates exactly match its r05 receipt. Every ring is an actual closed edge cycle. The patch's only boundary is that root cycle; its Euler characteristic is one. Each consecutive ring band has the expected triangles, and the last ring joins a single real tip vertex with one triangle per ring edge. The 767 new vertices belong exactly to these two lofts. All matched generatrices advance toward the tip, and mean radial extent decreases through the rings; these measurements do not impose circular anatomy.

Canonical exported comparison finds 2,129 removed and 1,581 new triangles. The deleted patches' boundary edges match the two unchanged root rings exactly; all created triangles belong to the declared lofts.

The common head AABB contains all removed and new horn vertices. Open3D finds 1 candidate pair, including 0 new and 1 retained r05 pairs. Exact pair identities and bounds are in JSON. The additional shared-tip test examines 625 final fan pairs and detects 0 overlaps. Other shared-vertex configurations, the rest of the model and separate flame/body intersections are outside these checks.

Against r05, signed volume changes -0.101100895% and surface area changes -0.355222182%.

Rerun `validate_horn_replacement.py` with the Hunyuan Python environment. Optional `--candidate-dir`, `--candidate-file`, and `--output-prefix` support an exact replay. It imports read-only helpers from `validate_head_prune.py` and `inspect_head.py`; no Blender calls or geometry authoring occur.
