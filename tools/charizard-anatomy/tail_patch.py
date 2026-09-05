import bpy
import bmesh
import json
import math
import numpy as np
from pathlib import Path
from mathutils import Vector

OUT = Path(globals().get('output_directory', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02a'))
OUT.mkdir(parents=True, exist_ok=True)
source = bpy.data.objects['GEO-charizard-body-tail-r01']
target = bpy.data.objects['GEO-charizard-body-tail-r02a']
assert len(source.data.vertices) == 122377
assert not (OUT / 'patch-receipt.json').exists(), 'Preserve the previous candidate before another iteration'

bm = bmesh.new()
bm.from_mesh(source.data)
bm.verts.ensure_lookup_table()
bm.normal_update()
seam = {v for v in bm.verts if abs(v.co.y - .15) < 1e-5 and v.co.z < -.2}
assert len(seam) == 317
seam_edges = [e for e in bm.edges if all(v in seam for v in e.verts)]
assert len(seam_edges) == 317

# Parent coordinates distinguish source-side faces even where new rings fold
# behind the cut plane. A coordinate inequality cannot make that distinction.
raw_scene = bpy.data.scenes['FAIR-charizard-official-61062-o256']
key = lambda co: tuple(round(float(x), 6) for x in co)
raw = {key(o.matrix_world @ v.co) for o in raw_scene.objects if o.type == 'MESH' for v in o.data.vertices}
protected = {v for v in bm.verts if key(v.co) in raw}
assert len(protected) == 106843, len(protected)
source_side = protected | seam
root = [min(seam, key=lambda v: v.index)]
while len(root) < len(seam):
    candidates = [e.other_vert(root[-1]) for e in root[-1].link_edges if e.other_vert(root[-1]) in seam and e.other_vert(root[-1]) not in root]
    assert candidates
    root.append(min(candidates, key=lambda v: v.index))
assert any(e.other_vert(root[-1]) == root[0] for e in root[-1].link_edges)

rings = [root]
visited = set(source_side)
for _ in range(9):
    ring = []
    for v in rings[-1]:
        candidates = [e.other_vert(v) for e in v.link_edges if e.other_vert(v) not in visited]
        assert len(candidates) == 1, (v.index, len(candidates))
        ring.append(candidates[0])
    assert len(set(ring)) == 317
    rings.append(ring)
    visited.update(ring)

before = [v.co.copy() for v in bm.verts]
span = 6
clamped = 0
for k, vertex in enumerate(root):
    normal = Vector()
    for face in vertex.link_faces:
        if all(v in source_side for v in face.verts):
            normal += face.normal * face.calc_area()
    assert normal.length > 1e-12
    around = root[(k + 1) % len(root)].co - root[k - 1].co
    tangent = around.cross(normal.normalized()).normalized()
    if tangent.y < 0:
        tangent.negate()
    start = vertex.co.copy()
    end = rings[span][k].co.copy()
    advance = end.y - start.y
    assert advance > .10
    # Bound ill-conditioned source derivatives; the source is a sampled mesh.
    slope_x = tangent.x / max(tangent.y, .05)
    slope_z = tangent.z / max(tangent.y, .05)
    if max(abs(slope_x), abs(slope_z)) > 2:
        clamped += 1
    first = Vector((max(-2, min(2, slope_x)), 1, max(-2, min(2, slope_z)))) * advance
    last = (rings[span + 1][k].co - rings[span - 1][k].co) * (span / 2)
    last.y = max(.5 * advance, min(2 * advance, last.y))
    for index in range(1, span):
        t = index / span
        rings[index][k].co = ((2*t**3 - 3*t*t + 1) * start + (t**3 - 2*t*t + t) * first
                            + (-2*t**3 + 3*t*t) * end + (t**3 - t*t) * last)

changed = [v.index for v in bm.verts if (v.co - before[v.index]).length > 1e-10]
assert len(changed) == (span - 1) * 317
assert all((v.co - before[v.index]).length == 0 for v in source_side)
assert all(v.co.y > .15 for v in rings[1])
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.normal_update()
angles = [math.degrees(e.calc_face_angle()) for e in seam_edges]
angles.sort()
receipt = {
    'parent': 'charizard-tail-r01', 'candidate': 'charizard-tail-r02a',
    'operation': 'Cubic Hermite ribbons from source-side surface tangent to unchanged distal ring',
    'sourceVerticesPreserved': len(protected), 'seamVerticesPreserved': len(seam),
    'changedVertices': len(changed), 'changedVertexIndices': changed,
    'ringCountChanged': span - 1, 'endpointRing': span, 'clampedSourceDerivatives': clamped,
    'firstRingMinimumY': min(v.co.y for v in rings[1]),
    'firstRingBehindCutCount': sum(v.co.y < .15 for v in rings[1]),
    'seamFaceAngleDegrees': {'median': angles[len(angles)//2], 'p90': angles[int(len(angles)*.9)], 'max': max(angles), 'above90': sum(a > 90 for a in angles)},
    'sourceTopologyUnchanged': True,
    'limitations': ['Proximal source root remains unchanged and moderately oval.', 'Head, limbs, UVs, materials, rig and animation remain unfinished.', 'No self-intersection or artistic acceptance is inferred from topology.'],
}
bm.to_mesh(target.data)
bm.free()
target.data.update()
np.savez_compressed(OUT / 'vertex-audit.npz',
    before=np.asarray(before, dtype=np.float32),
    after=np.asarray([v.co[:] for v in target.data.vertices], dtype=np.float32),
    source_face_vertex_indices=np.asarray([i for p in source.data.polygons for i in p.vertices], dtype=np.int32),
    target_face_vertex_indices=np.asarray([i for p in target.data.polygons for i in p.vertices], dtype=np.int32))
bpy.data.scenes['EDIT-charizard-tail-r02a']['status'] = 'Candidate awaiting matched visual and export review'
(OUT / 'patch-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({k: v for k, v in receipt.items() if k != 'changedVertexIndices'}))
