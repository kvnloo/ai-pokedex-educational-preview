# Frozen r02e head inspection

The posterior head has **five separable closed surface branches** at Y=-.58 through -.56. This is a geometric count, not a claim that the intended character has five horns. The sixth posterior graph component at those thresholds is the lower region continuing into the neck cut. Reference review must assign anatomical meaning.

Inspected source: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02e/charizard-tail-r02e.glb`. All coordinates below are Blender world coordinates after the glTF node transform and `(x,-z,y)` conversion. IDs are original exported **r02e body POSITION row IDs**, not r02d parent IDs or an assumed Blender import ordering. The body primitive has 122,336 vertices. Full-precision coordinates, source hash and measurements are in `head-inspection.json`.

## Head and neck connectivity

Vertices above Z=.30 form exactly three connected components. The head component nearest (-.06,-.72,.45) contains 9,274 vertices. The two lateral components contain 6,920 and 5,316 vertices and are excluded by connectivity.

The selected head bounds are X[-.254229069,.163510635], Y[-.987682998,-.463777870], Z[.301027477,.602571666]. Its entirely selected triangle mesh has 18,459 faces, Euler characteristic 1, and one 87-edge boundary loop. There are no edges incident to more than two selected faces or inconsistent interior-edge winding. There are 18,633 triangles touching at least one selected head vertex.

The exact plane Z=.30 cuts one closed neck loop. It has 174 crossing source edges/triangles, bounds X[-.059637897,.097292988], Y[-.711819327,-.529725497], and perimeter .528986448. The 87-edge boundary above is the jagged boundary of the vertex-selected triangle mesh; it is different from this interpolated plane cut. Original vertices straddling the cut lie within X[-.060276475,.098249026], Y[-.712910295,-.526983678], Z[.294747084,.302606999].

## Posterior branches

The table describes components of the existing head graph with Y>-.58. Labels refer only to coordinate position. Bounds describe the portion beyond this plane, not the full protrusion or an anatomical attachment.

| Geometric branch | Tip ID | Tip coordinate (X,Y,Z) | Vertices beyond -.58 | X bounds | Z bounds |
| --- | ---: | --- | ---: | --- | --- |
| Long negative-X | 69672 | (-.074669264,-.463777870,.459805459) | 434 | [-.112380058,-.047118697] | [.434285283,.506964982] |
| Positive-X lateral | 88456 | (.145408556,-.546864033,.491245151) | 137 | [.106108949,.163510635] | [.458485335,.510938466] |
| Lower negative-X | 76660 | (-.003929961,-.556247950,.412645906) | 87 | [-.030587686,.009602547] | [.404357105,.453648090] |
| Lower positive-X | 81677 | (.058949415,-.559287727,.420505822) | 74 | [.030151129,.066729702] | [.405680805,.467665374] |
| Upper negative-X | 73224 | (-.043229572,-.559690714,.554124534) | 65 | [-.066951223,-.033111911] | [.532938242,.573885620] |

At Y=-.60 there are three closed plane loops; at -.59 four; at -.58, -.57 and -.56 five; at -.55 two; from -.54 through -.47 one; from -.46 through -.35 none. The head's posterior extent ends at Y=-.463777870. Closed-path section counts omit the open path created where the inspection mesh runs into its neck boundary.

Lowering a posterior threshold reconnects these tips through the following existing mesh vertices. These are exact **graph connection saddles**, not proposed cuts or design boundaries:

| Reconnection | Saddle Y | Original saddle vertex | Saddle X,Z |
| --- | ---: | ---: | --- |
| Lower negative-X to neck-side group | -.585319995880127 | 77285 | .003929961, .404785991 |
| Lower positive-X to that group | -.595876514911652 | 79172 | .027509728, .412645906 |
| Long negative-X and upper negative-X merge | -.638963460922241 | 68980 | -.082529180, .522684813 |
| Their joint group joins the neck-side group | -.639839112758637 | 72283 | -.051089495, .506964982 |
| Positive-X lateral joins the rest | -.687304973602295 | 78051 | .011789883, .506964982 |

Thus the upper and long negative-X protrusions share a short connecting region before joining the central head. Treating every posterior loop as an independent attachment would lose that relationship.

## Reproduction and exact membership

Run `inspect_head.py` with `/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python`. It only reads the frozen GLB and writes audit measurements in this directory.

`head-indices-and-sections.npz` stores full original ID arrays; min/max ID ranges alone are unsuitable because the components' IDs are interleaved. Useful keys include:

- `head_vertex_ids`, `head_wholly_inside_face_ids`, `head_touching_face_ids`.
- `head_neck_crossing_edges_original_vertex_ids`, `head_neck_crossing_face_ids`, `head_induced_boundary_edges_original_vertex_ids`.
- `y_minus0p580_branch_N_vertex_ids` and `y_minus0p580_branch_N_attachment_edge_vertex_ids`: N=0 long negative-X, 1 neck remainder, 2 positive-X lateral, 3 lower negative-X, 4 lower positive-X, 5 upper negative-X.
- `tip_ID_existing_edge_path_to_neck_vertex_ids`: an existing-edge witness path to neck vertex 79121 for each listed tip.

No mesh, target coordinates, anatomical design, or whole-model intersection claim is produced. Saved section points describe intersections with the existing surface only.
