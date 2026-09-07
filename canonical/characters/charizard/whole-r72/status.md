# R72 connected-wing construction — input failure

Native duplicate and P Selection separated the entire positive-X wing from R67: 45884 vertices, 91559 faces, 207 boundary edges; both bays/rim/root included. Source coordinates matched R56 wing exactly.

Native Properties > Mesh Data > Remesh > Quad > QuadriFlow used 2000 faces, symmetry off, preserve boundary on, seed0. F3 search did not expose this operator. Blender refused input with manifold/consistent-normals warning; no remesh output. BMesh found no wire/overconnected/noncontiguous edges or nonmanifold vertices. Minimum area2.46e-14, edge2.53e-7.

Native Merge by Distance at .0001 removed590 vertices, leaving45294v90383f203boundary, followed by Recalculate Outside. Same QuadriFlow settings refused again. This establishes input failure, not a failed resolution/shape result.

Native temporary cap attempt (boundary selection203, F, CtrlT) generated invalid topology:20 boundary and10 overconnected edges. Saved separately, REJECTED; never sent into remesher. Root cap requires deliberate topology construction; do not assume an arbitrary triangulated cap is valid.

Reopened R67 retained and verified exact live path. All R72 sources preserved privately; nothing promoted. No merge/push.
