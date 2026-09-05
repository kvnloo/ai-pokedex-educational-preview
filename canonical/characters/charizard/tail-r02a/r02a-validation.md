# Export audit of Charizard tail r02a

All stated numerical acceptance checks passed. This is a geometry audit, not anatomical or artistic acceptance.

The GLB has one scene and exactly two mesh nodes. Both meshes have consistent winding, no repeated-index triangles and no triangles with area at most 1e-14. Their exact coordinates are unique within each mesh. The original official source and frozen r01 SHA256 values match the earlier audit.

| Mesh | Vertices | Triangles | Components | Boundary edges | Edges with more than two faces | Zero-area triangles |
| --- | --- | --- | --- | --- | --- | --- |
| GEO-charizard-flame-reference-r02a | 4516 | 9028 | 1 | 0 | 0 | 0 |
| GEO-charizard-body-tail-r02a | 122377 | 244754 | 1 | 0 | 0 | 0 |

The saved vertex-audit.npz rows map bijectively to each corresponding GLB with maximum coordinate error 0. Exactly 1585 stable vertex IDs moved, and those IDs match patch-receipt.json. The remaining 120792 rows stayed exact. This includes all 106843 original-source rows and all 317 attachment rows. Maximum displacement among changed rows is 0.038242071 Blender world units.

All 240950 triangles with no changed vertices preserve their stable vertex-ID triples. All 214005 source-side triangles are preserved. The flattened Blender polygon vertex-index arrays are identical. Only 2 old and 2 new triangle triples differ inside the changed region, consistent with one changed quad diagonal during GLB triangulation. The flame's world coordinates and face arrays are identical to r01.

| Exported triangle measurement | r01 | r02a |
| --- | --- | --- |
| First generated ring minimum Y | 0.147940919 | 0.174844697 |
| First-ring vertices behind Y=.15 | 29 | 0 |
| Seam face angle median | 7.163 degrees | 1.486 degrees |
| Seam face angle p90 | 84.044 degrees | 2.997 degrees |
| Seam face angle maximum | 164.878 degrees | 4.556 degrees |
| Seam face pairs above 90 degrees | 31 | 0 |
| Low-left section loops at Y=.149 | 2 | 1 |

These seam angles use exported triangle face normals. The patch receipt measures BMesh polygon normals and uses an integer-index percentile. Those are different measurements; the GLB values describe the delivered triangulated geometry.

Open3D 0.19.0 tested 5760 triangles per version inside the common changed-region AABB. It found 1 intersecting pair in r01 and 0 in r02a. The r01 pair uses exported face IDs [[6157, 9207]]. AABB selection includes any triangle that could intersect a changed triangle, but the detector has numerical and shared-vertex limitations. This does not establish whole-model self-intersection freedom, including intersections with the separate flame mesh.

Rerun with the Hunyuan Python environment, which provides numpy, trimesh, scipy and Open3D.

```sh
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/audit/validate_tail_patch.py
```

The script only reads the GLBs, receipt and vertex audit, then writes diagnosis JSON and Markdown. Use --candidate-dir and --output-prefix for a separately reproduced candidate. No Blender calls or asset changes occur.
