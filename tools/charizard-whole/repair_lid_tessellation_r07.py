"""Cancel opposite, coincident triangle pairs without moving the surviving surface."""
import bpy
import bmesh
import collections
import hashlib
import json
import math
from pathlib import Path

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-head-home-r07' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
report_path = root/'lid-tessellation-repair.json'
assert not report_path.exists()
source = bpy.data.objects['GEO-home-head-lids-manifold-r07']
assert source.data.shape_keys.key_blocks['Smooth_LidJoins_r07'].value == 1
name = 'GEO-home-head-lids-runtime-clean-r07'
assert name not in bpy.data.objects
mesh = bpy.data.meshes.new_from_object(source.evaluated_get(bpy.context.evaluated_depsgraph_get()))
assert not mesh.color_attributes and not mesh.uv_layers
mesh.calc_loop_triangles()
groups = collections.defaultdict(list)
for triangle in mesh.loop_triangles:
    groups[tuple(sorted(triangle.vertices))].append(triangle)

def canonical_cycle(vertices):
    t = tuple(vertices)
    return min(t, t[1:]+t[:1], t[2:]+t[:2])

duplicates = [group for group in groups.values() if len(group) > 1]
assert len(duplicates) == 58
for pair in duplicates:
    assert len(pair) == 2
    assert canonical_cycle(pair[0].vertices) == canonical_cycle(reversed(pair[1].vertices))
retained = [group[0] for group in groups.values() if len(group) == 1]
used = sorted({v for triangle in retained for v in triangle.vertices})
remap = {old: new for new, old in enumerate(used)}
clean = bpy.data.meshes.new(name)
clean.from_pydata([mesh.vertices[v].co[:] for v in used], [],
                  [tuple(remap[v] for v in triangle.vertices) for triangle in retained])
for material in mesh.materials:
    clean.materials.append(material)
for polygon, triangle in zip(clean.polygons, retained):
    parent = mesh.polygons[triangle.polygon_index]
    polygon.material_index = parent.material_index
    polygon.use_smooth = parent.use_smooth
if '.sculpt_mask' in mesh.attributes:
    mask = clean.attributes.new('.sculpt_mask', 'FLOAT', 'POINT')
    for new, old in enumerate(used):
        mask.data[new].value = mesh.attributes['.sculpt_mask'].data[old].value
assert not clean.validate(), 'Repair still requires native mesh correction'
clean.update()
clean.calc_loop_triangles()
bm = bmesh.new()
bm.from_mesh(clean)
pending = set(bm.verts)
components = []
while pending:
    stack = [pending.pop()]
    count = 0
    while stack:
        vertex = stack.pop()
        count += 1
        for edge in vertex.link_edges:
            neighbor = edge.other_vert(vertex)
            if neighbor in pending:
                pending.remove(neighbor)
                stack.append(neighbor)
    components.append(count)
before_volume = sum(mesh.vertices[t.vertices[0]].co.dot(
    mesh.vertices[t.vertices[1]].co.cross(mesh.vertices[t.vertices[2]].co))/6
    for t in mesh.loop_triangles)
report = {
    'status': 'Topology repair; visual and GLB round-trip validation pending',
    'sourceObject': source.name, 'outputObject': name,
    'sourceCheckpoint': str(root/'charizard-home-head-r07-study.blend'),
    'sourceCheckpointSha256': hashlib.sha256((root/'charizard-home-head-r07-study.blend').read_bytes()).hexdigest(),
    'operator': 'Remove both exactly coincident opposite-winding triangles in each duplicate group; compact unused vertices',
    'duplicatePairs': len(duplicates), 'removedTriangles': len(duplicates)*2,
    'removedUnusedVertices': len(mesh.vertices)-len(clean.vertices),
    'removedTriangleVertexPairs': [[list(t.vertices) for t in pair] for pair in duplicates],
    'vertices': len(clean.vertices), 'triangles': len(clean.loop_triangles),
    'components': components,
    'nonmanifoldEdges': sum(not e.is_manifold for e in bm.edges),
    'inconsistentWindingEdges': sum(not e.is_contiguous for e in bm.edges),
    'minimumTriangleArea': min(t.area for t in clean.loop_triangles),
    'finite': all(math.isfinite(c) for v in clean.vertices for c in v.co),
    'volumeBefore': before_volume, 'volumeAfter': bm.calc_volume(signed=True),
    'survivingVertexDisplacement': max((clean.vertices[new].co-mesh.vertices[old].co).length for new,old in enumerate(used)),
    'sourceBounds': [[min(v.co[i] for v in mesh.vertices),max(v.co[i] for v in mesh.vertices)] for i in range(3)],
    'outputBounds': [[min(v.co[i] for v in clean.vertices),max(v.co[i] for v in clean.vertices)] for i in range(3)],
    'scope': 'Local removal of zero-thickness Boolean tessellation folds. No smoothing, remeshing, UV or rig acceptance. Remaining surface intersections require separate review.'
}
assert report['nonmanifoldEdges'] == report['inconsistentWindingEdges'] == 0
assert len(components) == 1 and report['minimumTriangleArea'] > 1e-14 and report['finite']
assert report['survivingVertexDisplacement'] == 0 and report['sourceBounds'] == report['outputBounds']
assert abs(report['volumeBefore']-report['volumeAfter']) < 1e-8
bm.free()
obj = bpy.data.objects.new(name,clean)
source.users_collection[0].objects.link(obj)
obj.matrix_world = source.matrix_world.copy()
obj['status'] = report['scope']
source.hide_render = True
source.hide_set(True)
for other in bpy.context.selected_objects:
    other.select_set(False)
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.data.meshes.remove(mesh)
report_path.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k != 'removedTriangleVertexPairs'}))
