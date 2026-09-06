"""Cut only the inherited r03 head at the measured closed neck section."""
import bpy
import bmesh
import json
from mathutils import Vector
from pathlib import Path

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-r04' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r04')
report_path = root / 'audit/neck-cut-result.json'
assert not report_path.exists()
body = bpy.data.objects['GEO-charizard-body-whole-r04']
assert len(body.data.vertices) == 159251
assert body.data.users == 1, 'Body mesh must be exclusive to the editable scene'
assert body.matrix_world == body.matrix_world.Identity(4)
origin = Vector((-.085, -.77, .49))
side = Vector((-.8660254, .5, 0))
forward = Vector((-.49446818, -.856444, .14834046))
up = Vector((.07417023, .12846661, .98893636))
cut_up = -.14
bm = bmesh.new()
bm.from_mesh(body.data)
assert not any(e.is_boundary for e in bm.edges)
before = {'vertices': len(bm.verts), 'faces': len(bm.faces)}
seed = min(bm.verts, key=lambda v: (v.co-(origin+forward*.12+up*.02)).length_squared)
assert (seed.co-origin).dot(up) > cut_up
head = set()
pending = [seed]
while pending:
    vertex = pending.pop()
    if vertex in head or (vertex.co-origin).dot(up) <= cut_up:
        continue
    head.add(vertex)
    pending.extend(e.other_vert(vertex) for e in vertex.link_edges)
# Include the crossing faces' below-plane vertices, without traversing the body.
selected = head | {v for vertex in head for f in vertex.link_faces for v in f.verts}
geometry = list(selected)
geometry += [e for e in bm.edges if all(v in selected for v in e.verts)]
geometry += [f for f in bm.faces if all(v in selected for v in f.verts)]
bmesh.ops.bisect_plane(bm, geom=geometry, dist=.0000001,
                      plane_co=origin+up*cut_up, plane_no=up,
                      clear_outer=True, clear_inner=False)
boundary = [e for e in bm.edges if e.is_boundary]
assert boundary, 'Expected one new neck boundary'
vertices = {v for e in boundary for v in e.verts}
assert all(sum(e.is_boundary for e in v.link_edges) == 2 for v in vertices)
assert all(abs((v.co-origin).dot(up)-cut_up) < .00001 for v in vertices)
visited = set()
pending = [next(iter(vertices))]
while pending:
    vertex = pending.pop()
    if vertex in visited:
        continue
    visited.add(vertex)
    pending.extend(e.other_vert(vertex) for e in vertex.link_edges if e.is_boundary)
assert visited == vertices, 'Cut produced multiple loops; source mesh remains untouched'
caps = bmesh.ops.holes_fill(bm, edges=boundary, sides=0)['faces']
assert len(caps) == 1
bmesh.ops.triangulate(bm, faces=caps)
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
assert all(e.is_manifold for e in bm.edges)
after = {'vertices': len(bm.verts), 'faces': len(bm.faces)}
assert before['vertices'] - after['vertices'] > 20000
bm.to_mesh(body.data)
bm.free()
body.data.update()
body.hide_set(False)
body['r04_neck_cut_up'] = cut_up
report = {'source': 'whole-r03', 'object': body.name, 'headUp': cut_up,
          'region': 'Connected vertices above neck plane, seeded near the nose, plus crossing face neighbors',
          'abovePlaneHeadVertices': len(head), 'before': before,
          'after': after, 'boundaryVertices': len(vertices), 'closedNeckLoops': 1,
          'manifoldEdges': True, 'scope': 'Cut and capped inherited head only; no head attachment or deformation topology claim.'}
report_path.write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
