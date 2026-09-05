# r02e topology cleanup validation

All stated numerical checks pass.

| Candidate | Body vertices | Body triangles | Local intersections | Signed-volume change against r02a |
| --- | --- | --- | --- | --- |
| r02a | 122377 | 244754 | 2 | 0.0000000% |
| r02d | 122377 | 244754 | 12 | 0.0054662% |
| r02e | 122336 | 244672 | 0 | 0.0050367% |

The exported r02e GLB contains exactly one scene and two mesh nodes. Its reduced vertex rows map bijectively to the topology audit with maximum error zero. The parent_vertex_ids map then confirms that every retained coordinate is exactly its r02d source coordinate. The removed-vertex complement contains exactly 41 IDs. Retained parent polygon IDs and the 61 removed polygon IDs form the original polygon set, with 27 new polygons marked -1.

All 112475 zero-weight r02a vertices remain present and exact. Their 224371 oriented exported triangle triples are unchanged. Flame world coordinates and triangle arrays are identical to r02d. Body and flame topology metrics are in JSON; the body has one connected component, consistent winding, no boundary or excess-incidence edges, and no tested repeated-index or degenerate triangles.

The actual native-patch.json receipt identifies all 27 new triangles by parent vertex IDs. All 27 occur in the GLB with the same orientation. Four reproduce old triangle triples exactly, explaining why canonical comparison sees only 105 removed and 23 added triples. Including those four recreated faces restores the complete 109-triangle removed patch and its 29-vertex boundary. The 27 replacement triangles use exactly that unchanged boundary, their boundary edges match, and their Euler characteristic is 1. No retained positions moved. Signed volume changes -0.000429480 percent relative to r02d.

The intersection test uses exactly the saved wider-root bounds from r02d-validation.json, so the pair comparison remains consistent. r02a has two old source-region pairs and r02d has twelve new collar pairs. r02e reports 0 pairs in the same region. Open3D numerical and shared-vertex limitations apply. No whole-model or separate flame/body intersection freedom is claimed.

Rerun validate_strip_cleanup.py with the Hunyuan Python environment. It reads the frozen GLBs, NPZ correspondence and native-patch.json, then writes diagnosis JSON and Markdown only. Use --candidate-dir and --output-prefix to validate a reproduced r02e directory. No Blender calls or geometry authoring occur.
